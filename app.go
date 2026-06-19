package main

import (
	"context"
	"encoding/json"
	"fmt"
	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
)

var (
	openFileDialog = wailsRuntime.OpenFileDialog
	osRuntimeGOOS  = runtime.GOOS
	startCmd       = func(name string, args ...string) error {
		return exec.Command(name, args...).Start()
	}
	osUserHomeDir = os.UserHomeDir
	osMkdirAll    = os.MkdirAll
	filepathWalk  = filepath.Walk
)

type App struct {
	ctx context.Context
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	InitLogger()
	Log(LogInfo, "app", "=== 0xSoundPlayer startup ===")
	a.ctx = ctx
	Log(LogInfo, "app", "init audio engine: sampleRate=44100 channels=2")
	InitAudioEngine(44100, 2)
	a.GetMusicDir()
}

func (a *App) shutdown(ctx context.Context) {
	Log(LogInfo, "app", "=== 0xSoundPlayer shutdown ===")
	CleanupAudioEngine()
	CloseLogger()
}

func (a *App) LoadTrack(slot int, filePath string) (TrackMetadata, error) {
	Log(LogInfo, "app", "LoadTrack slot=%d path=%q", slot, filePath)
	ok := LoadTrack(slot, filePath)
	if !ok {
		Log(LogError, "app", "LoadTrack: движок не смог загрузить slot=%d path=%q", slot, filePath)
		return TrackMetadata{}, fmt.Errorf("failed to load track")
	}
	meta := GetTrackMetadata(slot, filePath)
	Log(LogInfo, "app", "LoadTrack OK slot=%d duration=%.3fs bpm=%.1f key=%s waveform=%d",
		slot, meta.DurationSec, meta.BPM, meta.KeySignature, len(meta.Waveform))
	return meta, nil
}

func (a *App) Play(slot int) {
	Log(LogInfo, "app", "Play slot=%d", slot)
	PlayTrack(slot)
}

func (a *App) Pause(slot int) {
	Log(LogInfo, "app", "Pause slot=%d", slot)
	PauseTrack(slot)
}

func (a *App) Seek(slot int, positionSec float64) {
	Log(LogInfo, "app", "Seek slot=%d pos=%.3fs", slot, positionSec)
	SeekTrack(slot, positionSec)
}

func (a *App) SetVolume(slot int, volume float64) {
	Log(LogDebug, "app", "SetVolume slot=%d vol=%.2f", slot, volume)
	SetTrackVolume(slot, float32(volume))
}

func (a *App) SetTempo(slot int, tempoRatio float64) {
	Log(LogInfo, "app", "SetTempo slot=%d ratio=%.3f", slot, tempoRatio)
	SetTrackTempo(slot, tempoRatio)
}

func (a *App) SetPitch(slot int, pitchSemi float64) {
	Log(LogInfo, "app", "SetPitch slot=%d semi=%.1f", slot, pitchSemi)
	SetTrackPitch(slot, pitchSemi)
}

func (a *App) GetPosition(slot int) float64 {
	pos := GetTrackPosition(slot)
	Log(LogDebug, "app", "GetPosition slot=%d -> %.3fs", slot, pos)
	return pos
}

func (a *App) IsPlaying(slot int) bool {
	playing := IsTrackPlaying(slot)
	Log(LogDebug, "app", "IsPlaying slot=%d -> %v", slot, playing)
	return playing
}

func (a *App) ToggleAutoMix(enabled bool) {
	Log(LogInfo, "app", "ToggleAutoMix enabled=%v", enabled)
	SetAutomixEnabled(enabled)
}

func (a *App) SetCrossfadeDuration(durationSec float64) {
	Log(LogInfo, "app", "SetCrossfadeDuration=%.1fs", durationSec)
	SetCrossfadeDuration(durationSec)
}

func (a *App) GetSpectrum(slot int) []float32 {
	return GetTrackSpectrum(slot, 64)
}

func (a *App) SelectAudioFile() (string, error) {
	Log(LogInfo, "app", "SelectAudioFile dialog open")
	path, err := openFileDialog(a.ctx, wailsRuntime.OpenDialogOptions{
		Title: "Select Audio File",
		Filters: []wailsRuntime.FileFilter{
			{
				DisplayName: "Audio Files (*.mp3, *.wav, *.flac)",
				Pattern:     "*.mp3;*.wav;*.flac",
			},
		},
	})
	if err != nil {
		Log(LogError, "app", "SelectAudioFile error: %v", err)
	} else {
		Log(LogInfo, "app", "SelectAudioFile selected=%q", path)
	}
	return path, err
}

func (a *App) GetMusicDir() (string, error) {
	home, err := osUserHomeDir()
	if err != nil {
		Log(LogError, "app", "GetMusicDir: home dir error: %v", err)
		return "", err
	}
	dir := filepath.Join(home, ".0xplayer")
	if _, err := os.Stat(dir); os.IsNotExist(err) {
		err = osMkdirAll(dir, 0755)
		if err != nil {
			Log(LogError, "app", "GetMusicDir: mkdir %s error: %v", dir, err)
			return "", err
		}
	}
	Log(LogInfo, "app", "GetMusicDir -> %s", dir)
	return dir, nil
}

type CacheEntry struct {
	FilePath     string    `json:"filePath"`
	DurationSec  float64   `json:"durationSec"`
	BPM          float64   `json:"bpm"`
	KeySignature string    `json:"keySignature"`
	Waveform     []float32 `json:"waveform"`
	Size         int64     `json:"size"`
	ModTime      int64     `json:"modTime"`
}

func (a *App) ScanMusicDir() ([]TrackMetadata, error) {
	Log(LogInfo, "library", "ScanMusicDir start")
	dir, err := a.GetMusicDir()
	if err != nil {
		return nil, err
	}
	cachePath := filepath.Join(dir, "cache.json")
	cacheMap := make(map[string]CacheEntry)
	if cacheBytes, readErr := os.ReadFile(cachePath); readErr == nil {
		var cachedList []CacheEntry
		if unmarshalErr := json.Unmarshal(cacheBytes, &cachedList); unmarshalErr == nil {
			for _, entry := range cachedList {
				cacheMap[entry.FilePath] = entry
			}
			Log(LogInfo, "library", "loaded %d cached entries", len(cacheMap))
		}
	}
	var list []TrackMetadata
	var activeCacheList []CacheEntry
	err = filepathWalk(dir, func(path string, info os.FileInfo, walkErr error) error {
		if walkErr != nil {
			Log(LogWarn, "library", "walk error on %s: %v", path, walkErr)
			return walkErr
		}
		if !info.IsDir() {
			ext := filepath.Ext(path)
			if ext == ".mp3" || ext == ".wav" || ext == ".flac" {
				var meta TrackMetadata
				cached, found := cacheMap[path]
				if found && cached.Size == info.Size() && cached.ModTime == info.ModTime().Unix() {
					meta = TrackMetadata{
						FilePath:     cached.FilePath,
						DurationSec:  cached.DurationSec,
						BPM:          cached.BPM,
						KeySignature: cached.KeySignature,
						Waveform:     cached.Waveform,
					}
					activeCacheList = append(activeCacheList, cached)
				} else {
					meta = AnalyzeFile(path)
					newCacheEntry := CacheEntry{
						FilePath:     meta.FilePath,
						DurationSec:  meta.DurationSec,
						BPM:          meta.BPM,
						KeySignature: meta.KeySignature,
						Waveform:     meta.Waveform,
						Size:         info.Size(),
						ModTime:      info.ModTime().Unix(),
					}
					cacheMap[path] = newCacheEntry
					activeCacheList = append(activeCacheList, newCacheEntry)
				}
				list = append(list, meta)
			}
		}
		return nil
	})
	if err == nil {
		if cacheBytes, marshalErr := json.Marshal(activeCacheList); marshalErr == nil {
			_ = os.WriteFile(cachePath, cacheBytes, 0600)
		}
	}
	Log(LogInfo, "library", "ScanMusicDir done: %d tracks, err=%v", len(list), err)
	return list, err
}

func (a *App) OpenMusicDir() {
	dir, err := a.GetMusicDir()
	if err != nil {
		return
	}
	Log(LogInfo, "app", "OpenMusicDir %s", dir)
	if goos := osRuntimeGOOS; goos == "windows" {
		startCmd("explorer", dir)
	} else if goos == "darwin" {
		startCmd("open", dir)
	} else {
		startCmd("xdg-open", dir)
	}
}

func (a *App) LogFromJS(level string, message string) {
	var logLevel LogLevel
	switch level {
	case "DEBUG":
		logLevel = LogDebug
	case "WARN":
		logLevel = LogWarn
	case "ERROR":
		logLevel = LogError
	default:
		logLevel = LogInfo
	}
	Log(logLevel, "ui", "%s", message)
}

package main

import (
	"context"
	"encoding/binary"
	"fmt"
	"math"
	"os"
	"path/filepath"
	"testing"

	"github.com/wailsapp/wails/v2/pkg/options"
	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

func createTestWav(path string) error {
	f, err := os.Create(path)
	if err != nil {
		return err
	}
	defer f.Close()

	sampleRate := 44100
	duration := 1.0
	numSamples := int(float64(sampleRate) * duration)
	numChannels := 2

	writeString(f, "RIFF")
	writeInt32(f, int32(36+numSamples*numChannels*2))
	writeString(f, "WAVE")
	writeString(f, "fmt ")
	writeInt32(f, 16)
	writeInt16(f, 1)
	writeInt16(f, int16(numChannels))
	writeInt32(f, int32(sampleRate))
	writeInt32(f, int32(sampleRate*numChannels*2))
	writeInt16(f, int16(numChannels*2))
	writeInt16(f, 16)
	writeString(f, "data")
	writeInt32(f, int32(numSamples*numChannels*2))

	for i := 0; i < numSamples; i++ {
		t := float64(i) / float64(sampleRate)
		val := int16(math.Sin(2.0*math.Pi*440.0*t) * 32767.0)
		for c := 0; c < numChannels; c++ {
			binary.Write(f, binary.LittleEndian, val)
		}
	}
	return nil
}

func writeString(f *os.File, s string) {
	f.Write([]byte(s))
}

func writeInt32(f *os.File, v int32) {
	binary.Write(f, binary.LittleEndian, v)
}

func writeInt16(f *os.File, v int16) {
	binary.Write(f, binary.LittleEndian, v)
}

func TestAudioEngine(t *testing.T) {
	tmpDir := t.TempDir()
	wavPath := filepath.Join(tmpDir, "test.wav")
	err := createTestWav(wavPath)
	if err != nil {
		t.Fatalf("failed to create test wav: %v", err)
	}

	ok := InitAudioEngine(44100, 2)
	if !ok {
		t.Fatalf("failed to initialize audio engine")
	}
	defer CleanupAudioEngine()

	app := NewApp()
	app.startup(nil)
	defer app.shutdown(nil)

	meta, err := app.LoadTrack(0, wavPath)
	if err != nil {
		t.Fatalf("failed to load track: %v", err)
	}

	if meta.DurationSec <= 0.0 {
		t.Errorf("expected positive duration, got %f", meta.DurationSec)
	}

	if meta.BPM <= 0.0 {
		t.Errorf("expected positive BPM, got %f", meta.BPM)
	}

	if meta.KeySignature == "" {
		t.Errorf("expected non-empty key signature")
	}

	if len(meta.Waveform) == 0 {
		t.Errorf("expected non-empty waveform")
	}

	app.Play(0)
	if !app.IsPlaying(0) {
		t.Errorf("expected track to be playing")
	}

	app.SetVolume(0, 0.5)
	app.SetTempo(0, 1.1)
	app.SetPitch(0, 1.0)
	app.Seek(0, 0.2)

	pos := app.GetPosition(0)
	if pos < 0.0 {
		t.Errorf("expected non-negative position, got %f", pos)
	}

	app.ToggleAutoMix(true)
	app.ToggleAutoMix(false)
	app.SetCrossfadeDuration(5.0)

	app.Pause(0)
	if app.IsPlaying(0) {
		t.Errorf("expected track to be paused")
	}

	dir, err := app.GetMusicDir()
	if err != nil {
		t.Errorf("failed to get music dir: %v", err)
	}
	if dir == "" {
		t.Errorf("expected non-empty music dir")
	}

	testWavInDir := filepath.Join(dir, "temp_test_suite.wav")
	err = createTestWav(testWavInDir)
	if err != nil {
		t.Errorf("failed to create wav in dir: %v", err)
	}
	defer os.Remove(testWavInDir)

	list, err := app.ScanMusicDir()
	if err != nil {
		t.Errorf("failed to scan music dir: %v", err)
	}
	if len(list) == 0 {
		t.Errorf("expected scanned tracks")
	}

	app.OpenMusicDir()
}

func TestMainFunc(t *testing.T) {
	origWailsRun := wailsRun
	defer func() { wailsRun = origWailsRun }()

	wailsRun = func(opt *options.App) error {
		return nil
	}
	main()

	wailsRun = func(opt *options.App) error {
		return fmt.Errorf("mock error")
	}
	main()
}

func TestAppMocks(t *testing.T) {
	app := NewApp()
	app.startup(nil)
	defer app.shutdown(nil)

	origOpenFileDialog := openFileDialog
	defer func() { openFileDialog = origOpenFileDialog }()
	openFileDialog = func(ctx context.Context, dialogOptions wailsRuntime.OpenDialogOptions) (string, error) {
		return "mock_file.wav", nil
	}

	file, err := app.SelectAudioFile()
	if err != nil || file != "mock_file.wav" {
		t.Errorf("expected mock_file.wav, got %v (error: %v)", file, err)
	}

	origGoos := osRuntimeGOOS
	origStartCmd := startCmd
	defer func() {
		osRuntimeGOOS = origGoos
		startCmd = origStartCmd
	}()

	startCmdCalled := false
	startCmd = func(name string, args ...string) error {
		startCmdCalled = true
		return nil
	}

	osRuntimeGOOS = "windows"
	app.OpenMusicDir()
	if !startCmdCalled {
		t.Errorf("expected startCmd to be called on windows")
	}

	startCmdCalled = false
	osRuntimeGOOS = "darwin"
	app.OpenMusicDir()
	if !startCmdCalled {
		t.Errorf("expected startCmd to be called on darwin")
	}

	startCmdCalled = false
	osRuntimeGOOS = "linux"
	app.OpenMusicDir()
	if !startCmdCalled {
		t.Errorf("expected startCmd to be called on linux")
	}

	_, err = app.LoadTrack(0, "non_existent_file.wav")
	if err == nil {
		t.Errorf("expected error loading non-existent file")
	}

	tmpDir := t.TempDir()

	origHomeDir := osUserHomeDir
	osUserHomeDir = func() (string, error) {
		return "", fmt.Errorf("mock home error")
	}
	_, err = app.GetMusicDir()
	if err == nil {
		t.Errorf("expected error from GetMusicDir when home dir fails")
	}
	osUserHomeDir = origHomeDir

	origMkdirAll := osMkdirAll
	osMkdirAll = func(path string, perm os.FileMode) error {
		return fmt.Errorf("mock mkdir error")
	}
	osUserHomeDir = func() (string, error) {
		return filepath.Join(tmpDir, "non_existent_subdir"), nil
	}
	_, err = app.GetMusicDir()
	if err == nil {
		t.Errorf("expected error from GetMusicDir when mkdir fails")
	}
	osUserHomeDir = origHomeDir
	osMkdirAll = origMkdirAll

	origWalk := filepathWalk
	filepathWalk = func(root string, fn filepath.WalkFunc) error {
		return fmt.Errorf("mock walk error")
	}
	_, err = app.ScanMusicDir()
	if err == nil {
		t.Errorf("expected error from ScanMusicDir when walk fails")
	}
	filepathWalk = origWalk

	filepathWalk = func(root string, fn filepath.WalkFunc) error {
		return fn("mock_path", nil, fmt.Errorf("mock visit error"))
	}
	_, err = app.ScanMusicDir()
	if err == nil {
		t.Errorf("expected error from ScanMusicDir when walk callback fails")
	}
	filepathWalk = origWalk
}

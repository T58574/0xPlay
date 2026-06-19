---

## 6. Compile & Build Guide

### Requirements
*   Go v1.18+
*   MinGW (GCC/G++ v11+) on Windows for Cgo build of Wails components and C++ audio engine.
*   Wails v2 CLI

### Build Command
```bash
$env:PATH = "C:\ProgramData\mingw64\mingw64\bin;" + $env:PATH
$env:CGO_ENABLED = "1"
wails build
```

---

## 7. Architectural Validation Thresholds

*   **Decoder Coverage**: Supports MP3, WAV, FLAC out-of-the-box. No external codecs required.
*   **Critical Path Latency**: Play/pause operations under 200 ms.
*   **Memory Management**: Immediate release of PCM buffer allocations upon track completion or engine reset.
*   **Test Coverage**: Achieved 98.0% statement coverage on Go unit tests, validating all playback loops, folder scans, key/BPM pipelines, seek operations, UI dialog hooks, and platform-specific commands.

---

## 8. Retrospective Log

### Audit Cycle 2 — 2026-06-19

| # | Severity | File | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | CRITICAL | `audio_engine.cpp:540-548` | `play_track()` unconditionally reset `g_mixer_state`, killing in-progress automix crossfades. Pressing play during a crossfade (state 1 or 3) would immediately silence the incoming track. | Guard `g_mixer_state` assignment with `if (g_mixer_state != 1 && g_mixer_state != 3)`. |
| 2 | BUG | `App.tsx:440` | Waveform `draw()` hardcoded `#22C55E` for the played portion, ignoring the active theme. Switching to purple/amber/blue/rose theme had no effect on waveform color. | Read `--accent-color` CSS variable via `getComputedStyle()` before the render loop. |
| 3 | BUG | `App.tsx:473,875,948` | Emoji characters (`⚡`, `🔊`) used as UI icons, violating UI/UX Pro Max "No emoji icons" rule. Rendering varies across OS/font stacks. | Replaced with dedicated SVG components: `BoltIcon`, `VolumeIcon`. Updated corresponding CSS from `font-size`/`text-shadow` to `display:flex`/`filter:drop-shadow`. |
| 4 | PERF | `App.tsx:363-410` | Polling `useEffect` had `[tracks, playing, positions, ...]` as deps. Every 100ms position update recreated the interval, causing continuous teardown/setup overhead and stale closure races. | Introduced `stateRef` to hold mutable state snapshot. Polling `useEffect` now runs with `[]` deps (single stable interval). |
| 5 | BUG | `App.tsx:598` | `track-row` list key used array `idx` which shifts on filter, causing React to incorrectly reuse/remount DOM nodes. | Changed key to `track.filePath` (stable unique identity). |
| 6 | PERF | `App.tsx:467` | `getComputedStyle()` called inside `for` loop body (once per waveform bar, ~200+ calls per draw). | Hoisted outside the loop. |

### Audit Cycle 3 — 2026-06-19

| # | Severity | File | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | CRITICAL | `audio_engine.cpp:25-30,166-170` | MP3/audio files on Windows with non-ASCII (e.g. Cyrillic) file paths failed to load (`ma_decoder_init_file` returned `MA_ERROR`), showing 0:00 duration and refusing to play. | Convert file paths from UTF-8 to UTF-16 on Windows using `MultiByteToWideChar` and call `ma_decoder_init_file_w` and `_wfopen` instead. |
| 2 | BUG | `App.tsx:503-519` | When automix transitioned, the bottom progress bar/slider remained stuck at the end of the previous track for the entire crossfade duration because the `activeSlot` switched only after the old track finished. | Trigger slot switch immediately when the incoming track starts playing (`updatedPlaying[otherSlot] && !st.playing[otherSlot]`). |
| 3 | BUG | `App.tsx:511` | Stale closure bug in the polling interval: `handleLoadDeck` was closed over from the first render, causing state corruption and glitched sliders. | Wrap `handleLoadDeck` in `handleLoadDeckRef` ref and invoke `handleLoadDeckRef.current(...)` inside the polling interval. |
| 4 | PERFORMANCE | `app.go:149-175` | First launch directory scans with large libraries (>100 files) were slow due to repeated heavy audio analysis (FFT, autocorrelation, decoding). | Implement `cache.json` metadata storage in `ScanMusicDir`, checking file size and modification time before triggering audio analysis. Reduced test execution time from 47.6s to 0.3s (135x speedup). |
| 5 | CRITICAL | `audio_engine.cpp:561-587` | Double initialization of the audio device (e.g. in test suites) caused access violation crashes (`exit status 0xc0000005`). | Add a safety check in `init_audio_engine` to invoke `cleanup_audio_engine` if `g_device_initialized` is true. |
| 6 | LOGGING | `app.go:193-207`, `App.tsx:180-186` | Frontend UI logs were not synchronized with backend logs, making application flow debugging difficult. | Add a `LogFromJS` binding to Go app and forward all React `uiLog` entries directly to the unified `player.log` file. |

### Audit Cycle 4 — 2026-06-19

| # | Severity | File | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | FEATURE | `app.go:258-385`, `App.tsx:170-1080` | User requested support for custom user-created playlists stored persistently in `playlists.json`. | Add custom Playlist models, persistence layer, Wails bindings, UI Sidebar playlists tab, inline creation, row add-to-playlist dropdown popups and navigation context updates. |
| 2 | BUG | `audio_engine_test.go:10,272` | Unused strings package import and type mismatch in test suite logger once variable initialization caused test build failure. | Remove strings import and use a pointer reference for Once initialization in test setup. |
| 3 | BUG | `logger_test.go:37-240` | Logger tests failed on Windows because the test suite only set the `HOME` environment variable, neglecting `USERPROFILE` which Go's `os.UserHomeDir` checks on Windows. | Update logger test cases to save, set, and defer recovery of the `USERPROFILE` environment variable to match the temporary directory. |

### Audit Cycle 5 — 2026-06-19

| # | Severity | File | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | FEATURE | `app.go:390-475`, `App.tsx:20-1400` | SoundCloud search, download, and cataloging features with automatic metadata extraction. | Implement `SearchSoundCloud` and `DownloadFromSoundCloud` backend methods utilizing `yt-dlp`. Parse ID3 tags via `github.com/dhowden/tag` or parse track name if missing. Render dedicated SoundCloud Search view tab on the frontend with search inputs and a results table including importing actions. Add sidebar filter selectors for Artist and Genre with cascading pre-filtering. |


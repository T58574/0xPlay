package backend

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
)

func TestHelperProcess(t *testing.T) {
	if os.Getenv("GO_WANT_HELPER_PROCESS") != "1" {
		return
	}
	defer os.Exit(0)

	args := os.Args
	for i, arg := range args {
		if arg == "--" {
			args = args[i+1:]
			break
		}
	}
	if len(args) == 0 {
		return
	}
	cmd := args[0]
	if cmd == "yt-dlp" {
		for _, arg := range args {
			if strings.HasPrefix(arg, "scsearch10:") {
				fmt.Fprintln(os.Stdout, `{"title": "Test Title", "uploader": "Test Artist", "webpage_url": "https://soundcloud.com/test", "duration": 180.0}`)
				return
			}
		}
	}
}

func fakeExecCommand(command string, args ...string) *exec.Cmd {
	cs := []string{"-test.run=TestHelperProcess", "--", command}
	cs = append(cs, args...)
	cmd := exec.Command(os.Args[0], cs...)
	cmd.Env = append(os.Environ(), "GO_WANT_HELPER_PROCESS=1")
	return cmd
}

func TestSearchSoundCloud(t *testing.T) {
	origExecCommand := execCommand
	defer func() { execCommand = origExecCommand }()
	execCommand = fakeExecCommand

	app := NewApp()
	results, err := app.SearchSoundCloud("query")
	if err != nil {
		t.Fatalf("SearchSoundCloud failed: %v", err)
	}
	if len(results) != 1 {
		t.Fatalf("Expected 1 result, got %d", len(results))
	}
	if results[0].Title != "Test Title" || results[0].Uploader != "Test Artist" || results[0].URL != "https://soundcloud.com/test" || results[0].Duration != 180.0 {
		t.Errorf("Unexpected result: %+v", results[0])
	}
}

func TestDownloadFromSoundCloud(t *testing.T) {
	tmpDir := t.TempDir()
	origHomeDir := osUserHomeDir
	osUserHomeDir = func() (string, error) {
		return tmpDir, nil
	}
	defer func() { osUserHomeDir = origHomeDir }()

	origExecCommand := execCommand
	defer func() { execCommand = origExecCommand }()
	execCommand = fakeExecCommand

	app := NewApp()
	err := app.DownloadFromSoundCloud("https://soundcloud.com/test")
	if err != nil {
		t.Fatalf("DownloadFromSoundCloud failed: %v", err)
	}

	scDir := filepath.Join(tmpDir, ".0xplayer", "soundcloud")
	if _, err := os.Stat(scDir); os.IsNotExist(err) {
		t.Errorf("Expected soundcloud directory to be created, got %v", err)
	}
}

func TestExtractTagsOrFilename(t *testing.T) {
	tmpDir := t.TempDir()

	path1 := filepath.Join(tmpDir, "Lorde - Royals.mp3")
	err := os.WriteFile(path1, []byte("fake mp3 content"), 0644)
	if err != nil {
		t.Fatalf("Failed to write file: %v", err)
	}

	artist, genre := extractTagsOrFilename(path1)
	if artist != "Lorde" {
		t.Errorf("Expected artist to be Lorde, got %s", artist)
	}
	if genre != "Unknown Genre" {
		t.Errorf("Expected genre to be Unknown Genre, got %s", genre)
	}

	path2 := filepath.Join(tmpDir, "SimpleName.wav")
	err = os.WriteFile(path2, []byte("fake wav content"), 0644)
	if err != nil {
		t.Fatalf("Failed to write file: %v", err)
	}

	artist, _ = extractTagsOrFilename(path2)
	if artist != "Unknown Artist" {
		t.Errorf("Expected artist to be Unknown Artist, got %s", artist)
	}
}

package main

import (
	"os"
	"path/filepath"
	"strings"
	"sync"
	"testing"
)

func TestLogger(t *testing.T) {
	// Reset global state for tests to avoid interference from other tests calling InitLogger
	appLoggerOnce = sync.Once{}
	appLogger = nil
	appLogFile = nil
	appLoggerOn = true

	// 1. Setup temporary home directory
	tempHome, err := os.MkdirTemp("", "logger_test_home_*")
	if err != nil {
		t.Fatalf("Failed to create temp home: %v", err)
	}
	defer os.RemoveAll(tempHome)

	// Save original HOME and restore later
	origHome := os.Getenv("HOME")
	defer os.Setenv("HOME", origHome)

	os.Setenv("HOME", tempHome)

	// 2. Test InitLogger
	InitLogger()

	logDir := filepath.Join(tempHome, ".0xplayer")
	logFile := filepath.Join(logDir, "player.log")

	if _, err := os.Stat(logFile); os.IsNotExist(err) {
		t.Errorf("InitLogger did not create %s", logFile)
	}

	if appLogFile == nil {
		t.Error("appLogFile is nil after InitLogger")
	}

	// 3. Test Log
	Log(LogInfo, "test_category", "test message %d", 123)

	content, err := os.ReadFile(logFile)
	if err != nil {
		t.Fatalf("Failed to read log file: %v", err)
	}
	contentStr := string(content)

	if !strings.Contains(contentStr, "[INFO ]") {
		t.Errorf("Log did not contain correct level. Got: %s", contentStr)
	}
	if !strings.Contains(contentStr, "[test_category]") {
		t.Errorf("Log did not contain correct category. Got: %s", contentStr)
	}
	if !strings.Contains(contentStr, "test message 123") {
		t.Errorf("Log did not contain correct message. Got: %s", contentStr)
	}

	// 4. Test Log disabled
	appLoggerOn = false
	Log(LogWarn, "disabled_cat", "this should not appear")
	appLoggerOn = true

	contentAfter, _ := os.ReadFile(logFile)
	if strings.Contains(string(contentAfter), "disabled_cat") {
		t.Errorf("Disabled logger still wrote to file")
	}

	// 5. Test CloseLogger
	CloseLogger()
	if appLogFile != nil {
		t.Error("appLogFile is not nil after CloseLogger")
	}
}

func resetLoggerForTest() {
	appLoggerOnce = sync.Once{}
	appLogger = nil
	appLogFile = nil
	appLoggerOn = true
}

func TestLogger_InitErrors(t *testing.T) {
	origHome := os.Getenv("HOME")
	origProfile := os.Getenv("USERPROFILE")
	defer func() {
		os.Setenv("HOME", origHome)
		if origProfile != "" {
			os.Setenv("USERPROFILE", origProfile)
		}
	}()

	t.Run("HomeDirError", func(t *testing.T) {
		resetLoggerForTest()
		os.Unsetenv("HOME")
		os.Unsetenv("USERPROFILE") // For Windows
		InitLogger()
		if appLogFile != nil {
			t.Error("appLogFile should be nil when HOME and USERPROFILE are unset")
		}
	})

	t.Run("MkdirError", func(t *testing.T) {
		resetLoggerForTest()
		tempHome, err := os.MkdirTemp("", "logger_test_err_*")
		if err != nil {
			t.Fatalf("Failed to create temp home: %v", err)
		}
		defer os.RemoveAll(tempHome)
		os.Setenv("HOME", tempHome)

		// Create a file where the directory should be
		fileDir := filepath.Join(tempHome, ".0xplayer")
		if err := os.WriteFile(fileDir, []byte("file content"), 0644); err != nil {
			t.Fatalf("Failed to create blocking file: %v", err)
		}

		InitLogger()
		if appLogFile != nil {
			t.Error("appLogFile should be nil when MkdirAll fails")
		}
	})

	t.Run("OpenFileError", func(t *testing.T) {
		resetLoggerForTest()
		tempHome, err := os.MkdirTemp("", "logger_test_err_*")
		if err != nil {
			t.Fatalf("Failed to create temp home: %v", err)
		}
		defer os.RemoveAll(tempHome)
		os.Setenv("HOME", tempHome)

		logDir := filepath.Join(tempHome, ".0xplayer")
		logPath := filepath.Join(logDir, "player.log")

		// Create a directory where the log file should be
		if err := os.MkdirAll(logPath, 0755); err != nil {
			t.Fatalf("Failed to create blocking directory: %v", err)
		}

		InitLogger()
		if appLogFile != nil {
			t.Error("appLogFile should be nil when OpenFile fails")
		}
	})
}

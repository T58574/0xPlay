package main

import (
	"fmt"
	"testing"

	"github.com/wailsapp/wails/v2/pkg/options"
)

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

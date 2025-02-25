package main

import (
	"context"
	"log/slog"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main() {
	slog.Info("starting CLI...")
	ctx, cancel := context.WithCancelCause(context.Background())
	endCh := make(chan os.Signal, 1)
	signal.Notify(endCh, syscall.SIGINT, syscall.SIGTERM, os.Kill)

	go func() {
		time.Sleep(time.Second * 10)
		cancel(nil)
	}()

	select {
	case <-endCh:
		cancel(nil)
	case <-ctx.Done():
		slog.Debug("shutting down. Good bye")
	}
}

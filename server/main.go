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
	slog.Info("starting server...")
	ctx, cancel := context.WithCancelCause(context.Background())
	endCh := make(chan os.Signal, 1)
	signal.Notify(endCh, syscall.SIGINT, syscall.SIGTERM, os.Kill)

	go func() {
		defer cancel(nil)
		time.Sleep(time.Second * 10)
	}()

	select {
	case <-endCh:
		cancel(nil)
		slog.Debug("shutting down. Good bye")
	case <-ctx.Done():
		slog.Debug("shutting down. Good bye")
	}
}

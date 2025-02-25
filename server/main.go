package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/brinestone/envo/server/api"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func main() {
	godotenv.Load()
	ctx, cancel := context.WithCancelCause(context.Background())
	endCh := make(chan os.Signal, 1)
	signal.Notify(endCh, syscall.SIGINT, syscall.SIGTERM)

	_api, err := api.NewWebApi(api.WebApiConfig{
		Addr:         fmt.Sprintf(":%s", os.Getenv("PORT")),
		GlobalPrefix: os.Getenv("GLOBAL_PREFIX_PATH"),
		DatabaseUrl:  os.Getenv("DB_URL"),
		Context:      ctx,
	})

	if err != nil {
		cancel(err)
	}

	select {
	case <-endCh:
		cancel(nil)
		return
	case err = <-_api.Run():
		if err != nil {
			log.Fatal(err)
		}
		return
	case _, ok := <-ctx.Done():
		if !ok {
			log.Fatal(ctx.Err())
		}
		return
	}
}

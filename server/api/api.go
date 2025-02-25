package api

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/brinestone/envo/server/handlers"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type WebApiConfig struct {
	Addr         string
	GlobalPrefix string
	DatabaseUrl  string
	Context      context.Context
	Audiences    []string
}

type WebApi interface {
	Stop()
	Run() <-chan error
}

type webapi struct {
	WebApiConfig
	engine *gin.Engine
	server *http.Server
	db     *sql.DB
}

func (w *webapi) Stop() {
	w.server.Close()
}

func (w *webapi) Run() (abort <-chan error) {
	srv := &http.Server{
		Handler: w.engine,
		Addr:    w.Addr,
	}
	errCh := make(chan error)
	startCh := make(chan struct{})
	abort = errCh
	go func() {
		slog.Info("Connecting to DB")
		db, err := sql.Open("postgres", w.DatabaseUrl)
		if err != nil {
			errCh <- err
			close(errCh)
			return
		}

		slog.Info("Connected to DB")
		defer func() {
			err := db.Close()
			if err != nil {
				panic(err)
			}
		}()
		w.db = db
		startCh <- struct{}{}
		if err := srv.ListenAndServe(); err != nil {
			log.Printf("listen: %s\n", err)
			errCh <- err
			close(errCh)
		}
	}()

	select {
	case v := <-errCh:
		close(startCh)
		panic(v)
	case <-startCh:
		log.Printf("API started on %s", w.Addr)
		w.server = srv
		close(startCh)
	}
	return
}

func NewWebApi(config WebApiConfig) (api WebApi, err error) {

	if len(config.DatabaseUrl) == 0 {
		err = fmt.Errorf("database url is not defined")
		return
	}

	gin.SetMode(os.Getenv("GIN_MODE"))
	e := gin.Default()
	api = &webapi{
		WebApiConfig: config,
		engine:       e,
	}

	// configure middleware
	e.Use(cors.New(cors.Config{
		AllowMethods:     []string{"PUT", "PATCH"},
		AllowHeaders:     []string{"Origin"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		AllowOriginFunc: func(origin string) bool {
			if os.Getenv("GIN_MODE") != "debug" {
				return true
			} else {
				for _, v := range config.Audiences {
					if v != origin {
						continue
					}
					return true
				}
				return false
			}
		},
		MaxAge: 12 * time.Hour,
	}))

	rootRouter := e.Group(config.GlobalPrefix)
	protectedRouter := e.Group(config.GlobalPrefix, JwtMiddleware)
	authRouter := rootRouter.Group("auth")
	mapPublicEndpoints(rootRouter)
	mapProtectedEndpoints(protectedRouter)

	mapAuthEndpoints(authRouter)
	return
}

func mapAuthEndpoints(g *gin.RouterGroup) {
	g.GET("oauth/google", handlers.HandleGoogleOauth)
	g.GET("oauth/google/callback", handlers.HandleGoogleOauthCallback)
}

func mapProtectedEndpoints(g *gin.RouterGroup) {
	g.GET("_analytics", handlers.Analytics)
}

func mapPublicEndpoints(g *gin.RouterGroup) {
	g.GET("_healthz", handlers.Health)
}

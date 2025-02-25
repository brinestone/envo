package api

import (
	"log/slog"

	"github.com/gin-gonic/gin"
)

var JwtMiddleware = func(c *gin.Context) {
	slog.Info("checking JWT")
	c.Next()
}

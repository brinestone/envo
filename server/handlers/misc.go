package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func Health(g *gin.Context) {
	g.JSON(http.StatusOK, gin.H{"ok": true})
}

func Analytics(g *gin.Context) {
	g.Status(http.StatusOK)
	g.JSON(http.StatusOK, gin.H{"analytics": 100})
}

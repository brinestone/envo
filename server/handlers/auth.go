package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net/http"
	"net/url"
	"os"

	"github.com/gin-gonic/gin"
)

// HandleGoogleOauthCallback completes the Oauth2 sign in process with Google
func HandleGoogleOauthCallback(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"state": c.Query("state"),
		"code":  c.Query("code"),
		"scope": c.Query("scope"),
	})
}

// HandleGoogleOauth handles the initiation of a Google oauth2 session
func HandleGoogleOauth(c *gin.Context) {
	scope := url.QueryEscape("email profile")
	buf := make([]byte, 5)
	rand.Reader.Read(buf)

	state := url.QueryEscape(hex.EncodeToString(buf))
	redirectUri := url.QueryEscape(fmt.Sprintf("%s/auth/oauth/google/callback", os.Getenv("BASE_URL")))
	clientId := os.Getenv("GOOGLE_OAUTH_CLIENT_ID")
	var url = fmt.Sprintf(`https://accounts.google.com/o/oauth2/v2/auth?scope=%s&access_type=offline&include_granted_scopes=true&response_type=code&state=%s&redirect_uri=%s&client_id=%s`, scope, state, redirectUri, clientId)

	c.Redirect(http.StatusMovedPermanently, url)
}

package auth

import (
	"database/sql"
	"errors"
	"net/http"
	"strings"
	"time"

	formatter "github.com/DeveloperAromal/ieeesbvast/pkg/formate"
	"github.com/gin-gonic/gin"
)

type handler struct {
	srv Service
}

func NewHandler(srv Service) *handler {
	return &handler{
		srv: srv,
	}
}

var response = formatter.NewRepository()

func (hdlr *handler) CreateEventUsers(c *gin.Context) {

	eventID := c.Param("eventID")

	err := hdlr.srv.CreateEventUser(c.Request.Context(), eventID)
	if err != nil {
		response.Error(
			c.Writer,
			false,
			http.StatusInternalServerError,
			"Unexpected error occured",
		)
		return
	}

	response.Success(
		c.Writer,
		true,
		http.StatusOK,
		nil,
		"Successfully created user",
	)
}

func (hdlr *handler) LoginUsers(c *gin.Context) {

	var cred LoginUserModel
	const sessionDuration = 7 * 24 * time.Hour

	if err := c.ShouldBindJSON(&cred); err != nil {
		response.Error(
			c.Writer,
			false,
			http.StatusBadRequest,
			"Bad request",
		)
		return
	}

	token, err := hdlr.srv.LoginUser(c.Request.Context(), cred)
	if err != nil {
		response.Error(
			c.Writer,
			false,
			http.StatusInternalServerError,
			"Unexpected error occured"+err.Error(),
		)
		return
	}

	secureCookie := c.Request.TLS != nil || isHTTPSRequest(c.Request)
	if secureCookie {
		c.SetSameSite(http.SameSiteNoneMode)
	} else {
		c.SetSameSite(http.SameSiteLaxMode)
	}

	c.SetCookie(
		"session_token",
		token,
		int(sessionDuration.Seconds()),
		"/",
		"",
		secureCookie,
		true,
	)

	response.Success(
		c.Writer,
		true,
		http.StatusOK,
		nil,
		"Successfully logged in",
	)
}

func isHTTPSRequest(request *http.Request) bool {
	forwardedProto := strings.TrimSpace(strings.Split(request.Header.Get("X-Forwarded-Proto"), ",")[0])
	if strings.EqualFold(forwardedProto, "https") {
		return true
	}

	if strings.Contains(strings.ToLower(request.Header.Get("Forwarded")), "proto=https") {
		return true
	}

	origin := strings.TrimSpace(strings.Split(request.Header.Get("Origin"), ",")[0])
	return strings.HasPrefix(strings.ToLower(origin), "https://")
}

func (hdlr *handler) GetUserDetails(c *gin.Context) {

	token, err := c.Cookie("session_token")

	if err != nil {
		response.Error(
			c.Writer,
			false,
			http.StatusBadRequest,
			"Bad request",
		)
		return
	}

	user, err := hdlr.srv.FindUserSession(c.Request.Context(), token)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			response.Error(
				c.Writer,
				false,
				http.StatusUnauthorized,
				"Session expired or invalid; please log in again",
			)
			return
		}

		response.Error(
			c.Writer,
			false,
			http.StatusInternalServerError,
			"Unexpected error occured"+err.Error(),
		)
		return
	}

	response.Success(
		c.Writer,
		true,
		http.StatusOK,
		user,
		"Successfully fetched user",
	)
}

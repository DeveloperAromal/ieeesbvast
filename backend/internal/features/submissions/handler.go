package submissions

import (
	"database/sql"
	"errors"
	"log"
	"mime/multipart"
	"net/http"
	"strings"

	auth "github.com/DeveloperAromal/ieeesbvast/internal/features/auth"
	formatter "github.com/DeveloperAromal/ieeesbvast/pkg/formate"
	"github.com/gin-gonic/gin"
)

type handler struct {
	service Service
	auth    auth.Service
}

func NewHandler(service Service, authService auth.Service) *handler {
	return &handler{service: service, auth: authService}
}

var response = formatter.NewRepository()

func sessionToken(c *gin.Context) (string, error) {
	authorization := strings.TrimSpace(c.GetHeader("Authorization"))
	if len(authorization) > len("Bearer ") && strings.EqualFold(authorization[:len("Bearer ")], "Bearer ") {
		if token := strings.TrimSpace(authorization[len("Bearer "):]); token != "" {
			return token, nil
		}
	}

	if token, err := c.Cookie("session_token"); err == nil && token != "" {
		return token, nil
	}

	return "", errors.New("session token is required")
}

func (h *handler) userID(c *gin.Context) (string, bool) {
	token, err := sessionToken(c)
	if err != nil {
		response.Error(c.Writer, false, http.StatusUnauthorized, "Authentication required")
		return "", false
	}
	session, err := h.auth.FindUserSession(c.Request.Context(), token)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			response.Error(c.Writer, false, http.StatusUnauthorized, "Session expired or invalid")
			return "", false
		}
		log.Printf("submission authentication lookup failed: %v", err)
		response.Error(c.Writer, false, http.StatusInternalServerError, "Authentication service unavailable")
		return "", false
	}
	if session.User.ID == "" {
		response.Error(c.Writer, false, http.StatusUnauthorized, "Session user not found")
		return "", false
	}
	return session.User.ID, true
}

func (h *handler) Get(c *gin.Context) {
	userID, ok := h.userID(c)
	if !ok {
		return
	}
	submission, err := h.service.Get(c.Request.Context(), userID, c.Param("eventId"))
	if errors.Is(err, sql.ErrNoRows) {
		response.Success(c.Writer, true, http.StatusOK, nil, "No submission found")
		return
	}
	if err != nil {
		response.Error(c.Writer, false, http.StatusInternalServerError, "Failed to fetch submission")
		return
	}
	response.Success(c.Writer, true, http.StatusOK, submission, "Submission fetched successfully")
}

func (h *handler) Draft(c *gin.Context) {
	userID, ok := h.userID(c)
	if !ok {
		return
	}
	form, err := c.MultipartForm()
	if err != nil && !errors.Is(err, http.ErrNotMultipart) {
		response.Error(c.Writer, false, http.StatusBadRequest, "Invalid submission files")
		return
	}
	var headers []*multipart.FileHeader
	if form != nil {
		headers = form.File["files"]
	}
	submission, err := h.service.SaveDraft(c.Request.Context(), userID, c.Param("eventId"), headers)
	if errors.Is(err, ErrAlreadySubmitted) {
		response.Error(c.Writer, false, http.StatusConflict, err.Error())
		return
	}
	if err != nil {
		response.Error(c.Writer, false, http.StatusInternalServerError, "Failed to save draft")
		return
	}
	response.Success(c.Writer, true, http.StatusOK, submission, "Draft saved successfully")
}

func (h *handler) Submit(c *gin.Context) {
	userID, ok := h.userID(c)
	if !ok {
		return
	}
	submission, err := h.service.Submit(c.Request.Context(), userID, c.Param("eventId"))
	if errors.Is(err, ErrAlreadySubmitted) {
		response.Error(c.Writer, false, http.StatusConflict, err.Error())
		return
	}
	if err != nil {
		response.Error(c.Writer, false, http.StatusBadRequest, "Save a draft with files before submitting")
		return
	}
	response.Success(c.Writer, true, http.StatusOK, submission, "Submission submitted successfully")
}

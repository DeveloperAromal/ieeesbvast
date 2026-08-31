package upload

import (
	"net/http"
	"net/url"
	"strings"

	formatter "github.com/DeveloperAromal/ieeesbvast/pkg/formate"
	"github.com/gin-gonic/gin"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{
		service: service,
	}
}

var response = formatter.NewRepository()

type uploadResult struct {
	Key string `json:"key"`
	URL string `json:"url"`
}

func (h *Handler) Upload(c *gin.Context) {
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		response.Error(
			c.Writer,
			false,
			http.StatusBadRequest,
			"file is required",
		)
		return
	}
	defer file.Close()

	key, err := h.service.Upload(
		c.Request.Context(),
		"assets",
		header.Filename,
		file,
	)

	if err != nil {
		response.Error(
			c.Writer,
			false,
			http.StatusInternalServerError,
			"failed to upload file",
		)
		return
	}

	urlResult, err := h.service.GetURL(
		c.Request.Context(),
		"assets",
		key,
	)

	if err != nil {
		response.Error(
			c.Writer,
			false,
			http.StatusInternalServerError,
			"failed to generate file URL",
		)
		return
	}

	response.Success(
		c.Writer,
		true,
		http.StatusOK,
		uploadResult{Key: key, URL: urlResult},
		"File uploaded successfully",
	)
}

func (h *Handler) GetURL(c *gin.Context) {
	// Extract the key from wildcard path parameter
	rawKey := c.Param("key")
	
	// Remove leading slash if present
	key := strings.TrimPrefix(rawKey, "/")
	
	// URL decode the key to handle encoded slashes
	decodedKey, err := url.QueryUnescape(key)
	if err != nil {
		decodedKey = key // fallback to original if decode fails
	}

	urlResult, err := h.service.GetURL(
		c.Request.Context(),
		"assets",
		decodedKey,
	)

	if err != nil {
		response.Error(
			c.Writer,
			false,
			http.StatusInternalServerError,
			"failed to generate file URL",
		)
		return
	}

	response.Success(
		c.Writer,
		true,
		http.StatusOK,
		uploadResult{Key: decodedKey, URL: urlResult},
		"URL generated successfully",
	)
}

func (h *Handler) DeleteFile(c *gin.Context) {
	// Extract the key from wildcard path parameter
	rawKey := c.Param("key")
	
	// Remove leading slash if present
	key := strings.TrimPrefix(rawKey, "/")
	
	// URL decode the key to handle encoded slashes
	decodedKey, err := url.QueryUnescape(key)
	if err != nil {
		decodedKey = key // fallback to original if decode fails
	}

	err = h.service.Delete(
		c.Request.Context(),
		"assets",
		decodedKey,
	)

	if err != nil {
		response.Error(
			c.Writer,
			false,
			http.StatusInternalServerError,
			"failed to delete file",
		)
		return
	}

	response.Success(
		c.Writer,
		true,
		http.StatusOK,
		nil,
		"File deleted successfully",
	)
}

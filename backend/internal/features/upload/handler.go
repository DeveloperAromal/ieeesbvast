package upload

import (
	"net/http"
	"strings"

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

func (h *Handler) Upload(c *gin.Context) {
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "file is required",
		})
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
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to upload file",
		})
		return
	}

	url, err := h.service.GetURL(
		c.Request.Context(),
		"assets",
		key,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to generate file URL",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"key": key,
		"url": url,
	})
}

func (h *Handler) GetURL(c *gin.Context) {
	key := strings.TrimPrefix(c.Param("key"), "/")

	url, err := h.service.GetURL(
		c.Request.Context(),
		"assets",
		key,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to generate file URL",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"key": key,
		"url": url,
	})
}

func (h *Handler) DeleteFile(c *gin.Context) {
	key := strings.TrimPrefix(c.Param("key"), "/")

	err := h.service.Delete(
		c.Request.Context(),
		"assets",
		key,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to delete file",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "file deleted successfully",
	})
}

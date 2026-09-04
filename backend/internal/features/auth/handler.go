package auth

import (
	"net/http"

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

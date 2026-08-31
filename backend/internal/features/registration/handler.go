package projects

import (
	"net/http"

	formatter "github.com/DeveloperAromal/ieeesbvast/pkg/formate"
	"github.com/gin-gonic/gin"
)

type handler struct {
	srv service
}

func NewHandler(srv service) *handler {
	return &handler{
		srv: srv,
	}
}

var response = formatter.NewRepository()

func (hdlr *handler) CreateNewRegistration(c *gin.Context) {

	var registrationModel Registration

	if err := c.BindJSON(&registrationModel); err != nil {
		response.Error(
			c.Writer,
			false,
			http.StatusBadRequest,
			"Bad request",
		)
		return
	}

	result, err := hdlr.srv.CreateRegistration(c.Request.Context(), registrationModel)
	if err != nil {
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
		http.StatusCreated,
		result,
		"Successfully registerd for event",
	)

}

package projects

import (
	"errors"
	"net/http"

	formatter "github.com/DeveloperAromal/ieeesbvast/pkg/formate"
	"github.com/gin-gonic/gin"
)

const RegistrationClosedMsg = "Registration is closed for this event"

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
		if errors.Is(err, ErrRegistrationClosed) {
			response.Error(
				c.Writer,
				false,
				http.StatusForbidden,
				RegistrationClosedMsg,
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
		http.StatusCreated,
		result,
		"Successfully registerd for event",
	)

}

func (hdlr *handler) GetRegistrationsByEventId(c *gin.Context) {

	eventId := c.Param("eventId")

	if eventId == "" {
		response.Error(
			c.Writer,
			false,
			http.StatusBadRequest,
			"Event ID is required",
		)
		return
	}

	result, err := hdlr.srv.GetRegistrationsByEventId(c.Request.Context(), eventId)
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
		http.StatusOK,
		result,
		"Successfully fetched registrations",
	)

}

package rsvp

import (
	"errors"
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

func (hdlr *handler) CreateNewRSVP(c *gin.Context) {

	var rsvpModel RSVP

	if err := c.BindJSON(&rsvpModel); err != nil {
		response.Error(
			c.Writer,
			false,
			http.StatusBadRequest,
			"Bad request",
		)
		return
	}

	result, err := hdlr.srv.CreateRSVP(c.Request.Context(), rsvpModel)
	if err != nil {
		if errors.Is(err, ErrRSVPClosed) {
			response.Error(
				c.Writer,
				false,
				http.StatusForbidden,
				"RSVP is closed for this event",
			)
			return
		}
		if errors.Is(err, ErrInvalidEventID) {
			response.Error(
				c.Writer,
				false,
				http.StatusBadRequest,
				err.Error(),
			)
			return
		}

		response.Error(
			c.Writer,
			false,
			http.StatusInternalServerError,
			"Unexpected error occurred: "+err.Error(),
		)
		return
	}

	response.Success(
		c.Writer,
		true,
		http.StatusCreated,
		result,
		"Successfully confirmed RSVP for event",
	)

}

func (hdlr *handler) GetRSVPsByEventId(c *gin.Context) {

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

	result, err := hdlr.srv.GetRSVPsByEventId(c.Request.Context(), eventId)
	if err != nil {
		response.Error(
			c.Writer,
			false,
			http.StatusInternalServerError,
			"Unexpected error occurred: "+err.Error(),
		)
		return
	}

	response.Success(
		c.Writer,
		true,
		http.StatusOK,
		result,
		"Successfully fetched RSVPs",
	)

}

func (hdlr *handler) GetRSVPByID(c *gin.Context) {

	id := c.Param("id")

	if id == "" {
		response.Error(
			c.Writer,
			false,
			http.StatusBadRequest,
			"RSVP ID is required",
		)
		return
	}

	result, err := hdlr.srv.GetRSVPByID(c.Request.Context(), id)
	if err != nil {
		response.Error(
			c.Writer,
			false,
			http.StatusInternalServerError,
			"Unexpected error occurred: "+err.Error(),
		)
		return
	}

	response.Success(
		c.Writer,
		true,
		http.StatusOK,
		result,
		"Successfully fetched RSVP",
	)

}

func (hdlr *handler) DeleteRSVP(c *gin.Context) {

	id := c.Param("id")

	if id == "" {
		response.Error(
			c.Writer,
			false,
			http.StatusBadRequest,
			"RSVP ID is required",
		)
		return
	}

	err := hdlr.srv.DeleteRSVP(c.Request.Context(), id)
	if err != nil {
		response.Error(
			c.Writer,
			false,
			http.StatusInternalServerError,
			"Unexpected error occurred: "+err.Error(),
		)
		return
	}

	response.Success(
		c.Writer,
		true,
		http.StatusOK,
		nil,
		"Successfully deleted RSVP",
	)

}

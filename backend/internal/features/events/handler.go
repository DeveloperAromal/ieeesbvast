package events

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

func (hdlr *handler) CreateNewEvent(c *gin.Context) {

	var eventModel Event

	if err := c.BindJSON(&eventModel); err != nil {
		response.Error(
			c.Writer,
			false,
			http.StatusBadRequest,
			"Bad request",
		)
		return
	}

	result, err := hdlr.srv.CreateEvent(c.Request.Context(), eventModel)
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
		http.StatusCreated,
		result,
		"Successfully created for event",
	)

}

func (hdlr *handler) CreateEventSpeaker(c *gin.Context) {

	var speakerModel Speaker

	if err := c.BindJSON(&speakerModel); err != nil {
		response.Error(
			c.Writer,
			false,
			http.StatusBadRequest,
			"Bad request",
		)
		return
	}

	result, err := hdlr.srv.CreateSpeaker(c.Request.Context(), speakerModel)
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
		http.StatusCreated,
		result,
		"Successfully created speaker for event",
	)

}

func (hdlr *handler) CreateEventSchedule(c *gin.Context) {

	var scheduleModel Schedule

	if err := c.BindJSON(&scheduleModel); err != nil {
		response.Error(
			c.Writer,
			false,
			http.StatusBadRequest,
			"Bad request",
		)
		return
	}

	result, err := hdlr.srv.CreateSchedule(c.Request.Context(), scheduleModel)
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
		http.StatusCreated,
		result,
		"Successfully created schedule for event",
	)

}

func (hdlr *handler) GetAllEvents(c *gin.Context) {

	result, err := hdlr.srv.GetAllEvents(c.Request.Context())
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
		http.StatusCreated,
		result,
		"Successfully fetched all events",
	)
}

func (hdlr *handler) GetEventBySlug(c *gin.Context) {

	slug := c.Param("slug")

	result, err := hdlr.srv.GetEventBySlug(c.Request.Context(), slug)
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
		http.StatusCreated,
		result,
		"Successfully fetched event",
	)

}

func (hdlr *handler) GetEventNameByID(c *gin.Context) {

	id := c.Param("id")

	result, err := hdlr.srv.GetEventNameByID(c.Request.Context(), id)
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
		http.StatusCreated,
		result,
		"Successfully fetched event name",
	)

}

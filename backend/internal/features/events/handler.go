package events

import (
	"database/sql"
	"errors"
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
			"Unexpected error occured"+err.Error(),
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
			"Unexpected error occured"+err.Error(),
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

func (hdlr *handler) GetEventByID(c *gin.Context) {
	result, err := hdlr.srv.GetEventByID(c.Request.Context(), c.Param("id"))
	if errors.Is(err, sql.ErrNoRows) {
		response.Error(c.Writer, false, http.StatusNotFound, "Event not found")
		return
	}
	if err != nil {
		response.Error(c.Writer, false, http.StatusInternalServerError, "Failed to fetch event"+err.Error())
		return
	}
	response.Success(c.Writer, true, http.StatusOK, result, "Successfully fetched event")
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

func (hdlr *handler) CreateEventTask(c *gin.Context) {
	var request CreateEventTaskRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		response.Error(c.Writer, false, http.StatusBadRequest, "Bad request")
		return
	}

	task, err := hdlr.srv.CreateEventTask(c.Request.Context(), EventTask{
		EventID: c.Param("eventId"), Instructions: request.Instructions, DriveLink: request.DriveLink,
	})
	if err != nil {
		response.Error(c.Writer, false, http.StatusInternalServerError, "Failed to create event task")
		return
	}
	response.Success(c.Writer, true, http.StatusCreated, task, "Event task created successfully")
}

func (hdlr *handler) GetEventTask(c *gin.Context) {
	task, err := hdlr.srv.GetEventTask(c.Request.Context(), c.Param("eventId"))
	if errors.Is(err, sql.ErrNoRows) {
		response.Success(c.Writer, true, http.StatusOK, nil, "Event task is not configured")
		return
	}
	if err != nil {
		response.Error(c.Writer, false, http.StatusInternalServerError, "Failed to fetch event task"+err.Error())
		return
	}
	response.Success(c.Writer, true, http.StatusOK, task, "Event task fetched successfully")
}

func (hdlr *handler) UpdateEventTask(c *gin.Context) {
	var request CreateEventTaskRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		response.Error(c.Writer, false, http.StatusBadRequest, "Bad request")
		return
	}

	task, err := hdlr.srv.UpdateEventTask(c.Request.Context(), EventTask{
		EventID: c.Param("eventId"), Instructions: request.Instructions, DriveLink: request.DriveLink,
	})
	if err != nil {
		response.Error(c.Writer, false, http.StatusNotFound, "Event task not found")
		return
	}
	response.Success(c.Writer, true, http.StatusOK, task, "Event task updated successfully")
}

func (hdlr *handler) DeleteEventTask(c *gin.Context) {
	if err := hdlr.srv.DeleteEventTask(c.Request.Context(), c.Param("eventId")); err != nil {
		response.Error(c.Writer, false, http.StatusInternalServerError, "Failed to delete event task")
		return
	}
	response.Success(c.Writer, true, http.StatusOK, nil, "Event task deleted successfully")
}

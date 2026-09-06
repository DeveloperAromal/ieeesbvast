package events

import (
	"database/sql"

	"github.com/gin-gonic/gin"
)

type Router struct {
	db *sql.DB
}

func NewRouter(db *sql.DB) *Router {
	return &Router{
		db: db,
	}
}

func (rtr *Router) BasePath() string {
	return "/events"
}

func (rtr *Router) Register(reg *gin.RouterGroup) {
	repo := NewRepository(rtr.db)
	service := NewService(repo)
	handler := NewHandler(*service)

	reg.POST("", handler.CreateNewEvent)
	reg.POST("/speakers", handler.CreateEventSpeaker)
	reg.POST("/schedules", handler.CreateEventSchedule)
	reg.GET("", handler.GetAllEvents)
	reg.GET("/name/:id", handler.GetEventNameByID)
	reg.GET("/by-id/:id", handler.GetEventByID)
	reg.POST("/id/:eventId/task", handler.CreateEventTask)
	reg.GET("/id/:eventId/task", handler.GetEventTask)
	reg.PUT("/id/:eventId/task", handler.UpdateEventTask)
	reg.DELETE("/id/:eventId/task", handler.DeleteEventTask)
	reg.GET("/:slug", handler.GetEventBySlug)
}

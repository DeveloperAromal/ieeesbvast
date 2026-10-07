package rsvp

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
	return "/rsvps"
}

func (rtr *Router) Register(reg *gin.RouterGroup) {
	repo := NewRepository(rtr.db)
	service := NewService(repo)
	handler := NewHandler(service)

	reg.POST("", handler.CreateNewRSVP)
	reg.GET("/:eventId", handler.GetRSVPsByEventId)
	reg.GET("/by-id/:id", handler.GetRSVPByID)
	reg.DELETE("/:id", handler.DeleteRSVP)
}

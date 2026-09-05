package auth

import (
	"database/sql"

	regUser "github.com/DeveloperAromal/ieeesbvast/internal/features/registration"
	"github.com/gin-gonic/gin"
)

type Router struct {
	db        *sql.DB
	regModule regUser.Repository
}

func NewRouter(db *sql.DB, regModule regUser.Repository) *Router {
	return &Router{
		db:        db,
		regModule: regModule,
	}
}

func (rtr *Router) BasePath() string {
	return "/auth"
}

func (rtr *Router) Register(reg *gin.RouterGroup) {
	repo := NewRepository(rtr.db)
	service := NewService(repo, rtr.regModule)
	handler := NewHandler(service)

	reg.GET("/:eventID/create-event-users", handler.CreateEventUsers)
	reg.POST("/login", handler.LoginUsers)
	reg.GET("/me", handler.GetUserDetails)
}

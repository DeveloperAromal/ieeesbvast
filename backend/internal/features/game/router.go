package game

import (
	"database/sql"

	"github.com/gin-gonic/gin"
)

type Router struct {
	db *sql.DB
}

func NewRouter(db *sql.DB) *Router {
	return &Router{db: db}
}

func (rtr *Router) BasePath() string {
	return "/game"
}

func (rtr *Router) Register(reg *gin.RouterGroup) {
	repo := NewRepository(rtr.db)
	service := NewService(repo)
	handler := NewHandler(service)

	reg.POST("", handler.CreateGame)
	reg.GET("/:id", handler.GetGameByID)
	reg.GET("/:id/leaderboard", handler.GetLeaderboard)
	reg.POST("/answer", handler.ValidateGameAnswer)
	reg.POST("/hint", handler.RequestHint)
	reg.GET("/blackout/game", handler.BlackoutGame)
}

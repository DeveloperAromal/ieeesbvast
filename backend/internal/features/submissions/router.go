package submissions

import (
	"database/sql"

	auth "github.com/DeveloperAromal/ieeesbvast/internal/features/auth"
	upload "github.com/DeveloperAromal/ieeesbvast/internal/features/upload"
	"github.com/gin-gonic/gin"
)

type Router struct {
	db     *sql.DB
	auth   auth.Service
	bucket upload.Bucket
}

func NewRouter(db *sql.DB, authService auth.Service, bucket upload.Bucket) *Router {
	return &Router{db: db, auth: authService, bucket: bucket}
}

func (rtr *Router) BasePath() string { return "/submissions" }

func (rtr *Router) Register(reg *gin.RouterGroup) {
	service := NewService(NewRepository(rtr.db), rtr.auth, rtr.bucket)
	handler := NewHandler(service, rtr.auth)
	reg.GET("/:eventId", handler.Get)
	reg.POST("/:eventId/draft", handler.Draft)
	reg.POST("/:eventId/submit", handler.Submit)
}

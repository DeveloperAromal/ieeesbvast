package upload

import "github.com/gin-gonic/gin"

type Router struct {
	bucket Bucket
}

func NewRouter(bucket Bucket) *Router {
	return &Router{
		bucket: bucket,
	}
}

func (rtr *Router) BasePath() string {
	return "/upload"
}

func (rtr *Router) Register(reg *gin.RouterGroup) {
	service := NewService(rtr.bucket)
	handler := NewHandler(service)

	reg.POST("", handler.Upload)
	reg.GET("/:key", handler.GetURL)
	reg.DELETE("/:key", handler.DeleteFile)
}

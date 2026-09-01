package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	eventModule "github.com/DeveloperAromal/ieeesbvast/internal/features/events"
	registrationModule "github.com/DeveloperAromal/ieeesbvast/internal/features/registration"
	uploadModule "github.com/DeveloperAromal/ieeesbvast/internal/features/upload"

	routers "github.com/DeveloperAromal/ieeesbvast/internal/interfaces"
)

var startTime time.Time

type application struct {
	config config
	db     *sql.DB
	bucket uploadModule.Bucket
}

func (app *application) mount() *gin.Engine {

	if os.Getenv("ENVIRONMENT") == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()

	// MIDDLEWARE
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "https://ieeesbvast.vercel.app"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "active",
		})
	})

	// Health endpoint returns the current status of the server,
	// including uptime, timestamp, environment, and version.
	r.GET("/health", func(c *gin.Context) {
		uptime := time.Since(startTime)

		c.JSON(http.StatusOK, gin.H{
			"status":    "active",
			"timestamp": time.Now().UTC(),
			"uptime": gin.H{
				"seconds": int(uptime.Seconds()),
				"human":   uptime.String(),
			},
			"env":     "development",
			"version": "1.0.0",
		})
	})

	api := r.Group("/api/v1")

	modules := []routers.RouterInterface{
		registrationModule.NewRouter(app.db),
		eventModule.NewRouter(app.db),
		uploadModule.NewRouter(app.bucket),
	}

	for _, m := range modules {
		group := api.Group(m.BasePath())

		m.Register(group)
	}

	return r

}

func (app *application) run(h http.Handler) error {
	srv := &http.Server{
		Addr:         app.config.addr,
		Handler:      h,
		WriteTimeout: 120 * time.Second,
		ReadTimeout:  120 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	log.Printf("server has started at %s", app.config.addr)

	return srv.ListenAndServe()
}

type config struct {
	addr string
	db   dbConfig
}

type dbConfig struct {
	dsn string
}

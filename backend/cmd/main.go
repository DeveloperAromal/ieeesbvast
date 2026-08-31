package main

import (
	// "fmt"
	"log"
	"os"

	//"time"

	"github.com/DeveloperAromal/ieeesbvast/pkg/banner"
	"github.com/DeveloperAromal/ieeesbvast/pkg/logger"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"

	databseAdapter "github.com/DeveloperAromal/ieeesbvast/internal/adapters/postgresql"
	uploadModule "github.com/DeveloperAromal/ieeesbvast/internal/features/upload"
	routeDump "github.com/DeveloperAromal/ieeesbvast/pkg/dump"
)

func main() {

	// APP BANNER
	banner.Banner()

	err := godotenv.Load()
	if err != nil {
		log.Println("Error loading .env")
	}

	cfg := config{
		addr: ":8080",
		db: dbConfig{
			dsn: os.Getenv("DB_CONN_STRING"),
		},
	}
	// Logger
	logger := logger.New(logger.INIT)

	// DATABASE CONNECTION

	conn := databseAdapter.PostgresConnection(cfg.db.dsn)

	// WARNING:
	// 		Uncomment this in production
	//		USE:
	//			This ping /health endpoint in each 10 minutes to avoid render cooldown
	// go func() {
	// 	ticker := time.NewTicker(5 * time.Minute)

	// 	for range ticker.C {
	// 		err := scheduler.PingHost(os.Getenv("PROD_HEALTH_ENDPOINT"))
	// 		if err != nil {
	// 			logger.Error(fmt.Sprintf("Ping failed: %v", err))
	// 		} else {
	// 			logger.Success("Ping success")
	// 		}
	// 	}
	// }()

	bucket := uploadModule.NewS3Bucket()

	api := application{
		config: cfg,
		db:     conn,
		bucket: bucket,
	}

	r := api.mount()

	go func() {
		if err := routeDump.ExportRoutes(r, "./docs/routes.json"); err != nil {
			log.Println("failed to export routes:", err)
		}
	}()

	if err := api.run(r); err != nil {
		logger.Fatal("server failed to start")
		os.Exit(1)
	}

}

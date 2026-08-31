package dump

import (
	"encoding/json"
	"os"

	"github.com/gin-gonic/gin"
)

func ExportRoutes(r *gin.Engine, path string) error {
	routes := r.Routes()
	docs := make([]RouteDoc, 0, len(routes))

	for _, ri := range routes {
		docs = append(docs, RouteDoc{
			Method: ri.Method,
			Path:   ri.Path,
		})
	}

	data, err := json.MarshalIndent(docs, "", "")
	if err != nil {
		return err
	}

	return os.WriteFile(path, data, 0644)
}

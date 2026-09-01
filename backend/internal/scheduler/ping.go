package scheduler

import (
	"fmt"
	"net/http"
	"time"
)

func PingHost(endpoint string) error {
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	res, err := client.Get(endpoint)
	if err != nil {
		return err
	}
	defer res.Body.Close()

	if res.StatusCode >= 400 {
		return fmt.Errorf("bad status: %d", res.StatusCode)
	}

	return nil
}

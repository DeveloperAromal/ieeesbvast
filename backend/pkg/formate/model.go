package formate

type ResponseModel struct {
	Success    bool        `json:"success"`
	StatusCode int      `json:"status_code"`
	Data       interface{} `json:"data,omitempty"`
	Message    string      `json:"message,omitempty"`
}


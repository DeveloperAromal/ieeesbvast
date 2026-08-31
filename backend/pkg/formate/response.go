package formate

import (
	"encoding/json"
	"net/http"
)

type Response interface {
	Success(
		w http.ResponseWriter, 
		success bool,
		status_code int, 
		data interface{},
		message string,
	) ResponseModel

	Error(
		w http.ResponseWriter, 
		success bool,
		status_code int, 
		message string,
	) ResponseModel
}


type response struct {}

func NewRepository() *response {
	return &response{}
} 


func (res *response) Success(w http.ResponseWriter, success bool, status_code int, data interface{}, message string) {

	w.Header().Set("content-type", "application/json")
	w.WriteHeader(status_code)
	json.NewEncoder(w).Encode(ResponseModel{
		Success: success,
		StatusCode: status_code,
		Data: data,
		Message: message,
	})

}


func (res *response) Error(w http.ResponseWriter, success bool, status_code int, message string) {

	w.Header().Set("content-type", "application/json")
	w.WriteHeader(status_code)
	json.NewEncoder(w).Encode(ResponseModel{
		Success: success,
		StatusCode: status_code,
		Message: message,
	})

}
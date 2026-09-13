package game

import (
	"database/sql"
	"errors"
	"net/http"

	formatter "github.com/DeveloperAromal/ieeesbvast/pkg/formate"
	"github.com/gin-gonic/gin"
)

type handler struct {
	srv Service
}

func NewHandler(srv Service) *handler {
	return &handler{
		srv: srv,
	}
}

var response = formatter.NewRepository()

func (hdlr *handler) CreateGame(c *gin.Context) {
	var gameModel Game

	if err := c.ShouldBindJSON(&gameModel); err != nil {
		response.Error(
			c.Writer,
			false,
			http.StatusBadRequest,
			"Bad request",
		)
		return
	}

	result, err := hdlr.srv.Create(
		c.Request.Context(),
		gameModel,
	)
	if err != nil {
		response.Error(
			c.Writer,
			false,
			http.StatusInternalServerError,
			"Unexpected error occurred",
		)
		return
	}

	response.Success(
		c.Writer,
		true,
		http.StatusCreated,
		result,
		"Successfully created game",
	)
}

func (hdlr *handler) GetGameByID(c *gin.Context) {
	idParam := c.Param("id")
	if idParam == "" {
		response.Error(
			c.Writer,
			false,
			http.StatusBadRequest,
			"Game ID is required",
		)
		return
	}

	result, err := hdlr.srv.GetByID(c.Request.Context(), idParam)
	if errors.Is(err, ErrGameNotFound) || errors.Is(err, sql.ErrNoRows) {
		response.Error(
			c.Writer,
			false,
			http.StatusNotFound,
			"Game not found",
		)
		return
	}

	if err != nil {
		response.Error(
			c.Writer,
			false,
			http.StatusInternalServerError,
			"Unexpected error occurred",
		)
		return
	}

	response.Success(
		c.Writer,
		true,
		http.StatusOK,
		result,
		"Successfully fetched game",
	)
}

func (hdlr *handler) ValidateGameAnswer(c *gin.Context) {
	var req ValidateAnswerRequest
	if err := c.BindJSON(&req); err != nil {
		response.Error(c.Writer, false, http.StatusBadRequest, "Bad request")
		return
	}

	token, err := c.Cookie("session_token")
	if err != nil {
		response.Error(c.Writer, false, http.StatusUnauthorized, "Session token is required")
		return
	}

	teamRegistrationID, err := hdlr.srv.GetTeamRegistrationIDFromSessionToken(c.Request.Context(), token)
	if err != nil {
		response.Error(c.Writer, false, http.StatusUnauthorized, "Session expired or invalid")
		return
	}

	req.TeamRegistrationID = teamRegistrationID

	result, err := hdlr.srv.ValidateAnswer(c.Request.Context(), req)
	if err != nil {
		if errors.Is(err, ErrGameNotFound) {
			response.Error(c.Writer, false, http.StatusNotFound, "Game or stage not found")
			return
		}
		if errors.Is(err, ErrInvalidGameState) || errors.Is(err, ErrInvalidAnswer) {
			response.Error(c.Writer, false, http.StatusConflict, err.Error())
			return
		}
		response.Error(c.Writer, false, http.StatusInternalServerError, "Unexpected error occurred")
		return
	}

	if result.Correct {
		response.Success(c.Writer, true, http.StatusOK, result, result.Message)
		return
	}

	response.Success(c.Writer, false, http.StatusOK, result, result.Message)
}

func (hdlr *handler) RequestHint(c *gin.Context) {
	var req RequestHintRequest
	if err := c.BindJSON(&req); err != nil {
		response.Error(c.Writer, false, http.StatusBadRequest, "Bad request")
		return
	}
	token, err := c.Cookie("session_token")
	if err != nil {
		response.Error(c.Writer, false, http.StatusUnauthorized, "Session token is required")
		return
	}
	req.TeamRegistrationID, err = hdlr.srv.GetTeamRegistrationIDFromSessionToken(c.Request.Context(), token)
	if err != nil {
		response.Error(c.Writer, false, http.StatusUnauthorized, "Session expired or invalid")
		return
	}
	hint, score, err := hdlr.srv.RequestHint(c.Request.Context(), req)
	if err != nil {
		if errors.Is(err, ErrGameNotFound) || errors.Is(err, ErrInvalidGameState) {
			response.Error(c.Writer, false, http.StatusConflict, err.Error())
			return
		}
		response.Error(c.Writer, false, http.StatusInternalServerError, "Unable to unlock a hint")
		return
	}
	response.Success(c.Writer, true, http.StatusOK, gin.H{"hint": hint, "score": score}, "Hint unlocked. Points deducted.")
}

func (hdlr *handler) GetLeaderboard(c *gin.Context) {
	gameID := c.Param("id")
	if gameID == "" {
		response.Error(c.Writer, false, http.StatusBadRequest, "Game ID is required")
		return
	}

	entries, err := hdlr.srv.GetLeaderboard(c.Request.Context(), gameID)
	if err != nil {
		response.Error(c.Writer, false, http.StatusInternalServerError, "Unexpected error occurred")
		return
	}

	response.Success(c.Writer, true, http.StatusOK, entries, "Successfully fetched leaderboard")
}

func (hdlr *handler) BlackoutGame(c *gin.Context) {
	token, err := c.Cookie("session_token")
	if err != nil {
		response.Error(c.Writer, false, http.StatusUnauthorized, "Session token is required")
		return
	}

	gameData, err := hdlr.srv.GetBlackoutGameData(c.Request.Context(), token)
	if err != nil {
		response.Error(c.Writer, false, http.StatusInternalServerError, "Failed to fetch game data"+err.Error())
		return
	}

	response.Success(c.Writer, true, http.StatusOK, gameData, "Successfully fetched game data")
}

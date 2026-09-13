package game

import "context"

type Service interface {
	Create(ctx context.Context, game Game) (Game, error)
	GetByID(ctx context.Context, id string) (Game, error)
	ValidateAnswer(ctx context.Context, req ValidateAnswerRequest) (AnswerResult, error)
	RequestHint(ctx context.Context, req RequestHintRequest) (Hint, int, error)
	GetTeamRegistrationIDFromSessionToken(ctx context.Context, token string) (string, error)
	GetLeaderboard(ctx context.Context, gameID string) ([]LeaderboardEntry, error)
	GetBlackoutGameData(ctx context.Context, sessionToken string) (BlackoutGameData, error)
}

type service struct {
	repo Repository
}

func NewService(repo Repository) *service {
	return &service{repo: repo}
}

func (srv *service) Create(ctx context.Context, game Game) (Game, error) {
	return srv.repo.Create(ctx, game)
}

func (srv *service) GetByID(ctx context.Context, id string) (Game, error) {
	return srv.repo.GetByID(ctx, id)
}

func (srv *service) ValidateAnswer(ctx context.Context, req ValidateAnswerRequest) (AnswerResult, error) {
	return srv.repo.ValidateAnswer(ctx, req)
}

func (srv *service) RequestHint(ctx context.Context, req RequestHintRequest) (Hint, int, error) {
	return srv.repo.RequestHint(ctx, req)
}

func (srv *service) GetTeamRegistrationIDFromSessionToken(ctx context.Context, token string) (string, error) {
	return srv.repo.GetTeamRegistrationIDFromSessionToken(ctx, token)
}

func (srv *service) GetLeaderboard(ctx context.Context, gameID string) ([]LeaderboardEntry, error) {
	return srv.repo.GetLeaderboard(ctx, gameID)
}

func (srv *service) GetBlackoutGameData(ctx context.Context, sessionToken string) (BlackoutGameData, error) {
	return srv.repo.GetBlackoutGameData(ctx, sessionToken)
}

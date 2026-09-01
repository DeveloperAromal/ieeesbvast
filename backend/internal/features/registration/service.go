package projects

import (
	"context"
)

type Service interface {
	CreateRegistration(ctx context.Context, registration Registration) (Registration, error)
	GetRegistrationsByEventId(ctx context.Context, eventId string) ([]Registration, error)
}

type service struct {
	repo Repository
}

func NewService(repo Repository) *service {
	return &service{
		repo: repo,
	}
}

func (srv *service) CreateRegistration(ctx context.Context, registration Registration) (Registration, error) {
	return srv.repo.CreateRegistration(ctx, registration)
}

func (srv *service) GetRegistrationsByEventId(ctx context.Context, eventId string) ([]Registration, error) {
	return srv.repo.GetRegistrationsByEventId(ctx, eventId)
}

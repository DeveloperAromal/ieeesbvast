package projects

import (
	"context"
)

type Service interface {
	CreateRegistration(ctx context.Context, registration Registration) (Registration, error)
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

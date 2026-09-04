package projects

import (
	"context"
	"errors"
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
	newRegistration, err := srv.repo.CreateRegistration(ctx, registration)
	if err != nil {
		if errors.Is(err, ErrRegistrationClosed) {
			return newRegistration, ErrRegistrationClosed
		}
		return newRegistration, err
	}

	return newRegistration, nil
}

func (srv *service) GetRegistrationsByEventId(ctx context.Context, eventId string) ([]Registration, error) {
	return srv.repo.GetRegistrationsByEventId(ctx, eventId)
}

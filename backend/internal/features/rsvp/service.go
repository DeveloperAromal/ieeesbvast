package rsvp

import (
	"context"
	"errors"
)

type Service interface {
	CreateRSVP(ctx context.Context, rsvp RSVP) (RSVP, error)
	GetRSVPsByEventId(ctx context.Context, eventId string) ([]RSVP, error)
	GetRSVPByID(ctx context.Context, id string) (RSVP, error)
	DeleteRSVP(ctx context.Context, id string) error
}

type service struct {
	repo Repository
}

func NewService(repo Repository) *service {
	return &service{
		repo: repo,
	}
}

func (srv *service) CreateRSVP(ctx context.Context, rsvp RSVP) (RSVP, error) {
	newRSVP, err := srv.repo.CreateRSVP(ctx, rsvp)
	if err != nil {
		if errors.Is(err, ErrRSVPClosed) {
			return newRSVP, ErrRSVPClosed
		}
		return newRSVP, err
	}

	return newRSVP, nil
}

func (srv *service) GetRSVPsByEventId(ctx context.Context, eventId string) ([]RSVP, error) {
	return srv.repo.GetRSVPsByEventId(ctx, eventId)
}

func (srv *service) GetRSVPByID(ctx context.Context, id string) (RSVP, error) {
	return srv.repo.GetRSVPByID(ctx, id)
}

func (srv *service) DeleteRSVP(ctx context.Context, id string) error {
	return srv.repo.DeleteRSVP(ctx, id)
}

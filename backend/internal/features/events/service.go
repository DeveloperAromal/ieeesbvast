package events

import (
	"context"

	generator "github.com/DeveloperAromal/ieeesbvast/pkg/generator"
)

type Service interface {
	CreateEvent(ctx context.Context, event Event) (Event, error)
	CreateSchedule(ctx context.Context, schedule Schedule) (Schedule, error)
	CreateSpeaker(ctx context.Context, speaker Speaker) (Speaker, error)
	GetAllEvents(ctx context.Context) ([]Event, error)
	GetEventBySlug(ctx context.Context, slug string) (Event, error)
	GetEventNameByID(ctx context.Context, id string) (string, error)
}

type service struct {
	repo Repository
}

func NewService(repo Repository) *service {
	return &service{
		repo: repo,
	}
}

func (srv *service) CreateEvent(ctx context.Context, event Event) (Event, error) {

	slug, err := generator.GenerateSlug(event.EventName)
	if err != nil {
		return Event{}, err
	}

	return srv.repo.CreateEvent(
		ctx,
		Event{
			ID:          event.ID,
			EventName:   event.EventName,
			EventSlug:   slug,
			PosterImage: event.PosterImage,
			BannerImage: event.BannerImage,
			Description: event.Description,
		},
	)
}

func (srv *service) CreateSchedule(ctx context.Context, schedule Schedule) (Schedule, error) {
	return srv.repo.CreateSchedule(ctx, schedule)
}

func (srv *service) CreateSpeaker(ctx context.Context, speaker Speaker) (Speaker, error) {
	return srv.repo.CreateSpeaker(ctx, speaker)
}

func (srv *service) GetAllEvents(ctx context.Context) ([]Event, error) {
	return srv.repo.GetAllEvents(ctx)
}

func (srv *service) GetEventBySlug(ctx context.Context, slug string) (Event, error) {
	return srv.repo.GetEventBySlug(ctx, slug)
}

func (srv *service) GetEventNameByID(ctx context.Context, id string) (string, error) {
	return srv.repo.GetEventNameByID(ctx, id)
}

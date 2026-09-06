package events

import (
	"context"
)

type Service interface {
	CreateEvent(ctx context.Context, event Event) (Event, error)
	CreateSchedule(ctx context.Context, schedule Schedule) (Schedule, error)
	CreateSpeaker(ctx context.Context, speaker Speaker) (Speaker, error)
	GetAllEvents(ctx context.Context) ([]Event, error)
	GetEventBySlug(ctx context.Context, slug string) (Event, error)
	GetEventByID(ctx context.Context, id string) (Event, error)
	GetEventNameByID(ctx context.Context, id string) (EventReg, error)
	CreateEventTask(ctx context.Context, task EventTask) (EventTask, error)
	GetEventTask(ctx context.Context, eventID string) (EventTask, error)
	UpdateEventTask(ctx context.Context, task EventTask) (EventTask, error)
	DeleteEventTask(ctx context.Context, eventID string) error
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

	return srv.repo.CreateEvent(
		ctx,
		Event{
			ID:          event.ID,
			EventName:   event.EventName,
			EventSlug:   event.EventSlug,
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

func (srv *service) GetEventByID(ctx context.Context, id string) (Event, error) {
	return srv.repo.GetEventByID(ctx, id)
}

func (srv *service) GetEventNameByID(ctx context.Context, id string) (EventReg, error) {
	return srv.repo.GetEventNameByID(ctx, id)
}

func (srv *service) CreateEventTask(ctx context.Context, task EventTask) (EventTask, error) {
	return srv.repo.CreateEventTask(ctx, task)
}

func (srv *service) GetEventTask(ctx context.Context, eventID string) (EventTask, error) {
	return srv.repo.GetEventTask(ctx, eventID)
}

func (srv *service) UpdateEventTask(ctx context.Context, task EventTask) (EventTask, error) {
	return srv.repo.UpdateEventTask(ctx, task)
}

func (srv *service) DeleteEventTask(ctx context.Context, eventID string) error {
	return srv.repo.DeleteEventTask(ctx, eventID)
}

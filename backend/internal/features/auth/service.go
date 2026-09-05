package auth

import (
	"context"
	"errors"
	"fmt"
	"log"
	"time"

	regUser "github.com/DeveloperAromal/ieeesbvast/internal/features/registration"
	generator "github.com/DeveloperAromal/ieeesbvast/pkg/generator"
	hashing "github.com/DeveloperAromal/ieeesbvast/pkg/hashing"
	mailSender "github.com/DeveloperAromal/ieeesbvast/pkg/mail"
	inviteTemplate "github.com/DeveloperAromal/ieeesbvast/templates"
)

type Service interface {
	CreateEventUser(ctx context.Context, eventID string) error
	LoginUser(ctx context.Context, cred LoginUserModel) (string, error)
	FindUserSession(ctx context.Context, token string) (SessionResponse, error)
}

type service struct {
	repo      Repository
	regModule regUser.Repository
}

func NewService(repo Repository, regModule regUser.Repository) *service {
	return &service{
		repo:      repo,
		regModule: regModule,
	}
}

func (srv *service) CreateEventUser(ctx context.Context, eventID string) error {

	password, err := generator.GeneratePassword()
	if err != nil {
		return err
	}

	hash, err := hashing.NewAlgo().HashPassword(password)
	if err != nil {
		return err
	}

	users, err := srv.regModule.GetRegistrationsByEventId(ctx, eventID)
	if err != nil {
		return err
	}

	var firstErr error
	for _, user := range users {
		_, err := srv.repo.CreateUser(ctx, UserModel{
			Email:       user.Email,
			Password:    hash,
			Name:        user.FName + " " + user.LName,
			RegistionID: user.ID,
		})
		if err != nil {
			log.Printf("Failed to create user for %s: %v", user.Email, err)
			if firstErr == nil {
				firstErr = fmt.Errorf("create user %s: %w", user.Email, err)
			}
			continue
		}

		body, err := inviteTemplate.RenderInviteEmail(inviteTemplate.InviteData{
			Name:       user.FName,
			Password:   password,
			Email:      user.Email,
			InviteLink: "https://ieeesbvast.vercel.app/events/login",
			Event:      user.EventName,
		})
		if err != nil {
			log.Printf("Failed to render invite email for %s: %v", user.Email, err)
			if firstErr == nil {
				firstErr = fmt.Errorf("render invite email for %s: %w", user.Email, err)
			}
			continue
		}

		subject := user.FName + ", Login to your IEEE SB VAST event dashboard"

		if err := mailSender.NewMail().SendMail(
			[]string{user.Email},
			subject,
			body,
		); err != nil {
			log.Printf("Failed to send email to %s: %v", user.Email, err)
			if firstErr == nil {
				firstErr = fmt.Errorf("send email to %s: %w", user.Email, err)
			}
			continue
		}
	}

	return firstErr

}

func (srv *service) LoginUser(ctx context.Context, cred LoginUserModel) (string, error) {

	const sessionDuration = 7 * 24 * time.Hour

	emailExists, err := srv.repo.EmailExists(ctx, cred.Email)
	if err != nil {
		return "", err
	}

	if !emailExists {
		return "", errors.New("Wrong email")
	}

	user, err := srv.repo.LoginUser(ctx, cred.Email, cred.Password)
	if err != nil {
		return "", err
	}

	comp, err := hashing.NewAlgo().ComparePasswordHash(cred.Password, user.Password)
	if err != nil {
		return "", err
	}

	if !comp {
		return "", errors.New("Wrong password")
	}

	token, err := hashing.NewAlgo().RandomToken()
	if err != nil {
		return "", err
	}

	hashedToken, err := hashing.NewAlgo().CreateSHA(token)
	if err != nil {
		return "", err
	}

	_, err = srv.repo.CreateSession(ctx, SessionModel{
		UserID:    user.ID,
		TokenHash: hashedToken,
		ExpiredAt: time.Now().Add(sessionDuration),
	})

	return token, err

}

func (srv *service) FindUserSession(ctx context.Context, token string) (SessionResponse, error) {

	hashedToken, err := hashing.NewAlgo().CreateSHA(token)
	if err != nil {
		return SessionResponse{}, err
	}

	return srv.repo.FindUserSession(ctx, hashedToken)

}

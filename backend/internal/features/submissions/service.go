package submissions

import (
	"context"
	"fmt"
	"mime/multipart"
	"time"

	auth "github.com/DeveloperAromal/ieeesbvast/internal/features/auth"
	upload "github.com/DeveloperAromal/ieeesbvast/internal/features/upload"
)

type Service interface {
	Get(ctx context.Context, userID, eventID string) (Submission, error)
	SaveDraft(ctx context.Context, userID, eventID string, headers []*multipart.FileHeader) (Submission, error)
	Submit(ctx context.Context, userID, eventID string) (Submission, error)
}

type service struct {
	repo   Repository
	auth   auth.Service
	bucket upload.Bucket
}

func NewService(repo Repository, authService auth.Service, bucket upload.Bucket) Service {
	return &service{repo: repo, auth: authService, bucket: bucket}
}

func (srv *service) Get(ctx context.Context, userID, eventID string) (Submission, error) {
	return srv.repo.Get(ctx, userID, eventID)
}

func (srv *service) SaveDraft(ctx context.Context, userID, eventID string, headers []*multipart.FileHeader) (Submission, error) {
	submission, err := srv.repo.CreateDraft(ctx, userID, eventID)
	if err != nil {
		return Submission{}, err
	}
	if submission.Status == "submitted" {
		return Submission{}, ErrAlreadySubmitted
	}

	for _, header := range headers {
		file, err := header.Open()
		if err != nil {
			return Submission{}, err
		}
		key := fmt.Sprintf("submissions/%s/%d-%s", submission.ID, time.Now().UnixNano(), header.Filename)
		err = srv.bucket.WriteToBucket(ctx, "assets", key, file)
		file.Close()
		if err != nil {
			return Submission{}, err
		}
		if err := srv.repo.AddFile(ctx, SubmissionFile{
			SubmissionID: submission.ID,
			FileName:     header.Filename,
			FileKey:      key,
			MimeType:     header.Header.Get("Content-Type"),
			FileSize:     header.Size,
		}); err != nil {
			return Submission{}, err
		}
	}

	return srv.repo.Get(ctx, userID, eventID)
}

func (srv *service) Submit(ctx context.Context, userID, eventID string) (Submission, error) {
	return srv.repo.Submit(ctx, userID, eventID)
}

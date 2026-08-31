package upload

import (
	"context"
	"fmt"
	"io"
	"path/filepath"
	"time"
)

type Service interface {
	Upload(
		ctx context.Context,
		bucketName string,
		filename string,
		file io.Reader,
	) (string, error)

	GetURL(
		ctx context.Context,
		bucketName string,
		key string,
	) (string, error)

	Delete(
		ctx context.Context,
		bucketName string,
		key string,
	) error
}

type service struct {
	bucket Bucket
}

func NewService(bucket Bucket) Service {
	return &service{
		bucket: bucket,
	}
}

func (s *service) Upload(
	ctx context.Context,
	bucketName string,
	filename string,
	file io.Reader,
) (string, error) {

	ext := filepath.Ext(filename)

	key := fmt.Sprintf(
		"uploads/%d%s",
		time.Now().UnixNano(),
		ext,
	)

	err := s.bucket.WriteToBucket(
		ctx,
		bucketName,
		key,
		file,
	)

	if err != nil {
		return "", err
	}

	return key, nil
}

func (s *service) GetURL(
	ctx context.Context,
	bucketName string,
	key string,
) (string, error) {

	return s.bucket.GetSignedURL(
		ctx,
		bucketName,
		key,
		time.Hour,
	)
}

func (s *service) Delete(
	ctx context.Context,
	bucketName string,
	key string,
) error {

	return s.bucket.DeleteFromBucket(
		ctx,
		bucketName,
		key,
	)
}

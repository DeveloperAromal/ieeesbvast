package upload

import (
	"context"
	"io"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type Bucket interface {
	WriteToBucket(
		ctx context.Context,
		bucketName string,
		key string,
		body io.Reader,
	) error

	GetFromBucket(
		ctx context.Context,
		bucketName string,
		key string,
	) (io.ReadCloser, error)

	GetSignedURL(
		ctx context.Context,
		bucketName string,
		key string,
		expires time.Duration,
	) (string, error)

	DeleteFromBucket(
		ctx context.Context,
		bucketName string,
		key string,
	) error
}

type S3Bucket struct {
	client *s3.Client
}

func NewS3Bucket() *S3Bucket {
	client := s3.New(s3.Options{
		Region: os.Getenv("AWS_REGION"),

		Credentials: credentials.NewStaticCredentialsProvider(
			os.Getenv("AWS_ACCESS_KEY_ID"),
			os.Getenv("AWS_SECRET_ACCESS_KEY"),
			"",
		),

		BaseEndpoint: aws.String(
			os.Getenv("AWS_ENDPOINT_URL_S3"),
		),

		UsePathStyle: true,
	})

	return &S3Bucket{
		client: client,
	}
}

func (s *S3Bucket) WriteToBucket(ctx context.Context, bucketName string, key string, body io.Reader) error {

	_, err := s.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(key),
		Body:   body,
	})

	return err
}

func (s *S3Bucket) GetFromBucket(ctx context.Context, bucketName string, key string) (io.ReadCloser, error) {

	result, err := s.client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(key),
	})

	if err != nil {
		return nil, err
	}

	return result.Body, nil
}

func (s *S3Bucket) GetSignedURL(ctx context.Context, bucketName string, key string, expires time.Duration) (string, error) {

	presigner := s3.NewPresignClient(s.client)

	result, err := presigner.PresignGetObject(
		ctx,
		&s3.GetObjectInput{
			Bucket: aws.String(bucketName),
			Key:    aws.String(key),
		},
		func(options *s3.PresignOptions) {
			options.Expires = expires
		},
	)

	if err != nil {
		return "", err
	}

	return result.URL, nil
}

func (s *S3Bucket) DeleteFromBucket(ctx context.Context, bucketName string, key string) error {

	_, err := s.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(key),
	})

	return err
}

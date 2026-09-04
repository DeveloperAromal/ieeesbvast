package auth

import (
	"context"
	"database/sql"
)

type Repository interface {
	CreateUser(ctx context.Context, user UserModel) (UserModel, error)
	EmailExists(ctx context.Context, email string) (bool, error)
	LoginUser(ctx context.Context, email, password string) (UserModel, error)
	CreateSession(ctx context.Context, session SessionModel) (SessionModel, error)
	FindUserSession(ctx context.Context, tokenHash string) (SessionResponse, error)
}

type repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) Repository {
	return &repository{
		db: db,
	}
}

func (repo *repository) CreateUser(ctx context.Context, user UserModel) (UserModel, error) {
	userQuery := `
        INSERT INTO users
            (
                name,
                email,
                password,
				reg_id
            )
        VALUES ($1, $2, $3, $4)
        RETURNING id
    `

	err := repo.db.QueryRowContext(
		ctx,
		userQuery,
		user.Name,
		user.Email,
		user.Password,
		user.RegistionID,
	).Scan(
		&user.ID,
	)
	if err != nil {
		return UserModel{}, err
	}

	return UserModel{
		ID:          user.ID,
		Name:        user.Name,
		Email:       user.Email,
		Password:    user.Password,
		RegistionID: user.RegistionID,
	}, nil
}

func (repo *repository) EmailExists(ctx context.Context, email string) (bool, error) {
	var exists bool

	query := `
        SELECT 1
        FROM users 
        WHERE email = $1
        LIMIT 1
    `

	err := repo.db.QueryRowContext(
		ctx,
		query,
		email,
	).Scan(&exists)
	if err == sql.ErrNoRows {
		return false, nil
	}
	if err != nil {
		return false, err
	}

	return exists, nil
}

func (repo *repository) LoginUser(ctx context.Context, email, password string) (UserModel, error) {
	query := `
        SELECT
            id,
            name,
            email,
            password,
            COALESCE(reg_id, '') AS reg_id
        FROM users
        WHERE email = $1
    `

	var user UserModel
	err := repo.db.QueryRowContext(ctx, query, email).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.Password,
		&user.RegistionID,
	)
	if err != nil {
		return UserModel{}, err
	}

	return user, nil
}

func (repo *repository) CreateSession(ctx context.Context, session SessionModel) (SessionModel, error) {
	query := `
        INSERT INTO sessions
            (
                id,
                token_hash,
                expires_at
            )
        VALUES ($1, $2, $3)
        RETURNING id, token_hash, expires_at
    `

	var returned SessionModel
	err := repo.db.QueryRowContext(
		ctx,
		query,
		session.ID,
		session.TokenHash,
		session.ExpiredAt,
	).Scan(
		&returned.ID,
		&returned.TokenHash,
		&returned.ExpiredAt,
	)
	if err != nil {
		return SessionModel{}, err
	}

	return returned, nil
}

func (repo *repository) FindUserSession(ctx context.Context, tokenHash string) (SessionResponse, error) {
	var user UserModel
	var session SessionExpireModel

	query := `
        SELECT
            u.id,
            u.name,
            u.email,
            COALESCE(u.password, '') AS password,
            COALESCE(u.reg_id, '') AS reg_id,
            s.expires_at
        FROM sessions s
        INNER JOIN users u
            ON s.id = u.id
        WHERE s.token_hash = $1
          AND s.expires_at > NOW()
    `

	err := repo.db.QueryRowContext(ctx, query, tokenHash).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.Password,
		&user.RegistionID,
		&session.ExpiresAt,
	)
	if err != nil {
		return SessionResponse{}, err
	}

	return SessionResponse{
		Authenticated: true,
		User:          user,
		Session:       session,
	}, nil
}

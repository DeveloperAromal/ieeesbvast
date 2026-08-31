package hashing

import (
	"os"

	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"

	"golang.org/x/crypto/bcrypt"
)

type Algo interface {
	HashPassword(password string) (string, error)
	ComparePasswordHash(password string, hash string) (bool, error)
	RandomToken() (string, error)
	CreateSHA(token string) (string, error)
}

type algo struct{}

func NewAlgo() Algo {
	return &algo{}
}

func (al *algo) HashPassword(password string) (string, error) {

	salt := os.Getenv("PASSWORD_HASH_SALTED_KEY")
	pepperedHash := sha256.Sum256([]byte(password + salt))

	hashed, err := bcrypt.GenerateFromPassword(pepperedHash[:], bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}

	return string(hashed), nil
}

func (al *algo) ComparePasswordHash(password string, hash string) (bool, error) {

	salt := os.Getenv("PASSWORD_HASH_SALTED_KEY")
	pepperedHash := sha256.Sum256([]byte(password + salt))

	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(pepperedHash[:]))
	if err != nil {
		return false, err
	}

	return true, nil

}

func (al *algo) RandomToken() (string, error) {

	byt := make([]byte, 32)

	_, err := rand.Read(byt)
	if err != nil {
		return "", err
	}

	return hex.EncodeToString(byt), nil

}

func (al *algo) CreateSHA(token string) (string, error) {
	hash := sha256.Sum256([]byte(token))

	return hex.EncodeToString(hash[:]), nil
}

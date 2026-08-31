package mail

import (
	"fmt"
	"net/smtp"
	"os"
)

type Mail interface {
	SendMail(to []string, subject string, html string) error
}

type mail struct{}

func NewMail() Mail {
	return &mail{}
}

func (m *mail) SendMail(to []string, subject string, html string) error {
	from := os.Getenv("EMAIL_FROM")
	password := os.Getenv("EMAIL_PASSWORD")

	headers := fmt.Sprintf("Subject: %s\r\n", subject) +
		"MIME-Version: 1.0\r\n" +
		"Content-Type: text/html; charset=\"UTF-8\"\r\n\r\n"

	msg := []byte(headers + html)

	auth := smtp.PlainAuth(
		"",
		from,
		password,
		"smtp.gmail.com",
	)

	return smtp.SendMail(
		"smtp.gmail.com:587",
		auth,
		from,
		to,
		msg,
	)
}

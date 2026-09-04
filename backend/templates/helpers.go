package templates

import (
	"bytes"
	"html/template"
)

const (
	ColorBackground   = "#f6f7f9"
	ColorCard         = "#ffffff"
	ColorTextPrimary  = "#111827"
	ColorTextBody     = "#4b5563"
	ColorTextMuted    = "#9ca3af"
	ColorTextFooter   = "#b0b4ba"
	ColorAccent       = "#4f46e5"
	ColorBorder       = "#eef0f2"
	ColorCredentialBg = "#f9fafb"
)

func RenderInviteEmail(data InviteData) (string, error) {
	tmpl, err := template.New("invite").Parse(InviteEmailHTML)
	if err != nil {
		return "", err
	}

	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, data); err != nil {
		return "", err
	}

	return buf.String(), nil
}

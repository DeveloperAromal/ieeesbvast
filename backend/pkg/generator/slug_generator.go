package generator

import (
	_ "embed"
	"errors"
	"strings"
)

func slugify(name string) string {
	s := strings.ToLower(name)
	s = nonAlphanumeric.ReplaceAllString(s, "-")
	s = strings.Trim(s, "-")
	if len(s) > maxNameLen {
		s = strings.Trim(s[:maxNameLen], "-")
	}
	return s
}

func GenerateSlug(name string) (string, error) {
	base := slugify(name)
	if base == "" {
		return "", errors.New("name produced an empty slug")
	}

	var suffix strings.Builder
	for suffix.Len() < randomSuffixN {
		i, err := randomIndex(len(charset))
		if err != nil {
			return "", err
		}
		suffix.WriteByte(charset[i])
	}

	return base + "-" + suffix.String(), nil
}

package generator

import (
	_ "embed"
	"errors"
	"strings"
)

func GeneratePassword() (string, error) {
	if len(wordList) == 0 {
		return "", errors.New("word list is empty")
	}

	idx, err := randomIndex(len(wordList))
	if err != nil {
		return "", err
	}
	word := wordList[idx]

	var sb strings.Builder
	sb.WriteString(word)

	for sb.Len() < minLength || sb.Len()-len(word) < randomSuffixN {
		i, err := randomIndex(len(charset))
		if err != nil {
			return "", err
		}
		sb.WriteByte(charset[i])
	}

	return sb.String(), nil
}

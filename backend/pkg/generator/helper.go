package generator

import (
	"bufio"
	"crypto/rand"
	_ "embed"
	"math/big"
	"regexp"
	"strings"
)

//go:embed words.txt
var wordListData string

var nonAlphanumeric = regexp.MustCompile(`[^a-z0-9]+`)

var wordList = loadWords(wordListData)

func loadWords(data string) []string {
	var words []string
	scanner := bufio.NewScanner(strings.NewReader(data))
	for scanner.Scan() {
		w := strings.TrimSpace(scanner.Text())
		if w != "" {
			words = append(words, w)
		}
	}
	return words
}

const (
	charset       = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$!%&*"
	minLength     = 12
	randomSuffixN = 6
	maxNameLen    = 40
)

func randomIndex(max int) (int, error) {
	n, err := rand.Int(rand.Reader, big.NewInt(int64(max)))
	if err != nil {
		return 0, err
	}
	return int(n.Int64()), nil
}

package banner

import (
	"fmt"
	"os"
	"strings"

	"golang.org/x/term"
)

func Banner() {
	lines := []string{
		`  __     _______   _______   _______   ________  _______  ___      ___  __        ________  ___________  `,
		` |" \   /"     "| /"     "| /"     "| /"       )|   _  "\|"  \    /"  |/""\      /"       )("     _   ") `,
		` ||  | (: ______)(: ______)(: ______)(:   \___/ (. |_)  :)\   \  //  //    \    (:   \___/  )__/  \\__/  `,
		` |:  |  \/    |   \/    |   \/    |   \___  \   |:     \/  \\  \/. .//' /\  \    \___  \       \\_ /     `,
		` |.  |  // ___)_  // ___)_  // ___)_   __/  \\  (|  _  \\   \.    ////  __'  \    __/  \\      |.  |     `,
		` /\  |\(:      "|(:      "|(:      "| /" \   :) |: |_)  :)   \\   //   /  \\  \  /" \   :)     \:  |     `,
		`(__\_|_)\_______) \_______) \_______)(_______/  (_______/     \__/(___/    \___)(_______/       \__|    `,
	}

	width := 80
	if w, _, err := term.GetSize(int(os.Stdout.Fd())); err == nil && w > 0 {
		width = w
	}

	maxLen := 0
	for _, line := range lines {
		if len(line) > maxLen {
			maxLen = len(line)
		}
	}

	leftPad := (width - maxLen) / 2
	if leftPad < 0 {
		leftPad = 0
	}
	padding := strings.Repeat(" ", leftPad)

	fmt.Println()
	for _, line := range lines {
		fmt.Printf("\033[35m%s%s\033[0m\n", padding, line)
	}
	fmt.Println()
}

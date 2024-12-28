package day02

import (
	"github.com/reedlauber/adventofcode/pkg/helpers"
)

func Helper(data string) {
}

func Reports(data string) (reports [][]int) {
	lines := helpers.GetLines(data)

	for _, line := range lines {
		reports = append(reports, helpers.GetInts(line, " "))
	}

	return
}

func IsReportSafe(report []int) (safe bool) {
	var direction = 0; // -1 = decreasing, 0 = unset, 1 = increasing

	safe = true

	for i, num := range report {
		if i == 0 {
			continue
		}

		prev := report[i-1]
		diff := num - prev
		
		if (diff > 3 || diff < -3) {
			// fmt.Println("diff too large")
			safe = false
			break
		}

		var pairDirection = 0

		if (diff > 0) {
			pairDirection = 1
		} else if (diff < 0) {
			pairDirection = -1
		}

		if (i == 1) {
			direction = pairDirection
		}

		if (pairDirection == 0) {
			// fmt.Println("Pair is equal")
			safe = false
			break
		}

		if (pairDirection != direction) {
			// fmt.Println("Directions changed")
			safe = false
			break
		}
	}

	return
}

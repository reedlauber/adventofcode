package day01

import (
	"strconv"
	"strings"
)

func NumberPairs(data string) [][2]int {
  lines := strings.Split(data, "\n")

  var pairs [][2]int

  for _, line := range lines {
    var parts = strings.Split(line, "   ")
    var left, leftErr = strconv.Atoi(parts[0])
    if leftErr != nil {
      panic(leftErr)
    }
    var right, rightErr = strconv.Atoi(parts[1])
    if rightErr != nil {
      panic(rightErr)
    }

    pairs = append(pairs, [2]int{left, right})
  }

  return pairs
}

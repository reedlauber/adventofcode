package day01

import (
	"fmt"

	"github.com/spf13/cobra"

	"github.com/reedlauber/adventofcode/pkg/helpers"
)

func getRightSideCounts (pairs [][2]int) (map[int]int) {
  counts := make(map[int]int)

  for _, pair := range pairs {
    counts[pair[1]]++
  }

  return counts
}

func getLeftSideMultiples (pairs [][2]int, counts map[int]int) (m []int) {
  for _, pair := range pairs {
    count := counts[pair[0]]

    m = append(m, count * pair[0])
  }

  return
}

var Step2Cmd = &cobra.Command{
  Use:   "step2",
  Short: "Runs AoC solutions for 2024, day 1, step 2",
  Run: func(c *cobra.Command, args []string) {
    data := helpers.GetData(c, SampleData, RealData)
    pairs := NumberPairs(data)
    rightSideCounts := getRightSideCounts(pairs)
    multiples := getLeftSideMultiples(pairs, rightSideCounts)
    sum := helpers.GetSum(multiples)

		fmt.Println("2024, Day 1, Step 2")
    fmt.Println(sum)
  },
}

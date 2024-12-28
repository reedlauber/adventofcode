package day01

import (
	"fmt"
	"slices"

	"github.com/spf13/cobra"

	"github.com/reedlauber/adventofcode/pkg/helpers"
)

func sortedSides(data string) (left, right []int) {
  pairs := NumberPairs(data)

  for _, pair := range pairs {
    left = append(left, pair[0])
    right = append(right, pair[1])
  }

  slices.Sort(left)
  slices.Sort(right)

  return
}

func distances(data string) (distances []int) {
  var left, right = sortedSides(data)

  for i, _ := range left {
    diff := right[i] - left[i]

    if diff < 0 {
      diff = left[i] - right[i]
    }

    distances = append(distances, diff)
  }

  return
}

func sum(distances []int) (sum int) {
  for _, distance := range distances {
    sum += distance
  }

  return
}

var Step1Cmd = &cobra.Command{
  Use:   "step1",
  Short: "Runs AoC solutions for 2024, day 1, step 1",
  Run: func(c *cobra.Command, args []string) {
    data := helpers.GetData(c, SampleData, RealData)

    pairs := distances(data)
    sum := sum(pairs)

		fmt.Println("2024, Day 1, Step 1 ")
    fmt.Println(sum)
  },
}

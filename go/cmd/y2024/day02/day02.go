package day02

import (
	"fmt"

	"github.com/spf13/cobra"

	"github.com/reedlauber/adventofcode/pkg/helpers"
)

var Day02Cmd = &cobra.Command{
  Use:   "day2",
  Short: "Runs AoC solutions for 2024, day 2",
  Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("2024, Day 2")
  },
}

var Step1Cmd = &cobra.Command{
  Use:   "step1",
  Short: "Runs AoC solutions for 2024, day 2, step 1",
  Run: func(c *cobra.Command, args []string) {
		fmt.Println("2024, Day 0, Step 1")
    fmt.Println(Step1Result(helpers.GetData(c, SampleData, RealData)))
  },
}

var Step2Cmd = &cobra.Command{
  Use:   "step2",
  Short: "Runs AoC solutions for 2024, day 2, step 2",
  Run: func(c *cobra.Command, args []string) {
		fmt.Println("2024, Day 2, Step 2")
    fmt.Println(Step2Result(helpers.GetData(c, SampleData, RealData)))
  },
}

func init() {
  Day02Cmd.AddCommand(Step1Cmd)
  Day02Cmd.AddCommand(Step2Cmd)
}

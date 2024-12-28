package day00

import (
	"fmt"

	"github.com/spf13/cobra"

	"github.com/reedlauber/adventofcode/pkg/helpers"
)

var Day000Cmd = &cobra.Command{
  Use:   "day1",
  Short: "Runs AoC solutions for 2024, day 000",
  Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("2024, Day 1")
  },
}

var Step1Cmd = &cobra.Command{
  Use:   "step1",
  Short: "Runs AoC solutions for 2024, day 000, step 1",
  Run: func(c *cobra.Command, args []string) {
		fmt.Println("2024, Day 00, Step 1")
    fmt.Println(Step1Result(helpers.GetData(c, SampleData, RealData)))
  },
}

var Step2Cmd = &cobra.Command{
  Use:   "step2",
  Short: "Runs AoC solutions for 2024, day 000, step 2",
  Run: func(c *cobra.Command, args []string) {
		fmt.Println("2024, Day 000, Step 2")
    fmt.Println(Step2Result(helpers.GetData(c, SampleData, RealData)))
  },
}

func init() {
  Day000Cmd.AddCommand(Step1Cmd)
  Day000Cmd.AddCommand(Step2Cmd)
}

package day01

import (
	"fmt"

	"github.com/spf13/cobra"
)

var Day01Cmd = &cobra.Command{
  Use:   "day1",
  Short: "Runs AoC solutions for 2024, day 1",
  Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("2024, Day 1")
  },
}

func init() {
  Day01Cmd.AddCommand(Step1Cmd)
  Day01Cmd.AddCommand(Step2Cmd)
}

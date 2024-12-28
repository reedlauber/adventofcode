package y2024

import (
	"fmt"

	"github.com/spf13/cobra"

	"github.com/reedlauber/adventofcode/cmd/y2024/day01"
	"github.com/reedlauber/adventofcode/cmd/y2024/day02"
)

var Year2024Cmd = &cobra.Command{
  Use:   "2024",
  Short: "Runs AoC solutions for 2024",
  Long:  "Runs AoC solutions for 2024",
  Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("Year 2024")
  },
}

func init() {
	Year2024Cmd.AddCommand(day01.Day01Cmd)
	Year2024Cmd.AddCommand(day02.Day02Cmd)
}

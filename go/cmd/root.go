package cmd

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"

	"github.com/reedlauber/adventofcode/cmd/y2024"
)

var UseRealData bool

var rootCmd = &cobra.Command{
  Use:   "aoc",
  Short: "AoC is a tool to run Advent of Code solutions",
  Long: "Don't worry about it",
  Run: func(cmd *cobra.Command, args []string) {
    fmt.Println("AoC!")
  },
}

func Execute() {
  if err := rootCmd.Execute(); err != nil {
    fmt.Fprintln(os.Stderr, err)
    os.Exit(1)
  }
}

func init() {
  rootCmd.PersistentFlags().BoolVarP(&UseRealData, "real", "r", false, "Use real data")

  rootCmd.AddCommand(y2024.Year2024Cmd)
}

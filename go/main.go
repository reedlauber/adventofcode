package main

import (
	// "flag"
	// "fmt"
	// "time"

	"github.com/reedlauber/adventofcode/cmd"
	// "github.com/reedlauber/adventofcode/internal/2024/day01"
	// "github.com/reedlauber/adventofcode/pkg/day"
)

func main () {
	cmd.Execute()

	// defaultYear := time.Now().Year()

	// year := flag.Int("y", defaultYear, "Current year")
	// dayNum := flag.Int("d", 1, "Day to run")
	// step := flag.Int("s", 1, "Step to run")
	// realData := flag.Bool("r", false, "Use real data")

	// flag.Parse()

	// fmt.Println("AoC - year:", *year, "day", *dayNum, "step", *step, *realData)

	// days := map[int]map[int]day.AdventDay {
	// 	2024: {
	// 		1: day01.New(),
	// 	},
	// }

	// yearToRun := days[*year]

	// if yearToRun == nil {
	// 	fmt.Println("Year not found")
	// 	return
	// }

	// dayToRun := yearToRun[*dayNum]

	// if dayToRun == nil {
	// 	fmt.Println("Day not found")
	// 	return
	// }

	// if *step == 1 {
	// 	fmt.Println(dayToRun.Step1())
	// } else {
	// 	fmt.Println(dayToRun.Step2())
	// }
}

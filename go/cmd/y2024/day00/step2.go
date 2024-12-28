package day00

import (
	"github.com/reedlauber/adventofcode/pkg/helpers"
)

func Step2Result(data string) (r any) {
  lines := helpers.GetLines(data)
  return len(lines)
}

package day02

import (
	"slices"
)

func isDampenedReportSafe(report []int) (safe bool) {
  safe = IsReportSafe(report)

  if (safe) {
    return
  }

  for i, _ := range report {
    left := report[0:i]
    right := report[i+1:]
    reduced := slices.Concat(left, right)
    safe = IsReportSafe(reduced)
    if (safe) {
      break
    }
  }


  return
}

func Step2Result(data string) (r any) {
  reports := Reports(data)

  var safeReports [][]int

  for _, report := range reports {
    if isDampenedReportSafe(report) {
      safeReports = append(safeReports, report)
    }
  }

  return len(safeReports)
}

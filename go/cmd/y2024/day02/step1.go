package day02

func Step1Result(data string) (r any) {
  reports := Reports(data)
  var safeReports [][]int

  for _, report := range reports {
    if IsReportSafe(report) {
      safeReports = append(safeReports, report)
    }
  }

  return len(safeReports)
}

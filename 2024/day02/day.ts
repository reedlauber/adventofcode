import { DayBase } from '../../utils';

class Day extends DayBase {
  constructor(...args: ConstructorParameters<typeof DayBase>) {
    super(...args);
  }

  isReportSafe(report: number[]) {
    let isSafe = true;
    let direction = 0; // -1 = decreasing, 0 = unset, 1 = increasing

    for (let i = 0; i < report.length; i++) {
      if (i === 0) continue;

      const num = report[i];
      const prev = report[i - 1];
      const delta = num - prev;
      const deltaAbs = Math.abs(delta);

      if (deltaAbs > 3) {
        // console.log('unsafe', `(${i})`, prev, num, `~${deltaAbs}`);
        isSafe = false;
        break;
      }

      let pairDirection = 0;

      if (delta) {
        pairDirection = delta > 0 ? 1 : -1;
      }

      if (i === 1) {
        direction = pairDirection;
      }

      if (pairDirection === 0) {
        // console.log('unsafe', `(${i})`, prev, num, `==`);
        isSafe = false;
        break;
      }

      if (pairDirection === 0 || pairDirection !== direction) {
        // console.log('unsafe', `(${i})`, prev, num, `^ v`);
        isSafe = false;
        break;
      }
    }

    return isSafe;
  }

  isDampenedReportSafe(report: number[], r: number) {
    const isInitiallySafe = this.isReportSafe(report);

    if (isInitiallySafe) {
      return true;
    }

    let isSafe = false;

    for (let i = 0; i < report.length; i++) {
      const reducedReport = [...report.slice(0, i), ...report.slice(i + 1)];
      isSafe = this.isReportSafe(reducedReport);

      if (isSafe) {
        break;
      }
    }

    return isSafe;
  }

  getReports(): number[][] {
    return this.linesMap((line) => line.split(' ').map(Number));
  }

  step1() {
    return this.getReports().filter(this.isReportSafe).length;
  }

  step2() {
    return this.getReports().filter((report, i) =>
      this.isDampenedReportSafe(report, i)
    ).length;
  }
}

export { Day };

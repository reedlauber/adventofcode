import { DayBase } from '../../utils';

class Day extends DayBase {
  mulRE = /mul\((\d+),(\d+)\)/g;
  mulREStr = 'mul\\((\\d+),(\\d+)\\)';

  step1() {
    let match: RegExpExecArray | null = null;

    const muls: [number, number][] = [];

    while ((match = this.mulRE.exec(this.data))) {
      const [, a, b] = match;
      const n1 = Number(a);
      const n2 = Number(b);

      if (!Number.isNaN(n1) && !Number.isNaN(n2)) {
        muls.push([n1, n2]);
      }
    }

    return muls.map(([n1, n2]) => n1 * n2).reduce((acc, n) => acc + n, 0);
  }

  step2() {
    let enabled = true;
    let scanning = true;
    let position = 0;
    let scanData = this.data;

    const dos: number[] = [0];
    const donts: number[] = [];
    const muls: [number, number][] = [];

    const doRE = /do\(\)/g;
    const dontRE = /don't\(\)/g;
    const mulRE = /mul\((\d+),(\d+)\)/g;

    let doMatch: RegExpExecArray | null = null;
    while ((doMatch = doRE.exec(scanData))) {
      dos.push(doMatch.index);
    }

    let dontMatch: RegExpExecArray | null = null;
    while ((dontMatch = dontRE.exec(scanData))) {
      donts.push(dontMatch.index);
    }

    let mulMatch: RegExpExecArray | null = null;
    while ((mulMatch = mulRE.exec(this.data))) {
      const mIndex = mulMatch.index;
      const [, a, b] = mulMatch;
      const highestDo = dos.filter((d) => d < mIndex).pop() ?? 0;
      const highestDont = donts.filter((d) => d < mIndex).pop() ?? 0;

      if (highestDont > highestDo) {
        continue;
      }

      const n1 = Number(a);
      const n2 = Number(b);

      if (!Number.isNaN(n1) && !Number.isNaN(n2)) {
        muls.push([n1, n2]);
      }
    }

    return muls.map(([n1, n2]) => n1 * n2).reduce((acc, n) => acc + n, 0);
  }
}

export { Day };

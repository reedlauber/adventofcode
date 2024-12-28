import { DayBase } from "../../utils";

class Day extends DayBase {
  constructor(...args: ConstructorParameters<typeof DayBase>) {
    super(...args);
  }

  getNumberPairs(): [number, number][] {
    return this.linesMap((line) => {
      const [l, r] = line.split("   ").map(Number);
      return [l, r] as const;
    });
  }

  getSortedSides(): [number[], number[]] {
    const sides = this.getNumberPairs().reduce<[number[], number[]]>(
      (acc, [l, r]) => {
        acc[0].push(l);
        acc[1].push(r);
        return acc;
      },
      [[], []]
    );
    return [sides[0].sort(), sides[1].sort()];
  }

  getRightSideCounts(pairs: [number, number][]) {
    return pairs.reduce<{ [key: number]: number }>((acc, [, r]) => {
      acc[r] = acc[r] ? acc[r] + 1 : 1;
      return acc;
    }, {});
  }

  getLeftSideMulitples(
    pairs: [number, number][],
    rideSideCounts: { [key: number]: number }
  ) {
    return pairs.map<number>(([l]) => {
      const count = rideSideCounts[l] ?? 0;
      return l * count;
    });
  }

  step1() {
    const distances: number[] = [];
    const sides = this.getSortedSides();
    sides[0].forEach((l, i) => {
      distances.push(Math.abs(sides[1][i] - l));
    });

    return distances.reduce((acc, n) => acc + n, 0);
  }

  step2() {
    const pairs = this.getNumberPairs();
    const rideSideCounts = this.getRightSideCounts(pairs);
    const multiples = this.getLeftSideMulitples(pairs, rideSideCounts);

    return multiples.reduce((acc, n) => acc + n, 0);
  }
}

export { Day };

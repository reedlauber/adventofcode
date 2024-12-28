import { DayBase } from '../../utils';

class Day extends DayBase {
  cache: { [key: string]: number } = {};

  count(
    stone: string,
    depth: number,
    depths: { [key: number]: number }
  ): number {
    const cacheKey = `${stone}-${depth}`;
    let cached: number | undefined = this.cache[cacheKey];

    // this.log('\nDepth:', depth, 'Stone:', stone, 'Cached:', cached);

    if (depth === 0) {
      return 1;
    }

    if (typeof cached !== 'number') {
      if (stone === '0' || stone === '') {
        cached = this.count('1', depth - 1, depths);
      } else if (stone.length % 2 === 0) {
        const half = stone.length / 2;
        const left = Number(stone.substring(0, half));
        const right = Number(stone.substring(half));
        cached =
          this.count(`${left}`, depth - 1, depths) +
          this.count(`${right}`, depth - 1, depths);
      } else {
        cached = this.count(`${Number(stone) * 2024}`, depth - 1, depths);
      }

      this.cache[cacheKey] = cached;
    }

    return cached;
  }

  getCountRecursive(
    stones: string,
    times: number,
    depths: { [key: string]: number }
  ) {
    return stones
      .split(' ')
      .map((stone) => this.count(stone, times, depths))
      .reduce((acc, count) => acc + count, 0);
  }

  step1() {
    return this.getCountRecursive(this.data, 25, {});
  }

  step2() {
    return this.getCountRecursive(this.data, 75, {});
  }
}

export { Day };

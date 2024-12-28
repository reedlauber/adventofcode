import { DayBase } from '../../utils';

// white (w), blue (u), black (b), red (r), or green (g)
type Color = 'b' | 'g' | 'r' | 'u' | 'w';

interface Towel {
  code: string;
  colors: Color[];
}

interface Sequence {
  remaining: string;
  sequence: string[];
}

class Day extends DayBase {
  towels: string[] = [];
  singleTowels: { [key: string]: true } = {};
  multipleTowels: { [key: string]: string[] } = {};

  getInput(): [string[], string[]] {
    const [towelsRaw, designsRaw] = this.data.split('\n\n');
    let towels = towelsRaw.split(', ');

    towels.forEach((t) => {
      if (t.length === 1) {
        this.singleTowels[t] = true;
      } else {
        const key = t.substring(0, 2);
        this.multipleTowels[key] = this.multipleTowels[key] ?? [];
        this.multipleTowels[key].push(t);
      }
    });

    towels.sort((a, b) => {
      if (a.length < b.length) return 1;
      if (a.length > b.length) return -1;
      return 0;
    });

    this.towels = towels;

    const designs = designsRaw.split('\n');

    return [towels, designs];
  }

  isDesignPossible(design: string) {
    let matches = [design];

    while (true) {
      let match = matches.pop();

      if (!match) break;

      let usedTowels = 0;
      let trunk = match;

      // Evaluate whether each towel can be used at the start
      for (let t of this.towels) {
        // This towel can be used
        if (match.startsWith(t)) {
          if (usedTowels === 0) {
            // If this is the first match, trim off the matched part
            trunk = match.substring(t.length);
          } else {
            // Otherwise, create a new "branch" with this different kind of match
            matches.push(match.substring(t.length));
          }
          usedTowels++;
        }
      }

      // If we have a sequence that's been completely matched, this design is possible
      if (trunk.length === 0) {
        return true;
      }

      // If any towels were used, this sequence is still matching, so return it to be evaluated again
      if (usedTowels) {
        matches.push(trunk);
      }
    }

    return 0;
  }

  getPossibleCount() {
    const [, designs] = this.getInput();

    let count = designs.filter((design) =>
      this.isDesignPossible(design)
    ).length;

    return count;
  }

  countCache: { [key: string]: number } = {};

  getSegmentCount(segment: string, depth = 0): number {
    if (typeof this.countCache[segment] === 'number') {
      return this.countCache[segment];
    }

    if (segment.length === 1) {
      return this.singleTowels[segment] ? 1 : 0;
    }

    let count = 0;

    if (this.singleTowels[segment[0]]) {
      count += this.getSegmentCount(segment.substring(1), depth + 1);
    }

    const multipleKey = segment.substring(0, 2);
    const multiple = this.multipleTowels[multipleKey] ?? [];

    for (let m of multiple) {
      if (!segment.startsWith(m)) continue;
      const remaining = segment.substring(m.length);
      if (!remaining) {
        count++;
        continue;
      }
      count += this.getSegmentCount(remaining, depth + 1);
    }

    this.countCache[segment] = count;

    if (depth === 0) {
      console.log(`Segment: "${segment}" = ${count}`);
    }

    return count;
  }

  getSegmentCounts() {
    const [, designs] = this.getInput();
    return designs.map((design) => this.getSegmentCount(design));
  }

  step1() {
    return this.getPossibleCount();
  }

  step2() {
    return this.getSegmentCounts().reduce((acc, n) => acc + n, 0);
  }
}

export { Day };

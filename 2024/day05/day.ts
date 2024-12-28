import { DayBase } from '../../utils';

class Day extends DayBase {
  getRulesAndUpdates(): [[number, number][], number[][]] {
    const [rulesRaw, updatesRaw] = this.data.split('\n\n');

    const rules = rulesRaw.split('\n').map<[number, number]>((rule) => {
      const [x, y] = rule.split('|');
      return [Number(x), Number(y)];
    });

    const updates = updatesRaw
      .split('\n')
      .map<number[]>((update) => update.split(',').map(Number));

    return [rules, updates];
  }

  doesUpdatePassRule([x, y]: [number, number], update: number[]) {
    const updateX = update.indexOf(x);
    const updateY = update.indexOf(y);

    if (updateX === -1 || updateY === -1) return true;

    return updateY > updateX;
  }

  isUpdateValid(rules: [number, number][], update: number[]): boolean {
    return rules.every((rule) => this.doesUpdatePassRule(rule, update));
  }

  getValidUpdates(rules: [number, number][], updates: number[][]) {
    return updates.filter((update) => this.isUpdateValid(rules, update));
  }

  getSeparatedUpdates(
    rules: [number, number][],
    updates: number[][]
  ): [number[][], number[][]] {
    return updates.reduce<[number[][], number[][]]>(
      (acc, update) => {
        if (this.isUpdateValid(rules, update)) {
          acc[0].push(update);
        } else {
          acc[1].push(update);
        }

        return acc;
      },
      [[], []]
    );
  }

  getUpdatesSum(updates: number[][]) {
    return updates
      .map((update) => {
        const centerIndex = (update.length - 1) / 2;
        return update[centerIndex] ?? 0;
      })
      .reduce((acc, n) => acc + n, 0);
  }

  getValidUpdatesSum() {
    const [rules, updates] = this.getRulesAndUpdates();

    return this.getValidUpdates(rules, updates)
      .map((update) => {
        const centerIndex = (update.length - 1) / 2;
        return update[centerIndex] ?? 0;
      })
      .reduce((acc, n) => acc + n, 0);
  }

  getCorrectedUpdate(rules: [number, number][], update: number[]) {
    let corrected = [...update];

    const updateStr = update.join(',');

    let ruleIndex = 0;
    let rule = rules[ruleIndex];
    let count = 0;

    while (rule) {
      count++;
      if (count++ > 100000) {
        // if (updateStr === '97,13,75,29,47') {
        console.log('Infinite loop detected', updateStr);
        // }
        break;
      }

      if (this.doesUpdatePassRule(rule, corrected)) {
        rule = rules[++ruleIndex];
        // console.log(`rule ${ruleIndex} passed`, rule.join('|'));
        continue;
      }

      const [x, y] = rule;
      const updateX = corrected.indexOf(x);
      const updateY = corrected.indexOf(y);

      // if (
      //   updateStr === '97,13,75,29,47' ||
      //   updateStr ===
      //     '17,11,87,75,36,37,89,48,56,19,69,51,58,13,46,38,66,42,94,32,92,27,78'
      // ) {
      //   console.log('pre: ', corrected.join(','));
      //   console.log('Fix for rule', ruleIndex, [x, y]);
      // }

      corrected.splice(updateX, 1);
      corrected.splice(updateY, 0, x);

      // if (
      //   updateStr === '97,13,75,29,47' ||
      //   updateStr ===
      //     '17,11,87,75,36,37,89,48,56,19,69,51,58,13,46,38,66,42,94,32,92,27,78'
      // ) {
      //   console.log('post: ', corrected.join(','));
      //   console.log('');
      // }

      ruleIndex = 0;
      rule = rules[ruleIndex];
    }

    // console.log('iterations:', count);

    return corrected;
  }

  getCorrectedUpdatesSum() {
    const [rules, updates] = this.getRulesAndUpdates();

    const [, invalidUpdates] = this.getSeparatedUpdates(rules, updates);

    const corrected = invalidUpdates.map((update) =>
      this.getCorrectedUpdate(rules, update)
    );

    return this.getUpdatesSum(corrected);
  }

  step1() {
    return this.getValidUpdatesSum();
  }

  step2() {
    return this.getCorrectedUpdatesSum();
  }
}

export { Day };

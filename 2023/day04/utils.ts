import { DayBase } from '../../utils';

interface Card {
  id: string;
  winners: number[];
  nums: number[];
  numMatches: number;
  score: number;
  copies: Card[];
}

const getCard = (line: string): Card => {
  const [card, allNumsRaw] = line.split(': ');
  const id = card.replace(/[a-z :]/ig, '');
  const [winnersRaw, numsRaw] = allNumsRaw.split(' | ');
  const winners = winnersRaw.split(' ').filter(Boolean).map((num) => Number(num.trim()));
  const nums = numsRaw.split(' ').filter(Boolean).map((num) => Number(num.trim()));

  let score = 0;

  const numWinners = nums.filter((num) => winners.includes(num));

  if (numWinners.length) {
    score = numWinners.slice(1).reduce((acc) => acc * 2, 1);
  }

  return { id, winners, nums, numMatches: numWinners.length, score, copies: [] };
};

export const count = <T extends number>(items: T[], match: T | ((item: T) => boolean)) => {
  if (typeof match === 'function') {
    return items.filter(match).length;
  } else {
    return items.filter((item) => item === match).length
  }
};

export const sum = (nums: number[]) => nums.reduce((total, num) => total + num, 0);

class Day extends DayBase {
  constructor(...args: ConstructorParameters<typeof DayBase> ) {
    super(...args);
  }

  step1() {
    return this.lines.map(getCard).reduce((acc, n) => acc + n.score, 0);
  };

  step2() {
    const cards = this.lines
      .map(line => line.split(': ')[1])
      .map(line => line.replace(/  /g, ' '))
      .map(line => line.split(' | '))
      .map(sides => sides.map(side => side.split(' ').map(Number)));

    const cardCounts = cards.map(() => 1);

    cards.forEach(([winners, mine], c) => {
      const wonCount = count(mine, num => winners.includes(num));

      // console.log(`Card ${c+1}: won count: ${wonCount}`, winners, mine);

      for (let i = c + 1; i <= c + wonCount; i++) {
        // console.log(`loop num: ${i+1}, add: ${cardCounts[c]}`);
        if (i < cardCounts.length) {
          cardCounts[i] += cardCounts[c];
        }
      }
    });

    console.log(cardCounts);

    return sum(cardCounts);
  };
}


export { Day };

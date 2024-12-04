import { DayBase } from '../utils';

interface NumMatch {
  hasSymbol: boolean;
  num: number;
  numStr: string;
  surrounding: string;
  x: number;
  y: number;
}

const NumRE = /[\d]/;
const SymbolsRE = /[^\d\.]/;

const getSurrounding = (match: NumMatch, lines: string[]) => {
  const xStart = Math.max(match.x - match.numStr.length + 1, 0);
  const xEnd = match.x + 1;

  let surrounding = '';

  // Top
  surrounding += (lines[match.y - 1] ?? '').substring(xStart - 1, xEnd + 1);

  // Left
  surrounding += (lines[match.y] ?? '')[xStart - 1] ?? '';

  // Right
  surrounding += (lines[match.y] ?? '')[xEnd] ?? '';

  // Bottom
  surrounding += (lines[match.y + 1] ?? '').substring(xStart - 1, xEnd + 1);

  if (match.numStr === '812') {
    console.log('812: ', surrounding, match);
  }

  return surrounding;
};

const getNumbers = (lines: string[]) => {
  const matches: NumMatch[] = [];

  lines.forEach((line, y) => {
    let isMatching = false;
    let numStr = '';

    for(let x = 0; x < line.length; x++) {
      const c = line[x];

      if (NumRE.test(c)) {
        isMatching = true;
        numStr += c;
      } else if (isMatching) {
        const match: NumMatch = {
          hasSymbol: false,
          num: parseInt(numStr, 10),
          numStr,
          surrounding: '',
          x: x - 1,
          y
        };
        match.surrounding = getSurrounding(match, lines);
        match.hasSymbol = !!match.surrounding.match(SymbolsRE);
        matches.push(match);

        isMatching = false;
        numStr = '';
      }
    }
  });

  return matches;
};

class Day extends DayBase {
  constructor(...args: ConstructorParameters<typeof DayBase> ) {
    super(...args);
  }

  step1() {
    const matches = getNumbers(this.lines);
    // console.log(matches.filter((match) => !match.hasSymbol).map((m) => ({ n: m.numStr, surr: m.surrounding, sym: m.hasSymbol, 'x,y': `${m.x},${m.y}` })))
    return matches.filter((match) => match.hasSymbol).reduce((acc, match) => acc + match.num, 0);
  };

  step2() {
    return '';
  };
}


export { Day };

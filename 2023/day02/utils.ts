import { DayBase } from '../utils';

interface Game {
  id: string;
  idNum: number;
  maxBlue: number;
  maxGreen: number;
  maxRed: number;
  minBlue: number;
  minGreen: number;
  minRed: number;
  power: number;
}

interface Round {
  blue: number;
  green: number;
  red: number;
}


class Day extends DayBase {
  constructor(...args: ConstructorParameters<typeof DayBase> ) {
    super(...args);
  }

  getRounds = (roundsStr: string): Round[] => {
    const rounds = roundsStr.split('; ');
  
    return rounds.map((roundStr) => {
      const round = { blue: 0, green: 0, red: 0 };
      roundStr.split(', ').forEach((roundColor) => {
        const [num, color] = roundColor.split(' ');
        if (color === 'blue' || color === 'green' || color === 'red') {
          round[color] = Number(num);
        }
      });
      return round;
    });
  };
  

  getGame = (line: string): Game => {
    const [gameInfo, roundsStr] = line.split(': ');
    const [, id] = gameInfo.split(' ');
    const idNum = Number(id);

    const game: Game = { id, idNum, maxBlue: 0, maxGreen: 0, maxRed: 0, minBlue: 0, minGreen: 0, minRed: 0, power: 0 };

    this.getRounds(roundsStr).forEach((round) => {
      game.maxBlue = Math.max(game.maxBlue, round.blue);
      game.maxGreen = Math.max(game.maxGreen, round.green);
      game.maxRed = Math.max(game.maxRed, round.red);

      game.minBlue += round.blue;
      game.minGreen += round.green;
      game.minRed += round.red;
    });

    game.power = game.maxBlue * game.maxGreen * game.maxRed;

    return game;
  };

  step1() {
    const sum = this.linesMap(this.getGame)
      .filter((game) => game.maxBlue <= 14 && game.maxGreen <= 13 && game.maxRed <= 12)
      .reduce((acc, game) => acc + game.idNum, 0);
  
    return `${sum}`;
  };

  step2() {
    const sum = this.linesMap(this.getGame)
      .reduce((acc, game) => acc + game.power, 0);
  
    return `${sum}`;
  };
}

export { Day };

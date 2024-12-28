import { DayBase } from '../../utils';

interface Game {
  id: string;
  A: { x: number; y: number };
  B: { x: number; y: number };
  Cost: number;
  Prize: { x: number; y: number };
}

const HARR = Array.from(new Array(101)).map((_, i) => i);
const HARR2 = Array.from(new Array(10001)).map((_, i) => i);

const STEP2_MULTIPLE = 10000000000000;

class Day extends DayBase {
  getStep1PrizeCost(game: Game) {
    const axs: number[] = [];
    const ays: number[] = [];

    const bxs: number[] = [];
    const bys: number[] = [];

    for (let i = 0; i < HARR.length; i++) {
      axs.push(game.A.x * i);
      ays.push(game.A.y * i);

      bxs.push(game.B.x * i);
      bys.push(game.B.y * i);
    }

    let aTimes = -1;
    let bTimes = -1;

    bxs.forEach((bx, i) => {
      if (aTimes !== -1) return;
      axs.forEach((ax, j) => {
        const by = bys[i];
        const ay = ays[j];

        if (bx + ax === game.Prize.x && by + ay === game.Prize.y) {
          bTimes = i;
          aTimes = j;
        }
      });
    });

    if (aTimes > -1 && bTimes > -1) {
      return aTimes * 3 + bTimes;
    }

    // this.log(`Press A ${aTimes} times. Press B ${bTimes} times.`);

    return 0;
  }

  getStep2PrizeCost(game: Game) {
    const a =
      (game.B.x * game.Prize.y - game.B.y * game.Prize.x) /
      (game.B.x * game.A.y - game.B.y * game.A.x);
    const b = (game.Prize.x - game.A.x * a) / game.B.x;

    if (
      Math.abs(a - Math.round(a)) < 0.0001 &&
      Math.abs(b - Math.round(b)) < 0.0001
    ) {
      return Math.round(3 * a + b);
    }

    return 0;
  }

  getGame(data: string, i: number, step: 1 | 2): Game {
    const [aLine, bLine, pLine] = data.split('\n');
    const [, aCoordsRaw] = aLine.split(': ');
    const [, bCoordsRaw] = bLine.split(': ');
    const [, pCoordsRaw] = pLine.split(': ');

    const aCoords = aCoordsRaw
      .split(', ')
      .map((coord) => Number(coord.split('+')[1]));
    const bCoords = bCoordsRaw
      .split(', ')
      .map((coord) => Number(coord.split('+')[1]));
    const pCoords = pCoordsRaw
      .split(', ')
      .map((coord) => Number(coord.split('=')[1]));

    const prizeX = step === 1 ? pCoords[0] : pCoords[0] + STEP2_MULTIPLE;
    const prizeY = step === 1 ? pCoords[1] : pCoords[1] + STEP2_MULTIPLE;

    const game: Game = {
      id: `g-${i + 1}`,
      A: { x: aCoords[0], y: aCoords[1] },
      B: { x: bCoords[0], y: bCoords[1] },
      Cost: 0,
      Prize: { x: prizeX, y: prizeY },
    };

    if (step === 1) {
      game.Cost = this.getStep1PrizeCost(game);
    } else {
      game.Cost = this.getStep2PrizeCost(game);
    }

    return game;
  }

  getGames(step: 1 | 2 = 1): Game[] {
    return this.data
      .split('\n\n')
      .map<Game>((data, i) => this.getGame(data, i, step));
  }

  getGamesResult(games: Game[]) {
    return games.reduce<[number, number]>(
      (acc, game) => [acc[0] + (game.Cost ? 1 : 0), acc[1] + game.Cost],
      [0, 0]
    );
  }

  printGame(game: Game) {
    let output = `
Game: ${game.id}
  A: [${game.A.x}, ${game.A.y}]]
  B: [${game.B.x}, ${game.B.y}]]
  Prize: [${game.Prize.x}, ${game.Prize.y}]
  Cost: ${game.Cost}`;

    this.log(output);
  }

  step1() {
    const games = this.getGames();
    games.forEach((game) => this.printGame(game));
    const [, totalCost] = this.getGamesResult(games);
    return totalCost;
  }

  step2() {
    const games = this.getGames(2);
    games.forEach((game) => this.printGame(game));
    const [, totalCost] = this.getGamesResult(games);
    return totalCost;
  }
}

export { Day };

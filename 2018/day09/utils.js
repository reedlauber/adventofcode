const GAME_RE = /([0-9]+) players; last marble is worth ([0-9]+) points/;

const printGame = (circle, currentIndex, player) => {
  let output = '';

  for (let i = 0; i < circle.length; i++) {
    const marble = i === currentIndex ? `(${circle[i]})`.brightWhite : circle[i];
    output += `${marble} `;
  }

  const id = player ? player.id : '-';

  console.log(`[${id}] ${output}`);
};

const getGameInfo = (data) => {
  const [, playersRaw, pointsRaw] = data.match(GAME_RE);

  return { players: Number(playersRaw), last: Number(pointsRaw) };
};

const getScore = (game) => {
  const players = [{ id: `1`, score: 0 }];
  let currentPlayer = -1;

  const circle = [0];
  let marbleNum = 0;
  let currentIndex = 0;
  let running = true;
  let i = 0;
  let max = 50;

  printGame(circle, currentIndex);

  while (running) {
    currentPlayer++;
    if (currentPlayer >= game.players) {
      currentPlayer = 0;
    }
    players[currentPlayer] = players[currentPlayer] || { id: `${currentPlayer + 1}`, score: 0 };

    marbleNum++;

    if (marbleNum % 23 === 0) {
      let removeIndex = currentIndex - 7;

      if (removeIndex < 0) {
        removeIndex = circle.length + removeIndex;
      }

      const [removed] = circle.splice(removeIndex, 1);

      players[currentPlayer].score += (marbleNum + removed);

      currentIndex = removeIndex;

      if (currentIndex > circle.length - 1) {
        currentIndex = 0;
      }
    } else {
      let nextIndex = currentIndex + 2;

      if (nextIndex > circle.length) {
        nextIndex = 1;
      }
  
      circle.splice(nextIndex, 0, marbleNum);
  
      currentIndex = nextIndex;
    }

    // printGame(circle, currentIndex, players[currentPlayer]);

    // if (++i > max) {
    //   running = false;
    // }

    if (marbleNum > (game.last * 100)) {
      running = false;
    }
  }

  // console.log(players);

  const score = players.reduce((acc, p) => Math.max(acc, p.score), 0);

  return score;
};

const getResult = (data) => {
  const game = getGameInfo(data);
  const score = getScore(game);
  return score;
};

const getResult2 = (data) => {
  const game = getGameInfo(data);
  console.log(game);
  return '??';
};

module.exports = { getResult, getResult2 };

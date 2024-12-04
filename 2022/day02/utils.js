const OPP_SCORES = {
  A: 1, // Rock
  B: 2, // Paper
  C: 3, // Scissors
};

const CHOICE_SCORES = {
  X: 1, // Rock
  Y: 2, // Paper
  Z: 3, // Scissors
};

const OUTCOME_SCORES = {
  X: 0,
  Y: 3,
  Z: 6
};

const WINS = {
  A: 2, // Rock -> Paper
  B: 3, // Paper -> Scissors
  C: 1 // Scissors -> Rock
};

const DRAWS = {
  A: 1,
  B: 2,
  C: 3,
};

const LOSSES = {
  A: 3, // Rock -> Scissors
  B: 1, // Paper -> Rock
  C: 2 // Scissors -> Paper
};

const getRoundWinLossScore = (opp, self) => {
  if (opp === self) {
    return 3;
  }

  if ((self === 1 && opp === 3) || (self === 2 && opp === 1) || (self === 3 && opp === 2)) {
    return 6;
  }

  return 0;
};

const getSelfChoice = (opp, selfResult) => {
  if (selfResult === 'X') { // Lose
    return LOSSES[opp];
  }

  if (selfResult === 'Y') { // Draw
    return OPP_SCORES[opp];
  }

  if (selfResult === 'Z') { // Win
    return WINS[opp];
  }
};

const getRounds = (data) => {
  return data.split('\n').map((line) => {
    const [opp, self] = line.split(' ');
    const selfScore = CHOICE_SCORES[self];
    const roundScore = getRoundWinLossScore(OPP_SCORES[opp], selfScore);
    const total = selfScore + roundScore;
    return { opp, self, score: total, self: selfScore, round: roundScore };
  });
};

const getRounds2 = (data) => {
  return data.split('\n').map((line) => {
    const [opp, self] = line.split(' ');
    const outcome = OUTCOME_SCORES[self];
    const score = getSelfChoice(opp, self);
    return { opp, self, score: outcome + score };
  });
};

const getTotalScore = (data) => {
  const rounds = getRounds(data);
  return rounds.reduce((acc, round) => acc + round.score, 0);
};

const getTotalScore2 = (data) => {

  const rounds = getRounds2(data);
  return rounds.reduce((acc, round) => acc + round.score, 0);
};

module.exports = { getTotalScore, getTotalScore2 };

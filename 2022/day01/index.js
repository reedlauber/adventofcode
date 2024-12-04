const sampleData = require('./data-sample');
const realData = require('./data');
const { getLines, getMostCalories, getSortedElves } = require('./utils');

const step1 = (data) => {
  const lines = getLines(data);
  const max = getMostCalories(lines);
  return `${max}`;
};

const step2 = (data) => {
  const lines = getLines(data);
  const elves = getSortedElves(lines);
  let sum = 0;
  for (let i = 0; i < 3; i++) {
    sum += elves[i].sum;
  }
  return `${sum}`;
};

const getOutput = (step, useSample) => {
  const data = useSample ? sampleData : realData;
  const stepFn = step === 1 ? step1 : step2;
  return stepFn(data).brightWhite;
};

module.exports = { getOutput };

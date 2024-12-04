const sampleData = require('./data-sample');
const realData = require('./data');
const { getFrequencies, getLines } = require('./utils');

const step1 = (data) => {
  const lines = getLines(data);
  const output = lines.reduce((acc, num) => acc + num, 0);
  return `${output}`;
};

const step2 = (data) => {
  const freq = getFrequencies(data);
  return `${freq}`;
};

const getOutput = (step, useSample) => {
  const data = useSample ? sampleData : realData;
  const stepFn = step === 1 ? step1 : step2;
  return stepFn(data).brightWhite;
};

module.exports = { getOutput };

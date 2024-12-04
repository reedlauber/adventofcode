const sampleData = require('./data-sample');
const realData = require('./data');
const { getLines, getMatchID } = require('./utils');

const step1 = (data) => {
  const output = getLines(data);
  return `${output}`;
};

const step2 = (data) => {
  const output = getMatchID(data);
  return `${output}`;
};

const getOutput = (step, useSample) => {
  const data = useSample ? sampleData : realData;
  const stepFn = step === 1 ? step1 : step2;
  return stepFn(data).brightWhite;
};

module.exports = { getOutput };

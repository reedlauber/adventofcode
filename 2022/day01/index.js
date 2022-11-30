const sampleData = require('./data-sample');
const realData = require('./data');
const { getLines } = require('./utils');

const step1 = (data) => {
  const lines = getLines(data);
  return 'step 1';
};

const step2 = (data) => {
  const lines = getLines(data);
  return 'step 2';
};

const getOutput = (step, useSample) => {
  const data = useSample ? sampleData : realData;
  const stepFn = step === 1 ? step1 : step2;
  return stepFn(data).brightWhite;
};

module.exports = { getOutput };

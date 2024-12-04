const sampleData = require('./data-sample');
const realData = require('./data');
const { getGuardInfo, getGuardInfo2 } = require('./utils');

const step1 = (data) => {
  const output = getGuardInfo(data);
  return `${output}`;
};

const step2 = (data) => {
  const output = getGuardInfo2(data);
  return `${output}`;
};

const getOutput = (step, useSample) => {
  const data = useSample ? sampleData : realData;
  const stepFn = step === 1 ? step1 : step2;
  return stepFn(data).brightWhite;
};

module.exports = { getOutput };

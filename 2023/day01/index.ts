import {white} from 'colors';
import sampleData from './data-sample';
import realData from './data';

import  { getResult, getResult2 } from './utils';

const step1 = (data: string) => {
  const output = getResult(data);
  return `${output}`;
};

const step2 = (data: string) => {
  const output = getResult2(data);
  return `${output}`;
};

const getOutput = (step: number, useSample: boolean) => {
  const data = useSample ? sampleData : realData;
  const stepFn = step === 1 ? step1 : step2;
  return white(stepFn(data));
};

module.exports = { getOutput };

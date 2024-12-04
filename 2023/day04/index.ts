import { white } from 'colors';
import sampleData from './data-sample';
import realData from './data';

import  { Day } from './utils';

const getOutput = (dayNum: string, step: 1 | 2, useSample: boolean) => {
  const day = new Day(dayNum, step, useSample, useSample ? sampleData : realData);
  day.printResult();
};

module.exports = { getOutput };

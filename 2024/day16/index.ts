import sampleData from './data-sample';
import realData from './data';

import { Day } from './day4';

const getOutput = async (dayNum: string, step: 1 | 2, useSample: boolean) => {
  const day = new Day(
    dayNum,
    step,
    useSample,
    useSample ? sampleData : realData
  );
  await day.printResult();
};

module.exports = { getOutput };

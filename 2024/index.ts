import { createNextDay, getDayArg, getStepArg } from './utils';

if (process.argv.includes('next')) {
  createNextDay();
  process.exit(0);
} else {
  try {
    const dayNum = getDayArg().toString().padStart(2, '0');
    const dayDir = `day${dayNum}`;
    const step = getStepArg();

    const dayModule = require(`./${dayDir}`) as {
      getOutput: (
        dayNum: string,
        step: number,
        useSample: boolean
      ) => Promise<string>;
    };

    const shouldUseSample = !process.argv.includes('-r');

    if (!dayModule) {
      throw new Error(`There is no day "${dayNum}" yet`);
    }

    dayModule.getOutput(dayNum, step, shouldUseSample).then(() => {
      process.exit(0);
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

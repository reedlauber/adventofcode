const colors = require('colors');

const { getDay, getStep, nextDay } = require('./utils');

if (process.argv.includes('next')) {
  nextDay();
  process.exit(0);
} else {
  try {
    const dayNum = getDay().toString().padStart(2, '0');
    const dayDir = `day${dayNum}`;
    const step = getStep();
  
    const dayModule = require(`./${dayDir}`);
  
    const shouldUseSample = !process.argv.includes('-r');
    
    if (!dayModule) {
      throw new Error(`There is no day "${dayNum}" yet`);
    }
    
    const output = dayModule.getOutput(step, shouldUseSample);
    
    console.log(output);

    process.exit(0);
  } catch(err) {
    console.error(err);
    process.exit(1);
  }
}

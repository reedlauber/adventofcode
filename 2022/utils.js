const fs = require('fs');

const getDay = () => {
  const dayIndex = process.argv.findIndex((arg) => arg === '-d');

  if (dayIndex < 0) {
    throw new Error('Day not supplied');
  }

  const day = Number(process.argv[dayIndex + 1]);

  if (Number.isNaN(day)) {
    throw new Error('Day was not a number');
  }

  if (day <1 || day > 25) {
    throw new Error('Day must be between "1" and "25');
  }

  return day;
};

const getStep = () => {
  const stepIndex = process.argv.findIndex((arg) => arg === '-s');

  if (stepIndex < 0) {
    throw new Error('Step not supplied');
  }

  const step = Number(process.argv[stepIndex + 1]);

  if (Number.isNaN(step)) {
    throw new Error('Step was not a number');
  }

  if (step !== 1 && step !== 2) {
    throw new Error('Step must be "1" or "2"');
  }

  return step;
};

const nextDay = () => {
  const dayDirs = fs.readdirSync('./').filter((item) => item.startsWith('day'));

  const maxDay = dayDirs.reduce((acc, dir) => {
    const num = Number(dir.substring(3));
    if (!Number.isNaN(num) && num > acc) {
      return num;
    }
    return acc;
  }, 0);

  const nextDay = `${maxDay + 1}`.padStart(2, '0');
  const nextDir = `./day${nextDay}`;

  fs.mkdirSync(nextDir);
  fs.copyFileSync('./day00/data-sample.js', `${nextDir}/data-sample.js`);
  fs.copyFileSync('./day00/data.js', `${nextDir}/data.js`);
  fs.copyFileSync('./day00/index.js', `${nextDir}/index.js`);
  fs.copyFileSync('./day00/utils.js', `${nextDir}/utils.js`);
  console.log(`Created new day: ${nextDay}`);
};

module.exports = { getDay, getStep, nextDay };

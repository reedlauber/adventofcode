import fs from 'fs';
import { bold, dim, green, red, underline, white } from 'colors';

const getDayArg = () => {
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

const getStepArg = () => {
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

const createNextDay = () => {
  const year = '2023';
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
  fs.copyFileSync(`./day00/data-sample.ts`, `${nextDir}/data-sample.ts`);
  fs.copyFileSync(`./day00/data.ts`, `${nextDir}/data.ts`);
  fs.copyFileSync(`./day00/index.ts`, `${nextDir}/index.ts`);
  fs.copyFileSync(`./day00/utils.ts`, `${nextDir}/utils.ts`);
  console.log(`Created new day: ${nextDay}`);
};

export abstract class DayBase {
  _data: string;
  _day: string;
  _isSample: boolean;
  _step: 1 | 2;

  constructor(day: string, step: 1 | 2, isSample: boolean, data: string) {
    this._day = day;
    this._data = data;
    this._isSample = isSample;
    this._step = step;
  }

  protected get lines() {
    return this._data.split('\n')
  }

  protected linesMap<T>(mapFn: (line: string) => T) {
    return this.lines.map<T>(mapFn);
  }

  abstract step1(): number | string | undefined;

  abstract step2(): number | string | undefined;

  getResult = (): number | string => (this._step === 1 ? this.step1() : this.step2()) ?? 'unset';

  printResult = () => {
    const result = this.getResult();
    const dayText = green('Day');
    const day = red(this._day);
    const stepText = green('step');
    const step = red(this._step.toString());
    const dataType = dim(this._isSample ? ' (sample)' : '');
    console.log(white(`${dayText} ${day}, ${stepText} ${step}${dataType}: ${underline(bold(result.toString()))}`));
  };
}

export { createNextDay, getDayArg, getStepArg };

import fs from 'node:fs';
import { bold, dim, green, red, underline, white } from 'colors';

export interface DayBaseInterface {
  step1?: () => number | string | undefined;
  step1Async?: () => Promise<number | string | undefined>;

  step2?: () => number | string | undefined;
  step2Async?: () => Promise<number | string | undefined>;
}

export abstract class DayBase implements DayBaseInterface {
  private _data: string;
  private _day: string;
  private _isAsync: boolean;
  private _isSample: boolean;
  private _lines: string[];
  private _logging: boolean;
  private _sleepMs: number;
  private _step: 1 | 2;

  constructor(day: string, step: 1 | 2, isSample: boolean, data: string) {
    this._day = day;
    this._data = data;
    this._isAsync = false;
    this._isSample = isSample;
    this._lines = data.split('\n');
    this._logging = isSample;
    this._sleepMs = 500;
    this._step = step;
  }

  protected savedDataFileName = (fileName: string) =>
    `./day${this._day}/${fileName}${this.isSample ? '-sample' : ''}.txt`;

  protected get isSample() {
    return this._isSample;
  }

  protected get data() {
    return this._data;
  }

  protected get lines() {
    return this._lines;
  }

  protected get step() {
    return this._step;
  }

  protected set isAsync(value: boolean) {
    this._isAsync = value;
  }

  protected set sleepMs(value: number) {
    this._sleepMs = value;
  }

  protected linesMap<T>(mapFn: (line: string, index: number) => T) {
    return this.lines.map<T>(mapFn);
  }

  protected set logging(value: boolean) {
    this._logging = value;
  }

  protected log(...args: any[]) {
    if (!this._logging) return;
    console.log(...args);
  }

  protected async sleep(ms?: number) {
    const sleepMs = ms ?? this._sleepMs;
    if (sleepMs <= 0) return;

    return new Promise((resolve) => {
      setTimeout(resolve, sleepMs);
    });
  }

  protected saveData(fileName: string, data: string) {
    fs.writeFileSync(this.savedDataFileName(fileName), data, 'utf-8');
  }

  protected getSavedData(
    fileName: string,
    generator?: () => string,
    force = false
  ) {
    if (!force && fs.existsSync(this.savedDataFileName(fileName))) {
      return fs.readFileSync(this.savedDataFileName(fileName), 'utf-8');
    } else if (generator) {
      const data = generator();
      this.saveData(fileName, data);
      return data;
    }
    return '';
  }

  step1(): number | string | undefined {
    return 'unset';
  }

  step1Async(): Promise<number | string | undefined> {
    return Promise.resolve('unset');
  }

  step2(): number | string | undefined {
    return;
  }

  step2Async(): Promise<number | string | undefined> {
    return Promise.resolve('unset');
  }

  getResult = async (): Promise<number | string> => {
    if (this._isAsync) {
      return (
        (await (this._step === 1 ? this.step1Async() : this.step2Async())) ??
        'unset'
      );
    } else {
      return Promise.resolve(
        (this._step === 1 ? this.step1() : this.step2()) ?? 'unset'
      );
    }
  };

  printResult = async () => {
    const result = await this.getResult();
    const dayText = green('Day');
    const day = red(this._day);
    const stepText = green('step');
    const step = red(this._step.toString());
    const dataType = dim(this._isSample ? ' (sample)' : '');
    console.log(
      white(
        `${dayText} ${day}, ${stepText} ${step}${dataType}: ${underline(
          bold(result.toString())
        )}`
      )
    );
  };
}

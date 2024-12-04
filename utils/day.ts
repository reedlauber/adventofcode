import { bold, dim, green, red, underline, white } from 'colors';

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

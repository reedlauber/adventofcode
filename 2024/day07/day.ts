import { DayBase } from '../../utils';

interface Equation {
  test: number;
  values: number[];
}

class Day extends DayBase {
  getCycledOperators1(ops: string[]): string[] {
    const cycled = [...ops];

    for (let i = ops.length - 1; i >= 0; i--) {
      const op = ops[i];

      if (op === '+') {
        cycled[i] = '*';
        break;
      } else {
        cycled[i] = '+';
      }
    }

    return cycled;
  }

  getCycledOperators2(ops: string[]): string[] {
    const cycled = [...ops];

    for (let i = ops.length - 1; i >= 0; i--) {
      const op = ops[i];

      if (op === '+') {
        cycled[i] = '*';
        break;
      } else if (op === '*') {
        cycled[i] = '||';
        break;
      } else {
        cycled[i] = '+';
      }
    }

    return cycled;
  }

  isSolveable1(eq: Equation): boolean {
    let ops = Array.from(new Array(eq.values.length - 1), () => '+');

    this.log('\neq:', eq.test, eq.values);

    while (true) {
      let result = eq.values[0];

      for (let s = 0; s < ops.length; s++) {
        const op = ops[s];
        const next = eq.values[s + 1];

        if (op === '+') {
          result += next;
        } else {
          result *= next;
        }
      }

      this.log('ops:', ops, 'result:', result, result === eq.test);

      if (result === eq.test) {
        return true;
      }

      if (ops.every((op) => op === '*')) {
        break;
      }

      ops = this.getCycledOperators1(ops);
    }

    return false;
  }

  isSolveable2(eq: Equation): boolean {
    let ops = Array.from(new Array(eq.values.length - 1), () => '+');

    this.log('\neq:', eq.test, eq.values);

    while (true) {
      let values = '';

      for (let s = 0; s < ops.length; s++) {
        const op = ops[s];
        const left = eq.values[s];
        const right = eq.values[s + 1];

        if (op === '+') {
          values += `(${left} + ${right})`;
        } else if (op === '*') {
          values += `${left} * ${right}`;
        } else {
          values += `${left}${right}`;
        }
      }

      this.log('values:', values);

      const result = eval(values);

      this.log('ops:', ops, 'result:', values, result, result === eq.test);

      if (result === eq.test) {
        return true;
      }

      if (ops.every((op) => op === '*')) {
        break;
      }

      ops = this.getCycledOperators2(ops);
    }

    return false;
  }

  isSolveable3(eq: Equation): boolean {
    let ops = Array.from(new Array(eq.values.length - 1), () => '+');

    this.log('\neq:', eq.test, eq.values);

    let values = [...eq.values];

    while (true) {
      values = [...eq.values];
      let result = values[0];

      this.log('\nops:', ops);

      const concatOps = ops.filter((op) => op === '||');

      for (let s = 0; s < ops.length; s++) {
        if (ops[s] === '||' && s < ops.length - 1) {
          const pre = values.join(' ');
          values.splice(s, 2, Number(`${values[s]}${values[s + 1]}`));
          this.log('replace', pre, 'with', values.join(' '));

          if (s === 0) {
            result = values[0];
          }
        }
      }

      if (concatOps.length) {
        this.log('values', eq.values.join(' '), '=>', values.join(' '));
      } else {
        this.log('values', values.join(' '));
      }

      const mathOps = ops.filter((op) => op !== '||');

      for (let s = 0; s < mathOps.length; s++) {
        const op = mathOps[s];
        const next = values[s + 1];

        if (op === '+') {
          this.log(s, 'add', next, 'to', result);
          result += next;
        } else if (op === '*') {
          this.log(s, 'multiply', next, 'with', result);
          result *= next;
        }
      }

      this.log('values:', values, 'result:', result, result === eq.test);

      if (result === eq.test) {
        return true;
      }

      if (mathOps.length === 0) {
        break;
      }

      ops = this.getCycledOperators2(ops);
    }

    return false;
  }

  isSolveable4(eq: Equation): boolean {
    let ops = Array.from(new Array(eq.values.length - 1), () => '+');

    this.log('\neq:', eq.test, eq.values);

    let values = [...eq.values];

    while (true) {
      values = [...eq.values];

      this.log('\nops:', ops);
      this.log('values:', values.join(' '));

      for (let s = 0; s < ops.length; s++) {
        const op = ops[s];
        const left = values[0];
        const right = values[1];

        if (op === '+') {
          values.splice(0, 2, left + right);
          this.log(`${s})`, left, '+', right, `(${values.join(' ')})`);
        } else if (op === '*') {
          values.splice(0, 2, left * right);
          this.log(`${s})`, left, '*', right, `(${values.join(' ')})`);
        } else {
          values.splice(0, 2, Number(`${left}${right}`));
          this.log(`${s})`, left, '||', right, `(${values.join(' ')})`);
        }
      }

      this.log('values:', values.join(' '));
      const result = values[0];
      this.log('result:', result, result === eq.test);

      if (result === eq.test) {
        return true;
      }

      if (ops.every((op) => op === '||')) {
        break;
      }

      ops = this.getCycledOperators2(ops);
    }

    return false;
  }

  getEquations(): Equation[] {
    return this.linesMap<Equation>((line) => {
      const [testRaw, valuesRaw] = line.split(': ');
      return {
        test: Number(testRaw),
        values: valuesRaw.split(' ').map(Number),
      };
    });
  }

  step1() {
    const equations = this.getEquations();
    const solveable = equations.filter((eq) => this.isSolveable1(eq));
    const sum = solveable.reduce((acc, eq) => acc + eq.test, 0);

    return sum;
  }

  step2() {
    const equations = this.getEquations();
    const solveable = equations.filter((eq) => this.isSolveable4(eq));
    const sum = solveable.reduce((acc, eq) => acc + eq.test, 0);

    return sum;
  }
}

export { Day };

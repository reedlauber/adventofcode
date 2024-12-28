import { DayBase } from '../../utils';

interface Registers {
  A: bigint;
  B: bigint;
  C: bigint;
}

class Day extends DayBase {
  registers: Registers = {
    A: 0n,
    B: 0n,
    C: 0n,
  };

  getInput(): bigint[] {
    const [registersRaw, programRaw] = this.data.split('\n\n');

    registersRaw.split('\n').forEach((line, i) => {
      const [, numStr] = line.split(': ');
      if (i === 0) {
        this.registers.A = BigInt(numStr);
      }
      if (i === 1) {
        this.registers.B = BigInt(numStr);
      }
      if (i === 2) {
        this.registers.C = BigInt(numStr);
      }
    });

    const program: bigint[] = programRaw.split(' ')[1].split(',').map(BigInt);

    return program;
  }

  combo(operand: bigint): bigint {
    if (operand <= 3) return operand;
    if (operand === 4n) return this.registers.A;
    if (operand === 5n) return this.registers.B;
    if (operand === 6n) return this.registers.C;
    return -1n;
  }

  adv(operand: bigint) {
    const combo = this.combo(operand);
    this.registers.A = this.registers.A / 2n ** combo;
  }

  bxl(operand: bigint) {
    this.registers.B = this.registers.B ^ operand;
  }

  bst(operand: bigint) {
    const combo = this.combo(operand);
    this.registers.B = combo % 8n;
  }

  jnz(operand: bigint) {
    if (this.registers.A === 0n) return;
    return Number(operand);
  }

  bxc(operand: bigint) {
    this.registers.B = this.registers.B ^ this.registers.C;
  }

  out(operand: bigint) {
    return this.combo(operand) % 8n;
  }

  bdv(operand: bigint) {
    const combo = this.combo(operand);
    this.registers.B = this.registers.A / 2n ** combo;
  }

  cdv(operand: bigint) {
    const combo = this.combo(operand);
    this.registers.C = this.registers.A / 2n ** combo;
  }

  run(program: bigint[], a: bigint) {
    this.registers = {
      A: a,
      B: 0n,
      C: 0n,
    };

    let pointer = 0;
    const out: bigint[] = [];

    while (true) {
      const op = program[pointer];
      const operand = program[pointer + 1];
      const next = pointer + 2;

      if (typeof op === 'undefined') break;

      if (op === 0n) {
        this.adv(operand);
        pointer = next;
      } else if (op === 1n) {
        this.bxl(operand);
        pointer = next;
      } else if (op === 2n) {
        this.bst(operand);
        pointer = next;
      } else if (op === 3n) {
        pointer = this.jnz(operand) ?? next;
      } else if (op === 4n) {
        this.bxc(operand);
        pointer = next;
      } else if (op === 5n) {
        out.push(this.out(operand));
        pointer = next;
      } else if (op === 6n) {
        this.bdv(operand);
        pointer = next;
      } else if (op === 7n) {
        this.cdv(operand);
        pointer = next;
      }
    }

    return out.join(',');
  }

  step1() {
    const program = this.getInput();

    return this.run(program, this.registers.A);
  }

  step2() {
    const program = this.getInput();
    const expected = program.join(',');

    let i = 0n;

    while (true) {
      const result = this.run(program, i);

      if (i % 1000000n === 0n) {
        console.log(i, result);
      }

      if (result === expected) {
        break;
      }

      if (expected.endsWith(result)) {
        i = i * 8n;
      } else {
        i++;
      }
    }

    return Number(i);
  }
}

export { Day };

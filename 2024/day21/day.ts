import { DayBase } from '../../utils';

import { ARROW_SEQS, NUM_SEQS } from './helpers';

interface DoorCode {
  final: string;
  len: number;
  num: number;
  sequences: string[][];
  text: string;
}

const CODE: DoorCode = {
  final: '',
  len: 0,
  num: 0,
  sequences: [],
  text: '',
};

class Day extends DayBase {
  getSequence(code: string, sourceType: 'arrows' | 'nums'): string[] {
    const KEYS = sourceType === 'nums' ? NUM_SEQS : ARROW_SEQS;

    let sequences = [''];

    let pos = 'A';

    code.split('').forEach((char) => {
      const key = `${pos} # ${char}`;
      const seqs = KEYS[key];

      if (seqs) {
        sequences = sequences.map((s) => `${s}A`);
        seqs.slice(1).forEach(() => {
          sequences.push(``);
        });
        // sequences += `${KEYS[key]?.[0].s ?? ''}A`;
      }
      pos = char;
    });

    return sequences;
  }

  getSequences(code: DoorCode): string[] {
    code.sequences[0] = this.getSequence(code.text, 'nums');

    code.sequences[1] = code.sequences[0]
      .map<string[]>((code) => this.getSequence(code, 'arrows'))
      .reduce((acc, ss) => [...acc, ...ss], []);

    code.sequences[2] = code.sequences[1]
      .map<string[]>((code) => this.getSequence(code, 'arrows'))
      .reduce((acc, ss) => [...acc, ...ss], []);

    return code.sequences[2];
  }

  getShortestSequence(code: DoorCode): string {
    let sequences: string[] = this.getSequences(code);

    sequences.sort((a, b) => {
      if (a.length > b.length) return -1;
      if (a.length < b.length) return 1;
      return 0;
    });

    code.final = sequences[0];

    return code.final;
  }

  getDoorCodeComplexity(code: DoorCode): number {
    code.num = Number(code.text.substring(0, 3));
    code.len = this.getShortestSequence(code).length;
    return code.num * code.len;
  }

  step1() {
    const codes = this.lines
      .map<DoorCode>((line) => ({ ...CODE, text: line }))
      .splice(4, 5);
    const complexities = codes.map((code) => this.getDoorCodeComplexity(code));
    console.log(codes[0].sequences);
    return complexities.reduce((acc, c) => acc + c, 0);
  }

  step2() {
    console.log(ARROW_SEQS);
    // const times = 5;
    // ['>', '^', 'v', '<'].forEach((code) => {
    //   console.log(`\n1. (  1) ${code}`);
    //   Array.from(new Array(times)).forEach((_, i) => {
    //     code = this.getSequence(code, 'arrows');
    //     console.log(
    //       `${i + 2}. (${code.length.toString().padStart(3, ' ')}) ${code}`
    //     );
    //   });
    // });
    return '';
  }
}

export { Day };

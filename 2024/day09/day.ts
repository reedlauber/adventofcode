import { DayBase } from '../../utils';

class Day extends DayBase {
  getRepeatedValue(c: string, times: number) {
    return Array.from(new Array(times))
      .map(() => c)
      .join('');
  }

  getIDedBlocks(data: string, force = false) {
    return this.getSavedData(
      'blocks',
      () => {
        let blocks = '';

        for (let i = 0, len = data.length; i < len; i++) {
          const num = Number(data[i]);

          if (i % 2 === 0) {
            blocks += this.getRepeatedValue(`${i / 2}\n`, num);
          } else {
            blocks += this.getRepeatedValue('.\n', num);
          }
        }

        return blocks.trim();
      },
      force
    );
  }

  getStep2IDedBlocks(data: string, force = false) {
    return this.getSavedData(
      'blocks-step2',
      () => {
        let blocks = '';

        for (let i = 0, len = data.length; i < len; i++) {
          const num = Number(data[i]);

          if (i % 2 === 0) {
            blocks += `${num}:` + this.getRepeatedValue(`${i / 2}`, num);
            // blocks += `${this.getRepeatedValue(`[${i / 2}]`, num)}`;
          } else {
            blocks += this.getRepeatedValue('.', num);
          }

          if (num > 0) {
            blocks += '\n';
          }
        }

        return blocks.trim();
      },
      force
    );
  }

  getCompactedBlocks(blocks: string, force = false) {
    return this.getSavedData(
      'compacted',
      () => {
        let compacted = blocks;
        let iterations = 0;

        while (true) {
          iterations++;

          let blocksArr = compacted.split('\n');
          const blockToMoveIndex = blocksArr.length - 1;
          const blockToMove = blocksArr[blockToMoveIndex];

          if (blockToMove === '.') {
            compacted = compacted.substring(0, compacted.length - 2);
            continue;
          }

          const availableSpace = blocksArr.findIndex((b) => b === '.');

          // Move block to available space
          blocksArr.splice(availableSpace, 1, blockToMove);

          // Trim moved block off end
          blocksArr = blocksArr.slice(0, blocksArr.length - 1);
          compacted = blocksArr.join('\n');

          this.log('move', blockToMove, 'to position', availableSpace);

          if (!/\./.test(compacted)) {
            break;
          }
        }

        return compacted;
      },
      force
    );
  }

  getStep2CompactedBlocks(blocks: string, force = false) {
    return this.getSavedData(
      'compacted-step2',
      () => {
        // Make a copy
        let compacted = blocks;
        let files = compacted.split('\n');

        let indexedFiles: [index: number, file: string][] = [];

        files.forEach((file, i) => {
          if (file.startsWith('.')) return;
          indexedFiles.push([i, file]);
        });

        let offset = 0;
        let iterations = 0;

        while (true) {
          let compactedArr = compacted.split('\n');
          const reversed = [...compactedArr].reverse();
          const reversedFileIndex = reversed.findIndex(
            (b, i) => i >= offset && b[0] != '.'
          );

          if (reversedFileIndex === -1) {
            break;
          }

          // if (++iterations > 10) {
          //   break;
          // }

          const fileIndex = compactedArr.length - 1 - reversedFileIndex;
          const file = compactedArr[fileIndex];
          const [len, fileId] = compactedArr[fileIndex].split(':');

          const spaces = this.getRepeatedValue('.', Number(len));
          const spaceIndex = compactedArr.findIndex((b) =>
            b.startsWith(spaces)
          );

          if (spaceIndex > -1 && spaceIndex < fileIndex) {
            const remainingSpace = compactedArr[spaceIndex].substring(
              spaces.length
            );

            compactedArr.splice(spaceIndex, 1, file);
            compactedArr[fileIndex] = spaces;

            if (remainingSpace.length) {
              compactedArr.splice(spaceIndex + 1, 0, remainingSpace);
            }

            compacted = compactedArr
              .join('\n')
              .trim()
              .replace(/(\.)\n(\.)/g, '..');
          } else {
            offset = reversedFileIndex + 1;
            // this.log('  no space found');
          }
        }

        return compacted; //.replace(/(^|\n)\d+:/g, '$1');
      },
      force
    );
  }

  getChecksum(blocks: string) {
    const entries = blocks.split('\n');
    const len = entries.length;

    let sum = 0;
    let sumStr = '';
    let p = 0;

    for (let i = 0; i < len; i++) {
      const entry = entries[i].trim();

      if (entry[0] === '.') {
        p += entry.length;
        continue;
      }

      const [count, value] = entry.split(':');
      const countN = Number(count);
      const size = value.length / countN;
      const id = value.substring(0, Number(size));

      for (let j = 0; j < countN; j++) {
        sum += p * Number(id);
        sumStr += `${p}*${id}+`;
        p++;
      }

      // sum += Number(id) * p;
      // sumStr += `${p}*${entry}+`;
    }

    // this.log(sumStr);

    return sum;
  }

  step1() {
    const blocks = this.getIDedBlocks(this.data, false);
    const compacted = this.getCompactedBlocks(blocks, false);
    return this.getChecksum(compacted);
  }

  step2() {
    const blocks = this.getStep2IDedBlocks(this.data, true);
    const compacted = this.getStep2CompactedBlocks(blocks, true);
    return this.getChecksum(compacted);

    // return '';
  }
}

export { Day };

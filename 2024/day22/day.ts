import { DayBase } from '../../utils';

interface Buyer {
  // changes: number[];
  final: number;
  initial: number;
  mixed: Array<{ s: number; p: number; c: number }>;
  // prices: number[];
  secrets: number[];
}

interface PriceSequences {
  [key: string]: number;
}

class Day extends DayBase {
  getInput() {
    return this.lines.map<Buyer>((line) => ({
      // changes: [],
      final: Number(line),
      initial: Number(line),
      mixed: [],
      // prices: [],
      secrets: [Number(line)],
    }));
  }

  getComputedBuyers(times = 10, force = false) {
    const data = this.getSavedData(
      `buyers-${times}`,
      () => {
        const buyers = this.getInput();
        this.generateBuyersNumbers(buyers, times);
        let output = '';
        buyers.forEach((b) => {
          let last = 0;
          b.secrets.forEach((s, i) => {
            const secretStr = String(s);
            const price = Number(secretStr.substring(secretStr.length - 1));
            const change = i < 1 ? 0 : price - last;
            last = price;
            output = `${output}${s}:${price}:${change}\n`;
          });
          output = `${output}-----\n`;
        });
        return output;
      },
      force
    );

    const buyers: Buyer[] = [];
    // let changes: number[] = [];
    // let prices: number[] = [];
    let secrets: number[] = [];
    let mixed: Buyer['mixed'] = [];
    data
      .trim()
      .split('\n')
      .forEach((line) => {
        if (line.startsWith('-')) {
          const buyer: Buyer = {
            // changes: [...changes],
            final: secrets[secrets.length - 1],
            initial: secrets[0],
            mixed: [...mixed],
            // prices: [...prices],
            secrets: [...secrets],
          };
          buyers.push(buyer);
          mixed = [];
          // prices = [];
          secrets = [];
        } else {
          const [s, p, c] = line.split(':').map(Number);
          // changes.push(Number(line.split(':')[2]) ?? 999);
          mixed.push({ s, p, c });
          // prices.push(Number(line.split(':')[1]) ?? -1);
          secrets.push(s);
        }
      });
    return buyers;
  }

  printBuyerSummary(buyer: Buyer) {
    console.log(`${buyer.initial}: ${buyer.final}`);
  }

  printBuyerSummaries(buyers: Buyer[]) {
    buyers.forEach((b) => {
      this.printBuyerSummary(b);
    });
  }

  xor(dec1: number, dec2: number) {
    let dec1BinStr = dec1.toString(2);
    let dec2BinStr = dec2.toString(2);
    const len = Math.max(dec1BinStr.length, dec2BinStr.length);
    dec1BinStr = dec1BinStr.padStart(len, '0');
    dec2BinStr = dec2BinStr.padStart(len, '0');
    let xOrStr = '';
    for (let i = 0; i < len; i++) {
      xOrStr += dec1BinStr[i] === dec2BinStr[i] ? '0' : '1';
    }
    return eval(`0b${xOrStr}`);
  }

  mix(secret: number, mix: number) {
    return this.xor(secret, mix);
  }

  prune(secret: number) {
    return secret % 16777216;
  }

  generateStep1(secret: number) {
    // console.log(
    //   `Step 1: ${secret} * 64 = ${
    //     secret * 64
    //   } -> mixed with ${secret} = ${this.mix(
    //     secret,
    //     secret * 64
    //   )} -> pruned = ${this.prune(this.mix(secret, secret * 64))}`
    // );
    return this.prune(this.mix(secret, secret * 64));
  }

  generateStep2(secret: number) {
    // console.log(
    //   `Step 2: ${secret} / 32 = ${Math.floor(
    //     secret / 32
    //   )} -> mixed with ${secret} = ${this.mix(
    //     secret,
    //     Math.floor(secret / 32)
    //   )} -> pruned = ${this.prune(this.mix(secret, Math.floor(secret / 32)))}`
    // );
    return this.prune(this.mix(secret, Math.floor(secret / 32)));
  }

  generateStep3(secret: number) {
    // console.log(
    //   `Step 3: ${secret} * 2048 = ${
    //     secret * 2048
    //   } -> mixed with ${secret} = ${this.mix(
    //     secret,
    //     secret * 2048
    //   )} -> pruned = ${this.prune(this.mix(secret, secret * 2048))}`
    // );
    return this.prune(this.mix(secret, secret * 2048));
  }

  generateSecretNumber(secret: number) {
    return this.generateStep3(this.generateStep2(this.generateStep1(secret)));
  }

  generateTimes(buyer: Buyer, times = 1) {
    for (let i = 0; i < times; i++) {
      buyer.final = this.generateSecretNumber(buyer.final);
      buyer.secrets.push(buyer.final);
      // console.log(buyer.final, '\n');
    }
  }

  generateBuyersNumbers(buyers: Buyer[], times = 1) {
    buyers.forEach((b) => {
      this.generateTimes(b, times);
    });
  }

  getPriceSequences(buyers: Buyer[]) {
    const priceSequences: PriceSequences = {};

    buyers.forEach((b, bi) => {
      const buyerSequences: { [key: string]: true } = {};

      b.mixed.forEach(({ s, p, c }, i) => {
        if (i < 3) return;
        const m3 = b.mixed[i - 3];
        const m2 = b.mixed[i - 2];
        const m1 = b.mixed[i - 1];
        const key = [m3.c, m2.c, m1.c, c].join(',');

        // if (key === '-2,1,-1,3') {
        //   console.log(
        //     `${bi * 2000 + i} : ${[s, p, c]} : ${s} : ${m3.c}(${m3.p}) + ${
        //       m2.c
        //     }(${m2.p}) + ${m1.c}(${m1.p}) + ${c}(${p}) = ${p}`
        //   );
        // }

        if (typeof buyerSequences[key] === 'undefined') {
          const seqPrice = priceSequences[key] ?? 0;
          priceSequences[key] = seqPrice + p;
          buyerSequences[key] = true;
        }
      });
    });

    return priceSequences;
  }

  getBestSequence(priceSequences: PriceSequences) {
    return Object.keys(priceSequences).reduce<[string, number]>(
      (acc, sk) => {
        if (priceSequences[sk] > acc[1]) {
          return [sk, priceSequences[sk]];
        }
        return acc;
      },
      ['', 0]
    );
  }

  step1() {
    const buyers = this.getInput();
    this.generateBuyersNumbers(buyers, 2000);
    // this.printBuyerSummaries(buyers);

    return buyers.reduce((acc, b) => acc + b.final, 0);
  }

  step2() {
    const buyers = this.getComputedBuyers(2000, false);
    const priceSequences = this.getPriceSequences(buyers);
    // console.log(priceSequences);
    const bestSequence = this.getBestSequence(priceSequences);
    // console.log(bestSequence);
    return bestSequence[1];
  }
}

export { Day };

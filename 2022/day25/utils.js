const VALUES = {
  '2': 2,
  '1': 1,
  '0': 0,
  '-': -1,
  '=': -2,
};

let isLogging = false;

const log = (...args) => {
  isLogging && console.log(...args);
};

const printValues = (values) => {
  const encodedLen = 6;
  const decLen = 7;
  const lines = [];
  values.forEach(({ original, snafu, decimal }) => {
    lines.push(`${original.padStart(encodedLen)}  ${decimal.toString().padStart(decLen)}   (${snafu})`);
  });

  log(` SNAFU  Decimal`);
  log(lines.join('\n'));
};

const getSnafuToDecimal = (snafu) => {
  const chars = snafu.split('').map((c) => VALUES[c]);
  const snafuInts = chars.join(',');
  chars.reverse();
  const rawValues = chars.map((v, i) => {
    const m = Math.pow(5, i);
    return v * m;
  });
  rawValues.reverse();
  const decimal = rawValues.reduce((acc, v) => acc + v, 0);
  return [decimal, snafuInts];
};

const getDecimalToSnafu = (decimal) => {
  
};

const getValues = (data) => {
  return data.split('\n').map((line) => {
    const [decimal, snafuInts] = getSnafuToDecimal(line);
    
    const value = {
      original: line,
      snafu: snafuInts,
      decimal,
    };

    return value;
  });
};

const getResult = (data) => {
  isLogging = true;
  const values = getValues(data);
  printValues(values);
  // console.log(values);
  return values.reduce((acc, v) => acc + v.decimal, 0);
};

const getResult2 = (data) => {
  const lines = data.split('\n');
  return '??';
};

module.exports = { getResult, getResult2 };

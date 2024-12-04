const getLines = (data) => {
  return data.split('\n').map(Number);
};

const frequencies = { '0': 1 };

const populateFrequencies = (num, numbers) => {
  // console.log(frequencies);
  let found = null;

  for(let i = 0; i < numbers.length; i++) {
    const currNum = numbers[i];
    num += currNum;
    const key = `${num}`;

    // console.log('change, num, key', currNum, num, key);

    if (frequencies.hasOwnProperty(key)) {
      console.log('found!', key, num);
      found = num;
      break;
    }

    frequencies[key] = 1;
  }

  return [num, found];
};

const getFrequencies = (data) => {
  const numbers = getLines(data);

  let num = 0;
  let found = false;

  while (!found) {
    const [nextNum, result] = populateFrequencies(num, numbers);

    num = nextNum;

    if (result !== null) {
      found = true;
    }
  }

  return num;
};

module.exports = { getFrequencies, getLines };

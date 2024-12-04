const log = (...args) => {
  console.log(...args);
};

const getMonkeys = (data) => {
  let itemId = 0;
  return data.split('\n\n').map((block, i) => {
    const [, itemsRaw, opRaw, testRaw, trueRaw, falseRaw] = block.split('\n');
    const items = itemsRaw.split(': ')[1].split(', ').map((item) => ({ id: `${itemId++}`, worry: Number(item) }));
    const [, operator, num] = opRaw.split('new = ')[1].split(' ');
    const operation = { operator, num: Number(num) || 0, old: num === 'old' };
    const testDivisor = Number(testRaw.split(' by ')[1]);
    const trueMonkeyNum = Number(trueRaw.split('monkey ')[1]);
    const falseMonkeyNum = Number(falseRaw.split('monkey ')[1]);

    return { id: `${i}`, items, operation, testDivisor, trueMonkeyNum, falseMonkeyNum, inspections: 0 };
  });
};

const getMonkeyBusiness = (monkeys, rounds = 20, worryLevelModulus = 0) => {
  for (let r = 0; r < rounds; r++) {

    for (let m = 0; m < monkeys.length; m++) {
      // log(`Monkey ${m}`);
      const monkey = monkeys[m];

      while (monkey.items.length) {
        const item = monkey.items.shift();
        // log(`  Monkey inspects an item with a worry level of ${item.worry}.`)

        const opNum = monkey.operation.old ? item.worry : monkey.operation.num;

        item.worry = monkey.operation.operator === '+' ? item.worry + opNum : item.worry * opNum;

        const opText = monkey.operation.operator === '+' ? 'increases by' : 'is multiplied by'
        // log(`    Worry level ${opText} ${opNum} to ${item.worry}.`)

        if (worryLevelModulus) {
          item.worry = item.worry % worryLevelModulus;
        } else {
          item.worry = Math.floor(item.worry / 3);
          // log(`    Monkey gets bored with item. Worry level is divided by 3 to ${item.worry}.`)
        }

        monkeys[m].inspections++;

        let throwTo = -1;
        if (item.worry % monkey.testDivisor === 0) {
          throwTo = monkey.trueMonkeyNum;
          // log(`    Current worry level is divisible by ${monkey.testDivisor}.`);
        } else {
          throwTo = monkey.falseMonkeyNum;
          // log(`    Current worry level is not divisible by ${monkey.testDivisor}.`);
        }

        monkeys[throwTo].items.push(item);
        // log(`    Item with worry level ${item.worry} is thrown to monkey ${throwTo}.`);
      }
    }

    if (r === 0 || r === 19 || r === 999 || r === 1999) {
      log(`== After round ${r+1} ==`);
      log(`Monkey 0 inspected items ${monkeys[0].inspections} times`);
      log(`Monkey 1 inspected items ${monkeys[1].inspections} times`);
      log(`Monkey 2 inspected items ${monkeys[2].inspections} times`);
      log(`Monkey 3 inspected items ${monkeys[3].inspections} times`);
    }
  }

  monkeys.sort((a, b) => {
    if (a.inspections > b.inspections) return -1;
    if (a.inspections < b.inspections) return 1;
    return 0;
  });

  // console.log(monkeys)

  return monkeys[0].inspections * monkeys[1].inspections;
};

const getResult = (data) => {
  const monkeys = getMonkeys(data);
  // console.log(monkeys);
  return getMonkeyBusiness(monkeys);
};

const getResult2 = (data) => {
  const monkeys = getMonkeys(data);
  // console.log(monkeys);
  const modulus = monkeys.map(m => m.testDivisor).reduce((acc, m) => acc * m, 1);

  console.log('modulus', modulus);
  return getMonkeyBusiness(monkeys, 10000, modulus);
};

module.exports = { getResult, getResult2 };

const getInstructions = (data) => {
  return data.split('\n').map((line) => {
    const [type, value] = line.split(' ').map((v, i) => i === 1 ? Number(v) : v);
    return { type, value };
  });
};

const getCyclesSum = (instructions) => {
  let value = 1;
  let running = true;
  let currentCycle = 1;
  let currentInstruction = 0;
  let sum = 0;
  let addStart = true;

  while(running) {
    const instruction = instructions[currentInstruction];

    if (!instruction) {
      running = false;
      break;
    }

    const signalStrength = currentCycle * value;

    if (currentCycle === 20 || ((currentCycle - 20) % 40 === 0 && currentCycle >= 60)) {
      console.log(`${currentCycle}th cycle, register is ${value}, so the signal strength is ${currentCycle * value}`);
      sum += signalStrength;
    }

    currentCycle++;

    if (instruction.type === 'noop') {
      currentInstruction++;
    } else if (addStart) {
      addStart = false;
    } else {
      value += instruction.value;
      currentInstruction++;
      addStart = true;
    }
  }

  return sum;
};

const renderCRT = (instructions) => {
  let register = 1;
  let currentInstruction = 0;
  let addStart = true;

  for (let r = 0; r < 6; r++) {
    let row = '';
    for (let x = 0; x < 40; x++) {
      const instruction = instructions[currentInstruction];

      const char = x >= register - 1 && x <= register + 1 ? '#' : '.';

      // console.log(`[${r+1}:${x+1}]   (pos: ${x})   [spr: ${register-1}-${register+1}]   =>   "${char}"`);

      row += char;

      if (instruction && instruction.type === 'addx') {
        if (addStart) {
          addStart = false;
        } else {
          register += instruction.value;
          addStart = true;
          currentInstruction++;
        }
      } else {
        currentInstruction++;
      }
    }
    console.log(row.white);
  }
};

const getResult = (data) => {
  const instructions = getInstructions(data);
  return getCyclesSum(instructions);
};

const getResult2 = (data) => {
  const instructions = getInstructions(data);
  renderCRT(instructions);
  return '??';
};

module.exports = { getResult, getResult2 };

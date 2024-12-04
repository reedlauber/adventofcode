const getSteps = (data) => {
  const stepRE = /Step ([A-Z]) must be finished before step ([A-Z]) can begin\./;
  const steps = {};
  const allSteps = {};

  data.split('\n').forEach((line) => {
    const [_, first, second] = line.match(stepRE);
    steps[second] = steps[second] || [];
    steps[second].push(first);
    allSteps[first] = true;
    allSteps[second] = true;
  });

  return [steps, Object.keys(allSteps)];
};

const getFirstSteps = (steps, allSteps) => {
  return allSteps.sort().filter((step) => !steps[step]);
};

const removeDependency = (steps, dependency) => {
  const updatedSteps = { ...steps };

  Object.keys(steps).forEach((key) => {
    const dependencies = steps[key];

    const depIndex = dependencies.findIndex((d) => d === dependency);

    if (depIndex > -1) {
      updatedSteps[key].splice(depIndex, 1);
    }
  });

  return updatedSteps;
};

const getSequenceStep = (steps, currentStep, level = 1) => {
  let sequence = currentStep;

  const dependencies = Object.keys(steps)
    .filter((step) => steps[step].includes(currentStep))
    .sort();

  dependencies.forEach((step) => {
    steps = removeDependency(steps, currentStep);

    if (!steps[step].length) {
      sequence += getSequenceStep(steps, step, level + 1);
    }
  });

  return sequence;
};

const getSequence = (steps, firstSteps) => {
  let sequence = '';

  let available = [...firstSteps].reverse();
  let running = true;

  while(running) {
    const current = available.pop();
    sequence += current;

    if (steps[current]) {
      delete steps[current];
    }

    steps = removeDependency(steps, current);
    empties = Object.keys(steps).filter((s) => !steps[s].length);

    empties.forEach((step) => {
      if (!available.includes(step)) {
        available.push(step);
      }
    });
    available.sort().reverse();

    if (!available.length) {
      running = false;
    }
  }

  return sequence;
};

const STEP_TIMES = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9, J: 10, K: 11, L: 12, M: 13,
  N: 14, O: 15, P: 16, Q: 17, R: 18, S: 19, T: 20, U: 21, V: 22, W: 23, X: 24, Y: 25, Z: 26
};

const printTime = (time, workers, sequence) => {
  const w = Object.keys(workers).map((w) => workers[w].step || '.').join('      ')
  console.log(` ${time.toString().padStart(2, ' ')}       ${w}      ${sequence}`.brightWhite);
};

const getSequence2 = (steps, firstSteps, numWorkers = 2, timeBuffer = 0) => {
  const workers = {};
  for (let w = 0; w < numWorkers; w++) {
    workers[w] = { step: '', remaining: 0 };
  }

  let sequence = '';

  let available = [...firstSteps].reverse();
  const working = {};
  let running = true;
  let time = 0;

  console.log(`Second   W 1    W 2    Done`.brightWhite);

  // Fill available workers with as many available steps as possible
  for (let a = 0; a < available.length; a++) {
    const nextWorkerKey = Object.keys(workers).find((w) => !workers[w].step);
    if (nextWorkerKey) {
      const step = available.pop();
      workers[nextWorkerKey].step = step;
      workers[nextWorkerKey].remaining = STEP_TIMES[step] + timeBuffer;
    }
  }
    
  while(running) {
    Object.keys(workers).forEach((w) => {
      // Step is complete; remove it from dependencies
      if (workers[w].step && workers[w].remaining === 0) {
        const completedStep = workers[w].step;
        // console.log('completed'.green, completedStep.white);

        // Append completed step
        sequence += completedStep;

        // Remove from step keys
        if (steps[completedStep]) {
          delete steps[completedStep];
        }

        // Remove as dependency from other steps
        steps = removeDependency(steps, completedStep);

        // Get steps that no longer have any dependencies, and add to list available to work on
        Object.keys(steps)
          .filter((s) => !steps[s].length)
          .forEach((step) => {
            if (!available.includes(step) && !working[step]) {
              // console.log('add available'.red, step.white);
              available.push(step);
            }
          });

        // Re-sort available list to pop next off list
        available.sort().reverse();

        // Make worker available
        workers[w].step = '';
      }
    });

    // Fill available workers with as many available steps as possible
    for (let a = 0, len = available.length; a < len; a++) {
      const nextWorkerKey = Object.keys(workers).find((w) => !workers[w].step);

      // console.log(available, 'next worker', available[available.length-1], '->', nextWorkerKey);

      if (nextWorkerKey) {
        const step = available.pop();
        workers[nextWorkerKey].step = step;
        workers[nextWorkerKey].remaining = STEP_TIMES[step] + timeBuffer;
        working[step] = true;
      }
    }

    // Decrement timing remaining for each worker
    Object.keys(workers).forEach((w) => {
      workers[w].remaining--;
    });

    // Print current status
    printTime(time++, workers, sequence);
    // time++;

    // Exit if there's nothing left to do
    if (!available.length && !Object.keys(steps).length) {
      running = false;
    }
  }

  return sequence;
};

const getResult = (data) => {
  const [steps, allSteps] = getSteps(data);
  const firstSteps = getFirstSteps(steps, allSteps);
  return getSequence(steps, firstSteps);
};

const getResult2 = (data) => {
  const [steps, allSteps] = getSteps(data);
  const firstSteps = getFirstSteps(steps, allSteps);
  return getSequence2(steps, firstSteps, 5, 60);
};

module.exports = { getResult, getResult2 };

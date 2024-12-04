const VALUES_RE = /Valve ([A-J]{2}) has flow rate=(\d+); tunnels? leads? to valves? ([A-J ,]+)/;

const getValves = (data) => {
  const graph = {};
  const valves = data.split('\n').map((line) => {
    const [, valveId, rateStr, valvesStr] = line.match(VALUES_RE);
    const rate = Number(rateStr);
    const connections = valvesStr.split(', ');
    const valve = {
      id: valveId,
      rate,
      connections,
      isOpen: false,
    };
    graph[valveId] = valve;
    return valve;
  });

  return [valves, graph];
};

const getBestConnectionIds = (graph, currentValve) => {
  const connectionIds = currentValve.connections.filter((valveId) => !graph[valveId].isOpen);
  connectionIds.sort((a, b) => {
    if (a.rate > b.rate) return 1;
    if (a.rate < b.rate) return -1;
    return 0;
  });
  return connectionIds;
};

const getBestImmediateConnection = (graph, currentValve) => {
  const availableIds = getBestConnectionIds(graph, currentValve);

  if (availableIds.length) {
    return graph[availableIds[0]];
  }

  return null;
};

const getBestConnection1 = (sortedValves, graph, currentValve, remainingMinutes, depth = 0) => {
  if (remainingMinutes === 0) {
    return [0, null];
  }

  const bestConnection = currentValve.connections.reduce((acc, id) => {
    const valve = graph[id];
    const flow = valve.rate;

    const nextBest = getBestImmediateConnection(graph, valve);
    let nextBestFlow = 0;

    if (nextBest) {
      nextBestFlow = nextBest.rate * (remainingMinutes - 2);
    }

    const totalFlow = flow + nextBestFlow;

    const indent = ''.padStart(depth * 2, ' ');
    console.log(`${indent}! check best connection for ${currentValve.id}. mins = ${remainingMinutes}, best = ${valve.id}, best flow = ${totalFlow}`);

    if (totalFlow > acc[0]) {
      return [totalFlow, valve];
    }

    return acc;
  }, [0, null]);

  return bestConnection[1];
};

const getNumMoves = (graph, fromId, toId, visited = {}, moves = 0) => {
  if (fromId !== toId) {
    if (graph[fromId].connections.includes(toId)) {
      return moves + 1;
    } else {
      const connectionMoves = [];
      graph[fromId].connections
        .filter((connectionId) => !visited[connectionId])
        .forEach((connectionId) => {
          visited[connectionId] = true;
          const numMoves = getNumMoves(graph, connectionId, toId, visited, moves + 1);
          connectionMoves.push(numMoves);
        });

      // const connectionMoves1 = graph[fromId].connections.map((connectionId) => {
      //   return getNumMoves(graph, connectionId, toId, moves + 1);
      // });
      return Math.min(...connectionMoves);
    }
  }

  return moves;
};

const getBestConnection = (sortedValves, graph, currentValve, remainingMinutes, depth = 0) => {
  const bests = sortedValves
    .filter((valve) => valve.id !== currentValve.id)
    .map((valve) => {
      const numMoves = getNumMoves(graph, currentValve.id, valve.id);
      let totalFlow = 0;

      if (!valve.isOpen) {
        totalFlow = (remainingMinutes - numMoves - 1) * valve.rate;
      }

      console.log(`Num moves from ${currentValve.id} to ${valve.id} = ${numMoves} = ${totalFlow}`);

      return {
        valve,
        totalFlow,
        numMoves,
      };
    });
  console.log('bests', bests);
  bests.sort((a, b) => {
    if (a.totalFlow > b.totalFlow) return -1;
    if (a.totalFlow < b.totalFlow) return 1;
    return 0;
  })[0];

  const bestDestination = bests[0];

  if (bestDestination) {
    const best = bestDestination.valve;
    console.log(`On ${currentValve.id}; Best dest: ${best.id}`);
  
    return currentValve.connections.reduce((acc, connection) => {
      const numMoves = getNumMoves(graph, connection, best.id);
      if (numMoves < acc[0]) {
        return [numMoves, connection];
      }
      return acc;
    }, [Number.MAX_VALUE, null]);
  }

  return null;
}

const printOpen = (open, totalFlow) => {
  const keys = Object.keys(open).sort();

  if (keys.length) {
    const pressure = totalFlow.toString().brightWhite;
    if (keys.length === 1) {
      console.log(`Valve ${keys[0]} is open, releasing ${pressure} pressure.`);
    } else {
      const valves = keys.join(', ')
      console.log(`Valves ${valves} are open, releasing ${pressure} pressure.`);
    }
  } else {
    console.log(`No valves are open.`);
  }
};

const getMaxPressure = (valves, graph) => {
  let remaining = 29;
  let minute = 1;
  let pressure = 0;
  let totalFlow = 0;
  let currentValve = graph['AA'];
  const open = {};

  const sortedValves = [...valves].sort((a, b) => {
    if (a.rate > b.rate) return -1;
    if (a.rate < b.rate) return 1;
    return 0;
  });

  while(true) {
    console.log(`\n== Minute ${minute} ==`);

    printOpen(open, totalFlow);

    // If valve can't be opened, move to the next best one
    if (!currentValve.rate) {
      const next = getBestConnection(sortedValves, graph, currentValve, remaining);

      if (next) {
        console.log(`You move to valve ${next.id}.`);
        currentValve = next;
      } else {
        console.log(`Couldn't find a next best connection`);
        break;
      }
    }
    // Valve not opened. Check if a different move is better, otherwise open it
    else if (!currentValve.isOpen) {
      const flowIfAdded = currentValve.rate * (remaining - 1);

      const bestImmediate = getBestImmediateConnection(graph, currentValve);
      const bestImmediateFlowIfAdded = bestImmediate.rate * (remaining - 2);
      // console.log(`! Valve (${currentValve.id}:${flowIfAdded}) not open; check alt (${bestImmediate.id}) (${bestImmediateFlowIfAdded})`);

      // If another move is better, make it
      if (bestImmediateFlowIfAdded > flowIfAdded) {
        console.log(`You move to valve ${bestImmediate.id}.`);
        currentValve = bestImmediate;
      }
      // Otherwise open the valve
      else {
        console.log(`You open valve ${currentValve.id}.`);
        totalFlow += currentValve.rate;
        currentValve.isOpen = true;
        open[currentValve.id] = true;
      }
    }
    // Valve is already open, move onto next one
    else {
      // console.log(`Valve ${currentValve.id} is open. determine next move`)
      const next = getBestConnection(sortedValves, graph, currentValve, remaining);

      if (next) {
        console.log(`You move to valve ${next.id}.`);
        currentValve = next;
      } else {
        console.log(`Couldn't find a next best connection`);
        break;
      }
    }

    minute++;
    remaining--;
    pressure += totalFlow;

    if (minute === 31) {
      break;
    }
  }

  return pressure;
};

const getResult = (data) => {
  const [valves, graph] = getValves(data);
  return getMaxPressure(valves, graph);
};

const getResult2 = (data) => {
  const lines = data.split('\n');
  return '??';
};

module.exports = { getResult, getResult2 };

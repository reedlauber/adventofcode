const getSensorsAndBeacons = (data) => {
  const sensorsGraph = {};
  const beacons = {};
  const sensors = data.split('\n').map((line) => {
    const [sX, sY, bX, bY] = line.match(COORDS_RE).map(Number);
    const beacon = { id: getId([bX, bY]), x: bX, y: bY };
    beacons[beacon.id] = beacon;
    const sensor = {
      id: getId([sX, sY]),
      x: sX,
      y: sY,
      closest: beacon,
      distance: getDistance([sX, sY], [bX, bY]),
    };
    sensorsGraph[sensor.id] = sensor;
    return sensor;
  });
  return [sensors, beacons, sensorsGraph];
};

const getBoundaryIn = (bounds, sensor) => {
  const { x, y } = sensor;
  // const top = new Point(x, sensor.yBound.start - 1, 0);
  const top = [x, y - sensor.distance];
  const right = [x + sensor.distance, y];
  const down = [x, y + sensor.distance];
  const left = [x - sensor.distance, y];

  // const left = new Point(sensor.xBound.start - 1, y, 0);
  // const bottom = new Point(x, sensor.yBound.end + 1, 0);
  // const right = new Point(sensor.xBound.end + 1, y, 0);
  const boundaryPaths = [
    [top, left, [-1, 1]],
    [left, bottom, [1, 1]],
    [bottom, right, [1, -1]],
    [right, top, [-1, -1]],
  ];

  return boundaryPaths.reduce((boundary, [from, to, translation]) => {
    let next = from;
    while (!next.isOn(to)) {
      if (bounds.contains(next)) boundary.push(next);
      next = next.copy().translate(translation);
    }
    return boundary;
  });
}

const isInRangeOfASensor = (sensors, point) => {
  return sensors.some((sensor) => point.manhattanDistanceTo(sensor.position) <= sensor.beaconDistance);
}

const findEmptyPositionsInBounds = (size, sensors) => {
  const dimensions = { minX: 0, maxX: size, minY: 0, maxY: size };

  return sensors.flatMap((s) => {
    return s.getBoundaryIn(bounds);
  }).find((p) => !isInRangeOfASensor(sensors, p));
};

const getResult = (data) => {
  return '??';
};

const getResult2 = (data) => {
  const [sensors, beacons, sensorsGraph] = getSensorsAndBeacons(data);
  const point = findEmptyPositionsInBounds(0, 4000000);

  console.log(point);
};

module.exports = { getResult, getResult2 };
import { DayBase } from '../../utils';

interface Robot {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Space {
  height: number;
  width: number;
}

interface Quadrant {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  robots: Robot[];
}

class Day extends DayBase {
  getMaxDensity(robots: Robot[]) {
    const lookup = robots.reduce<{ [key: string]: boolean }>((acc, r) => {
      acc[`${r.x},${r.y}`] = true;
      return acc;
    }, {});

    const densities = robots.map((robot) => {
      let density = 0;
      for (let y = robot.y - 1; y <= robot.y + 1; y++) {
        for (let x = robot.x - 1; x <= robot.x + 1; x++) {
          if (lookup[`${x},${y}`]) {
            density++;
          }
        }
      }
      return density / 9;
    });

    return densities.reduce((acc, d) => Math.max(acc, d), 0);
  }

  moveRobot(space: Space, robot: Robot) {
    const nextX = robot.x + robot.vx;
    const nextY = robot.y + robot.vy;

    if (nextX < 0) {
      robot.x = space.width + nextX;
    } else if (nextX >= space.width) {
      robot.x = nextX - space.width;
    } else {
      robot.x = nextX;
    }

    if (nextY < 0) {
      robot.y = space.height + nextY;
    } else if (nextY >= space.height) {
      robot.y = nextY - space.height;
    } else {
      robot.y = nextY;
    }
  }

  tick(space: Space, robots: Robot[]) {
    robots.forEach((robot) => {
      this.moveRobot(space, robot);
    });
  }

  tickTimes(
    space: Space,
    robots: Robot[],
    times: number,
    onTick?: (robots: Robot[], i: number) => boolean | undefined
  ) {
    for (let i = 0; i < times; i++) {
      this.tick(space, robots);

      const onTickResult = onTick?.(robots, i);

      if (onTickResult === false) {
        break;
      }
    }
  }

  getRobots() {
    return this.linesMap<Robot>((line, i) => {
      const [p, v] = line.split(' ');
      const [x, y] = p.substring(2).split(',').map(Number);
      const [vx, vy] = v.substring(2).split(',').map(Number);
      return {
        id: `r-${i}`,
        x,
        y,
        vx,
        vy,
      };
    });
  }

  getQuadrantRobots(quadrant: Quadrant, robots: Robot[]) {
    this.log(quadrant.id);
    for (let y = quadrant.y; y < quadrant.y + quadrant.height; y++) {
      for (let x = quadrant.x; x < quadrant.x + quadrant.width; x++) {
        quadrant.robots.push(...robots.filter((r) => r.x === x && r.y === y));
        this.log(`Check [${x},${y}]`);
      }
    }
  }

  getQuadrantsRobots(quadrants: Quadrant[], robots: Robot[]) {
    quadrants.forEach((quadrant) => {
      this.getQuadrantRobots(quadrant, robots);
    });
  }

  getQuadrants(space: Space): [Quadrant, Quadrant, Quadrant, Quadrant] {
    const height = Math.floor(space.height / 2);
    const width = Math.floor(space.width / 2);
    const tl: Quadrant = { id: 'tl', x: 0, y: 0, width, height, robots: [] };
    const tr: Quadrant = {
      id: 'tr',
      x: width + 1,
      y: 0,
      width,
      height,
      robots: [],
    };
    const br: Quadrant = {
      id: 'br',
      x: width + 1,
      y: height + 1,
      width,
      height,
      robots: [],
    };
    const bl: Quadrant = {
      id: 'bl',
      x: 0,
      y: height + 1,
      width,
      height,
      robots: [],
    };

    return [tl, tr, br, bl];
  }

  printSpace(space: Space, robots: Robot[]) {
    let output = `[${robots[0].x},${robots[0].y}]\n`;

    for (var y = 0; y < space.height; y++) {
      let line = '';
      for (var x = 0; x < space.width; x++) {
        const count = robots.filter((r) => r.x === x && r.y === y).length;
        line += count ? count : '.';
      }
      output += `${line}\n`;
    }

    this.log(output);
  }

  printQuadrants(space: Space, quadrants: Quadrant[], robots: Robot[]) {
    let output = '';

    const [tl, tr, br, bl] = quadrants.map<string[]>((q) => {
      const lines: string[] = [];
      for (var y = 0; y < q.height; y++) {
        let line = '';
        for (var x = 0; x < q.width; x++) {
          const cellRobots = q.robots.filter(
            (r) => r.x === x + q.x && r.y === y + q.y
          );
          line += cellRobots.length || '.';
        }
        lines.push(line);
      }
      return lines;
    });

    tl.forEach((line, i) => {
      output += `${line} ${tr[i]}\n`;
    });

    output += '\n';

    bl.forEach((line, i) => {
      output += `${line} ${br[i]}\n`;
    });

    this.log(output);
  }

  step1() {
    const space: Space = this.isSample
      ? { height: 7, width: 11 }
      : { height: 103, width: 101 };
    const quadrants = this.getQuadrants(space);
    const robots = this.getRobots();
    this.tickTimes(space, robots, 100, (robots, i) => {
      if (i >= 110 && i <= 120) {
        this.printSpace(space, robots);
      }
      return true;
    });
    this.getQuadrantsRobots(quadrants, robots);
    this.printSpace(space, robots);
    this.printQuadrants(space, quadrants, robots);
    return quadrants.reduce((acc, q) => acc * q.robots.length, 1);
  }

  step2() {
    this.logging = true;
    const space: Space = this.isSample
      ? { height: 7, width: 11 }
      : { height: 103, width: 101 };
    const robots = this.getRobots();
    this.tickTimes(space, robots, 100000, (robots, i) => {
      const maxDensity = this.getMaxDensity(robots);

      if (maxDensity > 0.888) {
        this.log('Density:', maxDensity, 'Iteration:', i);
        this.printSpace(space, robots);
        return false;
      }

      return true;
    });

    return '';
  }
}

export { Day };

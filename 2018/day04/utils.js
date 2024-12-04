const fs = require('fs');

const MINUTES = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
]

const getRecords = (data) => {
  return data.split('\n').map((line) => {
    const [date, time, first, second] = line.split(' ');
    
    const [year, month, day] = date.replace('[', '').split('-');
    const [hour, minute] = time.replace(']', '').split(':');

    let dayIdMonth = month;
    let dayIdDay = day;
    
    const type = first === 'Guard' ? 'guard' : 'sleep';
    const guardId = type === 'guard' ? second : null;
    const sleepChange = type === 'sleep' ? second : null;

    if (hour === '23') {
      dayIdDay = (Number(day) + 1).toString().padStart(2, '0');

      if (
        (month === '02' && day === '28') ||
        ((month === '04' || month === '06' || month === '09' || month === '11') && day === '30') ||
        ((month === '01' || month === '03' || month === '05' || month === '07' || month === '08' || month === '10' || month === '12') && day === '31')
      ) {
        dayIdMonth = (Number(month) + 1).toString().padStart(2, '0');
        dayIdDay = '01';
      }
    }

    return { dt: `${date} ${time}`, year, month, day, dayId: `${dayIdMonth}-${dayIdDay}`, minute, type, guardId, sleepChange };
  });
};

const getGuardStats = (records) => {
  const stats = {};

  let currentGuard = null;
  let sleepStart = 0;

  records.forEach((record) => {
    if (record.type === 'guard') {
      currentGuard = record.guardId;

      stats[currentGuard] = stats[currentGuard] || {};
      stats[currentGuard][record.dayId] = [...MINUTES];
    } else if (record.sleepChange === 'asleep') {
      sleepStart = Number(record.minute);
    } else if (record.sleepChange === 'up') {
      const sleepEnd = Number(record.minute);

      for (let i = sleepStart; i < sleepEnd; i++) {
        try {
          stats[currentGuard][record.dayId][i] = 1;
        }
        catch(e) {
          if (typeof stats[currentGuard] === 'undefined') {
            throw new Error(`Can't assign to g:${currentGuard}`);
          } else if (typeof stats[currentGuard][record.dayId] === 'undefined') {
            throw new Error(`Can't assign to g:${currentGuard}, d:${record.dayId}, ${record.dt}`);
          } else {
            throw new Error(`Can't assign to g:${currentGuard}, d:${record.dayId}, i:${i}`);
          }
        }
      }
    }
  });

  return stats;
};

const getSleepiestGuardId = (stats) => {
  const guardSleeps = Object.keys(stats).reduce((acc, guardId) => {
    const guard = stats[guardId];
    const sleepMinutes = Object.keys(guard).reduce((acc, day) => {
      const minutes = guard[day];
      return acc + minutes.filter((m) => m === 1).length;
    }, 0);
    acc[guardId] = (acc[guardId] || 0) + sleepMinutes;
    return acc;
  }, {});
  let max = 0;
  let sleepiestGuard = null;
  Object.keys(guardSleeps).forEach((key) => {
    if (guardSleeps[key] > max) {
      max = guardSleeps[key];
      sleepiestGuard = key;
    }
  });
  return sleepiestGuard;
};

const getSleepiestGuardMinute = (guard) => {
  const minutes = [...MINUTES];

  Object.keys(guard).forEach((key) => {
    const day = guard[key];
    day.forEach((state, i) => {
      minutes[i] += state;
    });
  });

  let maxMins = 0;
  let maxMinute = 0;

  minutes.forEach((min, i) => {
    if (min > maxMins) {
      maxMins = min;
      maxMinute = i;
    }
  });

  return maxMinute;
};

const writeSorted = (data) => {
  const records = data.split('\n').map((line) => {
    const [date, time, first, second] = line.split(' ');
    
    const [year, month, day] = date.replace('[', '').split('-');
    const [hour, minute] = time.replace(']', '').split(':');
    return { year, month, day, hour, minute, line };
  })
  
  records.sort((a, b) => {
    if (a.year > b.year) return 1;
    if (a.year < b.year) return -1;
    if (a.month > b.month) return 1;
    if (a.month < b.month) return -1;
    if (a.day > b.day) return 1;
    if (a.day < b.day) return -1;
    if (a.hour > b.hour) return 1;
    if (a.hour < b.hour) return -1;
    if (a.minute > b.minute) return 1;
    if (a.minute < b.minute) return -1;
    return 0;
  })
  
  const blob = records.map((r) => r.line).join('\n');

  fs.writeFileSync('./day04/data-sorted.js', `module.exports = \`${blob}\`;`);
};

const getMostFrequentlyAsleepGuard = (stats) => {
  const guards = Object.keys(stats).map((key) => {
    const guard = stats[key];
    const minutes = {};
    Object.keys(guard).forEach((day) => {
      const mins = guard[day];
      mins.forEach((min, i) => {
        minutes[i] = (minutes[i] || 0) + min;
      });
    });
    return { guardId: key, minutes };
  });
  
  const [guardId, times, min] = guards.reduce((acc, guard) => {
    const [times, day] = Object.keys(guard.minutes).reduce((acc, min) => {
      if (guard.minutes[min] > acc[0]) {
        return [guard.minutes[min], min];
      }
      return acc;
    }, [0, null]);

    if (times > acc[1]) {
      return [guard.guardId, times, day];
    }

    return acc;
  }, ['', -1, null]);

  return [guardId, min];
};

const getGuardInfo = (data) => {
  const records = getRecords(data);

  const stats = getGuardStats(records);

  const guardId = getSleepiestGuardId(stats);

  const minute = getSleepiestGuardMinute(stats[guardId]);

  const guardNum = Number(guardId.replace('#', ''));

  return guardNum * minute;
};

const getGuardInfo2 = (data) => {
  const records = getRecords(data);

  const stats = getGuardStats(records);

  const [guardId, min] = getMostFrequentlyAsleepGuard(stats);

  return Number(guardId.substring(1)) * Number(min);
};

module.exports = { getGuardInfo, getGuardInfo2 };

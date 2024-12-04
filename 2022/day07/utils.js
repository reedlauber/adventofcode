const getInstructions = (data) => {
  return data.split('\n').map((line) => {
    let type = 'file';
    let cmd;
    let args;
    let name;
    let size;

    if (line.startsWith('$')) {
      type = 'cmd';
      const [_, cmdRaw, ...rest] = line.split(' ');
      cmd = cmdRaw;
      args = rest;
    } else if (line.startsWith('dir')) {
      type = 'dir';
      name = line.split(' ')[1];
    } else {
      const [sizeRaw, nameRaw] = line.split(' ');
      size = Number(sizeRaw);
      name = nameRaw;
    }

    return {
      type,
      cmd,
      args,
      name,
      size
    };
  });
};

const getFilesystem = (data) => {
  const instructions = getInstructions(data);

  const fs = { dirs: [{ name: '/', dirs: [], files: [] }]};
  let currentPath = [0];

  instructions.forEach((inst) => {
    let obj = fs;
    currentPath.forEach((idx) => {
      obj = obj.dirs[idx];
    });

    if (inst.type === 'cmd') {
      if (inst.cmd === 'cd') {
        const cd = inst.args[0];
        if (cd === '..') {
          currentPath.pop();
        } else if (cd === '/') {
          currentPath = [0];
        } else {
          const dirIdx = obj.dirs.findIndex((d) => d.name === cd);
          if (dirIdx > -1) {
            currentPath.push(dirIdx);
          }
        }
      }
    } else if (inst.type === 'dir') {
      obj.dirs.push({ name: inst.name, size: 0, dirs: [], files: [] });
    } else if (inst.type === 'file') {
      obj.files.push({ name: inst.name, size: inst.size });
    }
  });

  return fs
};

const getDirSize = (dir) => {
  let size = dir.files.reduce((acc, f) => acc + f.size, 0);

  dir.dirs.forEach((d) => {
    d.size = getDirSize(d);
    size += d.size;
  });

  return size;
};

const getFilesystemWithSizes = (data) => {
  const fs = getFilesystem(data);

  fs.dirs[0].size = getDirSize(fs.dirs[0]);

  return fs;
};

const getSmallDirs = (dir, limit = 100000) => {
  const small = [];
  dir.dirs.forEach((d) => {
    if (d.size < limit) {
      small.push(d.size);
    }
    small.push(...getSmallDirs(d, limit));
  });
  return small;
};

const getLargeEnoughDirs = (dir, needed = 0) => {
  const larges = [];
  dir.dirs.forEach((d) => {
    if (d.size >= needed) {
      larges.push(d.size);
    }
    larges.push(...getLargeEnoughDirs(d, needed));
  });
  return larges;
};

const TOTAL = 70000000;
const NEEDED = 30000000;

const getNeededSpace = (fs) => {
  const remaining = TOTAL - fs.dirs[0].size;
  return NEEDED - remaining;
};

const printFilesystem = (fs, level = 0) => {
  let output = '';

  let pre = '';
  let l = level;
  while(l--) {
    pre += ' ';
  }

  fs.dirs.forEach((dir) => {
    console.log(`${pre}- ${dir.name} (dir, size=${dir.size})`);
    printFilesystem(dir, level + 1);
    dir.files.forEach((file) => {
      console.log(`${pre}  - ${file.name} (file, size=${file.size})`);
    });
  });

  console.log(output);
};

const getResult = (data) => {
  const fs = getFilesystemWithSizes(data);
  // printFilesystem(fs);
  const smalls = getSmallDirs(fs);
  return smalls.reduce((acc, s) => acc + s, 0);
};

const getResult2 = (data) => {
  const fs = getFilesystemWithSizes(data);
  // printFilesystem(fs);
  const needed = getNeededSpace(fs);
  const larges = getLargeEnoughDirs(fs, needed);
  const min = Math.min(...larges);
  // console.log('needed', needed, larges, min);
  return min;
};

module.exports = { getResult, getResult2 };

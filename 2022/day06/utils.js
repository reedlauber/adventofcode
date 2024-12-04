const getLines = (data) => {
  let index = -1;

  for (let i = 3; i < data.length; i++) {
    const first = data[i-3];
    const second = data[i-2];
    const third = data[i-1];
    const fourth = data[i];

    if (first !== second && first !== third && first !== fourth && second !== third && second !== fourth && third !== fourth) {
      index = i;
      break;
    }
  }

  return index + 1;
};

const getMarker2 = (data) => {
  let index = -1;

  for (let i = 14; i < data.length; i++) {
    const slice = data.substring(i - 14, i);

    const seen = {};
    let valid = true;

    slice.split('').forEach((c) => {
      if (seen[c]) {
        valid = false;
      }
      seen[c] = true;
    });

    if (valid) {
      index = i;
      break;
    }
  }

  return index;
};

module.exports = { getLines, getMarker2 };

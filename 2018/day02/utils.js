const getLineCounts = (line) => {
  const counts = {};
  line.split('').forEach((char) => {
    counts[char] = counts[char] || 0;
    counts[char]++;
  });
  return counts;
};

const getLines = (data) => {
  const [twos, threes] = data.split('\n').map((line) => {
    const counts = getLineCounts(line);
    // console.log(line, counts);
    const twoChar = Object.keys(counts).find((c) => counts[c] === 2);
    const threeChar = Object.keys(counts).find((c) => counts[c] === 3);
    return { input: line, hasTwos: !!twoChar, hasThrees: !!threeChar };
  }).reduce((acc, line) => {
    if (line.hasTwos) {
      acc[0]++;
    }
    if (line.hasThrees) {
      acc[1]++;
    }
    return acc;
  }, [0, 0]);

  return twos * threes;
};

const getMatches = (lines) => {
  let match1 = null;
  let match2 = null;
  let numFound = [];

  lines.forEach((line) => {
    lines.forEach((line2) => {
      if (line !== line2) {
        let numDiff = 0;
        line.split('').forEach((c, i) => {
          if (c !== line2[i]) {
            numDiff++;
          }
        });

        if (numDiff === 1) {
          numFound.push(line, line2);
          match1 = line;
          match2 = line2;
        }
      }
    });
  });

  console.log('num found', numFound);

  const diffChar = match1.split('').reduce((acc, c, i) => {
    if (match2[i] !== c) {
      return i;
    }
    return acc;
  }, -1);

  return [match1, match2, diffChar];
};

const getMatchID = (data) => {
  const lines = data.split('\n');
  const [match1, match2, diffChar] = getMatches(lines);
  console.log(match1, match2, diffChar);
  return match1.substring(0, diffChar) + match1.substring(diffChar + 1);
};

module.exports = { getLines, getMatchID };

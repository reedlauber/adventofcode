const ALPHA_NUMS = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

const getResult = (data: string) => {
  const lines = data.split('\n');

  const lineNumbers = lines.map((line) => {
    const swapped = ALPHA_NUMS.map((alpha, i) => line.replace(alpha, `${i}`)).join('');
    const nums = swapped.replace(/[a-z]/ig, '').split('');
    const first = nums[0];
    const last = nums[nums.length-1];
    return Number(`${first}${last}`);
  });

  return lineNumbers.reduce((acc, n) => acc + n, 0);
};

const getResult2 = (data: string) => {
  const lines = data.split('\n');

  const lineNumbers = lines.map((line) => {
    let swapped = line;

    swapped = swapped.replace(/one/g, `o1ne`);
    swapped = swapped.replace(/two/g, `t2wo`);
    swapped = swapped.replace(/three/g, 'th3ree');
    swapped = swapped.replace(/four/g, 'fo4ur');
    swapped = swapped.replace(/five/g, 'fi5ve');
    swapped = swapped.replace(/six/g, 's6ix');
    swapped = swapped.replace(/seven/g, 'se7ven');
    swapped = swapped.replace(/eight/g, 'ei8ght');
    swapped = swapped.replace(/nine/g, 'ni9ne');

    const nums = swapped.replace(/[a-z]/ig, '').split('');

    const first = nums[0];
    const last = nums[nums.length-1];

    return Number(`${first}${last}`);
  });

  return lineNumbers.reduce((acc, n) => acc + n, 0);
};

export { getResult, getResult2 };

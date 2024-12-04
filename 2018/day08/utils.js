const getNode = (parent) => ({
  id: parent ? `${parent.id}:${parent.children.length+1}` : '1',
  numChildren: 0,
  numMetadata: 0,
  children: [],
  metadata: [],
  parent,
});

const getSum = (nums) => {
  const root = getNode();

  let node = root;
  let sum = 0;
  let state = 'read-children';

  // console.log(nums.join(' '))

  nums.forEach((num, i) => {
    let action = '??';

    if (state === 'read-children') {
      node.numChildren = num;
      state = 'read-meta';
      action = `[${node.id}] read children count`;
    } else if (state === 'read-meta') {
      node.numMetadata = num;
      action = `[${node.id}] read meta count`;

      if (node.numChildren) {
        state = 'process-child';
      } else if (num) {
        state = 'process-meta';
      } else {
        node = node.parent;
        state = 'process-child';
      }
    } else if (state === 'process-child') {
      if (node.numChildren) {
        const child = getNode(node);
        // console.log(`${i+1}. (${num}) [${node.id}] create child (${child.id})`);

        child.numChildren = num;

        node.children.push(child);
        node.numChildren--;
        
        node = child;
        state = 'read-meta';

        action = `[${node.id}] read children count`;
      } else {
        node = node.parent;
        state = 'process-meta';
      }
    } else if (state === 'process-meta') {
      action = `[${node.id}] read meta ${node.numMetadata}`;
      node.metadata.push(num);
      sum += num;
      node.numMetadata--;

      if (!node.numMetadata) {
        node = node.parent;

        if (node) {
          if (node.numChildren) {
            state = 'process-child';
          } else {
            state = 'process-meta';
          }
        } else {
          state = 'wat';
        }
      }
    } else if (state === 'wat') {
      action = 'wat';
    }

    // console.log(`${i+1}. (${num}) ${action}`);
  });

  return [sum, root];
};

const getNodeValue = (node) => {
  if (node.children.length) {
    let sum = 0;

    node.metadata.forEach((md) => {
      const child = node.children[md-1];

      if (child) {
        sum += getNodeValue(child);
      }
    });

    return sum;
  }

  return node.metadata.reduce((acc, m) => acc + m, 0);
};

const getResult = (data) => {
  const nums = data.split(' ').map(Number);
  const [sum] = getSum(nums);

  return sum;
};

const getResult2 = (data) => {
  const nums = data.split(' ').map(Number);
  const [sum, root] = getSum(nums);
  const rootValue = getNodeValue(root);

  return rootValue;
};

module.exports = { getResult, getResult2 };

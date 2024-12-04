const SHAPE_1 = `####`;
const SHAPE_2 = ` # 
###
 # `;
const SHAPE_3 = `  #
  #
###`;
const SHAPE_4 = `#
#
#
#`;
const SHAPE_5 = `##
##`;

const SHAPES = [
  { height: 1, width: 4, pattern: SHAPE_1 },
  { height: 3, width: 3, pattern: SHAPE_2 },
  { height: 3, width: 3, pattern: SHAPE_3 },
  { height: 4, width: 1, pattern: SHAPE_4 },
  { height: 2, width: 2, pattern: SHAPE_5 },
];

module.exports = { SHAPES };

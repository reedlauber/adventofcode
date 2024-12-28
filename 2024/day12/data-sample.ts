export default `RRRRIICCFF
RRRRIICCCF
VVRRRCCFFF
VVRCCCJFFF
VVVVCJJCFE
VVIVCCJJEE
VVIIICJJEE
MIIIIIJJEE
MIIISIJEEE
MMMISSJEEE`;

// export default `OOOOO
// OXOXO
// OOOOO
// OXOXO
// OOOOO`;

/*
  Attempts:
  1. 868884 (low)
  2. 912262 (high)
  3. 897062 !!
*/

/*

Sides:

* Check left, If region space:
  * Move to left space
  * Turn left
  * Add to sides count
  * Stop
* Check forward,
  * If region space:
    * Move to forward space
    * Stop
  * If not region space:
    * Turn right
    * Add to sides count
    * Stop
* If starting plot and starting direction
  * Finish

RRRRIICC**
RRRRIICCC*
VVRRRCC***
VVRCCCJ***
VVVVCJJC*E
VVIVCCJJEE
VVIIICJJEE
MIIIIIJJEE
MIIISIJEEE
MMMISSJEEE


RRRR.
RRRR.
..RRR
..R..

+---------+
|O O O O O|
| +-+ +-+ |
|O|X|O|X|O|
| +-+ +-+ |
|O O O O O|
| +-+ +-+ |
|O|X|O|X|O|
| +-+ +-+ |
|O O O O O|
+---------+


E, E, S, S, S, S, W, W, S, W, N, N, W, N, N, E, E, E, N, N, W, N
E, E, S, S, S, S, W, W, S, W, N, N, W, N, N, E, E, E, N, N, W, N


RRRRIICCFF
RRRRIICCCF
VVRRRCCFFF
VVRCCC*FFF
VVVVC**CFE
VVIVCC**EE
VVIIIC**EE
MIIIII**EE
MIIISI*EEE
MMMISS*EEE

E, S, S, E, S, S, S, W, S, W, N, N, N, N, N, W, W, N, E, N

*/

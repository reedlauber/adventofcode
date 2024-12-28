export default `
029A
980A
179A
456A
379A
`.trim();

/*
  Attempts
  S1.1: 160832 (high)

  +---+---+---+
  | 7 | 8 | 9 |
  +---+---+---+
  | 4 | 5 | 6 |
  +---+---+---+
  | 1 | 2 | 3 |
  +---+---+---+
      | 0 | A |
      +---+---+

      +---+---+
      | ^ | A |
  +---+---+---+
  | < | v | > |
  +---+---+---+



           3                      7          9                 A
       ^   A         <<      ^^   A     >>   A        vvv      A
   <   A > A  v <<   AA >  ^ AA > A  v  AA ^ A   < v  AAA >  ^ A
<v<A>>^AvA^A<vA<AA>>^AAvA<^A>AAvA^A<vA>^AA<A>A<v<A>A>^AAAvA<^A>A - aoc
           3                      7          9                 A
       ^   A         <<      ^^   A     >>   A        vvv      A
   <   A > A  v <<   AA >  ^ AA > A  v  AA ^ A   < v  AAA ^  > A
v<<A>>^AvA^A<vA<AA>>^AAvA^<A>AAvA^A<vA^>AA<A>Av<<A>A^>AAA<A>vA^A


       ^   A         <<      ^^   A     >>   A        vvv      A
   <   A > A  v <<   AA >  ^ AA > A  v  AA ^ A   < v  AAA >  ^ A - aoc
   <   A > A  v <<   AA >  ^ AA > A  v  AA ^ A   < v  AAA >  ^ A

<v<A>>^AvA^A<vA<AA>>^AAvA<^A>AAvA^A<vA>^AA<A>A<v<A>A>^AAAvA<^A>A - aoc
***                      **                   ***   **   * ** *
v<<A>>^AvA^A<vA<AA>>^AAvA^<A>AAvA^A<vA>^AA<A>Av<<A>A>^AAAvA^<A>A


379A
^A<<^^A>>AvvvA
<A>Av<<AA>^AA>AvAA^A<vAAA>^A
<v<A>>^AvA^A<vA<AA>>^AAvA<^A>AAvA^A<vA>^AA<A>A<v<A>A>^AAAvA<^A>A - aoc

^A<<^^A>>AvvvA
<A>Av<<AA>^AA>AvAA^Av<AAA^>A 
v<<A>>^AvA^Av<A<AA>>^AAvA^<A>AAvA^Av<A^>AA<A>Av<A<A>>^AAA<A>vA^A
v<<A>>^AAAvA^Av<<A>A^>A<A>vA^A<vA<AA>>^AAvAA^<A>A<vA^>AAv<<A>>^AA<A>vA^A
*/

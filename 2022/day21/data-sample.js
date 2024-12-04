module.exports = `root: pppw + sjmn
dbpl: 5
cczh: sllz + lgvd
zczc: 2
ptdq: humn - dvpt
dvpt: 3
lfqf: 4
humn: 5
ljgn: 2
sjmn: drzm * dbpl
sllz: 4
pppw: cczh / lfqf
lgvd: ljgn * ptdq
drzm: hmdt - zczc
hmdt: 32`;


/*
pppw 2.5
  cczh / (602)
    sllz +
      4
    lgvd (598)
      ljgn *
        2
      ptdq (298)
        humn -
          (301)
        dvpt
          3
  lfqf
    4

((4 + (2 * ([301] - 3))) / 4)

pppw         = 1
  cczh       = 2
    sllz     = 4
    lgvd     = 5
      ljgn   = 6
      ptdq   = 7
        humn = 8
        dvpt = 9
  lfqf       = 3

                       1
    2                    3
  4      5
       6
                7        
             8    9         
((4 + (2 * (301 - 3))) / 4) = ?? (150)

((4 + (2 * (??? - 3))) / 4) = 150
(4 + (2 * (??? - 3))) = 600
(2 * (??? - 3)) = 596
(??? - 3) = 293
??? = 296


150 * 4 = 600
600 - 4 = 596
596 / 2 = 293
293 + 3 = 296


sjmn
  drzm *
    hmdt -
      32
    zczc
      2
  dbpl
    5
*/

module.exports = `Monkey 0:
Starting items: 65, 58, 93, 57, 66
Operation: new = old * 7
Test: divisible by 19
  If true: throw to monkey 6
  If false: throw to monkey 4

Monkey 1:
Starting items: 76, 97, 58, 72, 57, 92, 82
Operation: new = old + 4
Test: divisible by 3
  If true: throw to monkey 7
  If false: throw to monkey 5

Monkey 2:
Starting items: 90, 89, 96
Operation: new = old * 5
Test: divisible by 13
  If true: throw to monkey 5
  If false: throw to monkey 1

Monkey 3:
Starting items: 72, 63, 72, 99
Operation: new = old * old
Test: divisible by 17
  If true: throw to monkey 0
  If false: throw to monkey 4

Monkey 4:
Starting items: 65
Operation: new = old + 1
Test: divisible by 2
  If true: throw to monkey 6
  If false: throw to monkey 2

Monkey 5:
Starting items: 97, 71
Operation: new = old + 8
Test: divisible by 11
  If true: throw to monkey 7
  If false: throw to monkey 3

Monkey 6:
Starting items: 83, 68, 88, 55, 87, 67
Operation: new = old + 2
Test: divisible by 5
  If true: throw to monkey 2
  If false: throw to monkey 1

Monkey 7:
Starting items: 64, 81, 50, 96, 82, 53, 62, 92
Operation: new = old + 5
Test: divisible by 7
  If true: throw to monkey 3
  If false: throw to monkey 0`;

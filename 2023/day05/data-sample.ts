export default `seeds: 79 14 55 13

seed-to-soil map:
50 98 2
52 50 48

soil-to-fertilizer map:
0 15 37
37 52 2
39 0 15

fertilizer-to-water map:
49 53 8
0 11 42
42 0 7
57 7 4

water-to-light map:
88 18 7
18 25 70

light-to-temperature map:
45 77 23
81 45 19
68 64 13

temperature-to-humidity map:
0 69 1
1 0 69

humidity-to-location map:
60 56 37
56 93 4`;


/*
  P1 1. 282277027 !!

  P2 1.


  In the above example, the lowest location number can be obtained from 
  seed number 82, which corresponds to soil 84, fertilizer 84, water 84, 
  light 77, temperature 45, humidity 46, and location 46. 
  
  So, the lowest location number is 46.

  [seed:82] 
    -> [soil:84] -> [fertilizer:84] -> [water:84]

    -> [light:77] -> [temperature:45] 

    -> [humidity:45] 
    -> [location:46]
  
  [seed:82]
    -> [soil:84] -> [fertilizer:84] -> [water:84]

    -> [light:77] -> [temperature:81]

    -> [humidity:81]
    -> [location:85]

light-to-temperature map:
45 77 1
46 78 1
47 79 1
48 77 1
49 77 1
50 77 1
51 77 1
52 77 1
53 77 1
55 77 1
56 77 1
57 77 1
58 77 1
59 77 1
60 77 1
65 77 1
65 77 1
65 77 1
65 77 1
65 77 1
65 77 1
65 77 1
65 77 23

81 45 19

68 64 1
69 65 13
70 66 13
71 67 13
72 68 13
73 69 13
74 70 13
75 71 13
76 72 13
77 73 13
78 74 13
79 75 13
80 76 13
*/
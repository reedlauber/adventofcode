package day

type AdventDay interface {
	Year() int
	Data() string
	Day() int
	Step1() string
	Step2() string
}

type BaseAdventDay struct {
	year int
	day int
}

func (d *BaseAdventDay) Year() int {
	return d.year
}

func (d *BaseAdventDay) Day() int {
	return d.day
}

func NewBaseAdventDay(year int, day int) *BaseAdventDay {
	return &BaseAdventDay{ year: year, day: day }
}

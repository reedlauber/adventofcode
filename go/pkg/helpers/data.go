package helpers

import (
	"strconv"
	"strings"

	"github.com/spf13/cobra"
)

func GetData(c *cobra.Command, sampleData string, realData string) (data string) {
	var useRealData = c.Flag("real").Value.String()
	
	if useRealData == "true" {
		data = realData
	} else {
		data = sampleData
	}

	return
}

func GetLines(data string) ([]string) {
	return strings.Split(data, "\n")
}

func GetInts(data string, separator string) (ints []int) {
	parts := strings.Split(data, separator)

	for _, part := range parts {
		i, err := strconv.Atoi(part)
		if err == nil {
			ints = append(ints, i)
		} else {
			panic(err)
		}
	}

	return
}

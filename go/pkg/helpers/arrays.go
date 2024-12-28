package helpers

func GetSum(values []int) (sum int) {
	for _, value := range values {
		sum += value
	}

	return
}

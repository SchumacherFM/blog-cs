package main

import (
	"errors"
)

type FooBar2[K comparable, V any] struct {
	cache map[K]V
}

func (fb FooBar2[K, V]) getKey(key K) (V, error) {
	val, ok := fb.cache[key]
	if !ok {
		return nil, errors.New("key not found")
	}
	return val, nil
}
func main() {}

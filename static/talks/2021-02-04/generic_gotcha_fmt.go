package main

import "fmt"

type FooBar[K comparable, V any] struct {
	cache map[K]V
}

func (fb FooBar[K, V]) getKey(key K) (emptyVal V, _ error) {
	val, ok := fb.cache[key]
	if !ok {
		return emptyVal, fmt.Errorf("key %q not found", key)
	}
	return val, nil
}
func main() {
	fb := FooBar[int, []byte]{cache: make(map[int][]byte)} // OMIT
	_, err := fb.getKey(3)                                 // OMIT
	fmt.Println(err.Error())                               // OMIT
}

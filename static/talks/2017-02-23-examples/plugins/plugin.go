package main

// // No C code needed.
import "C"

import "fmt"

var V int

func init() {
	fmt.Println("Plugin loading")
}

func F() {
	fmt.Printf("Hello, number %d\n", V)
}

package main

import (
	"fmt"
	"plugin"
)

func main() {
	// START OMIT
	fmt.Printf("main started...\n")
	p, err := plugin.Open("plugin.so")
	if err != nil {
		panic(err)
	}

	v, err := p.Lookup("V")
	if err != nil {
		panic(err)
	}

	f, err := p.Lookup("F")
	if err != nil {
		panic(err)
	}

	*v.(*int) = 7
	f.(func())() // prints "Hello, number 7"
	// END OMIT
}

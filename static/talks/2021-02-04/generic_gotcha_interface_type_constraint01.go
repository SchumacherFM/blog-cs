package main

//OMIT
import "fmt"

//OMIT
func main() {
	c := Car{Name: "Ferrari"}
	Move(c, 100, 20)
}

//OMIT
// Subtractable is a type constraint that defines subtractable datatypes to be
// used in generic functions.
type Subtractable interface {
	int | int32 | int64 | float32 | float64 | uint | uint32 | uint64
}

//OMIT
// Moveable is a interface that is used to handle many objects that are moveable
type Moveable interface {
	Move(Subtractable)
}

//OMIT
// Car is a test struct for cars, implements Moveable
type Car struct{ Name string }

//OMIT
func (c Car) Move(meters Subtractable) { fmt.Printf("%s moved %d meters\n", c.Name, meters) }

//OMIT
// Move is a generic function that takes in a Moveable and moves it
func Move[V Moveable, D Subtractable](v V, distance D, meters D) D {
	v.Move(meters)
	return distance - meters
}

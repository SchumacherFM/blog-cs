package main

import (
	"fmt"
	"time"
)

// https://github.com/golang/go/issues/45346
// Section: Combining embedded non-interfaces with methods
type TimeLayoutProvider interface {
	~struct{} // constrain base type to avoid runtime errors on zero-value method calls
	TimeLayout() string
}

type TimeFormatted[T TimeLayoutProvider] time.Time

func (tf TimeFormatted[T]) MarshalText() ([]byte, error) {
	var p T
	t := time.Time(tf)
	return []byte(t.Format(p.TimeLayout())), nil
}

type formatXYZProvider struct{}

func (formatXYZProvider) TimeLayout() string { return "2006 Jan _2 15:04:05 -0700" }

func main() {
	now := time.Now()
	//layout := TimeFormatted[formatXYZProvider](now)
	tf := TimeFormatted[formatXYZProvider](now)
	raw, _ := tf.MarshalText()
	fmt.Println(string(raw))
}

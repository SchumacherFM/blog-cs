package main

type T struct {
	A string `json:"A"`
	// vet error: struct field B repeats json tag "A" also at vet_repeated_tags.go:4
	B string `json:"A"`
	// vet error: not compatible with reflect.StructTag.Get: key:"value" pairs not separated by spaces
	C string `json:"C"xml:"C"`
}

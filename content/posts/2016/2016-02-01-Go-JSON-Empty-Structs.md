---
draft: false
title: 'Go: encoding/json,xml: omitempty with non-pointer structs'
author: Cyrill
date: 2016-02-01
disqus_identifier: /2016/02/01/go-omitempty-non-pointer-structs/
categories:
  - Thoughts
tags:
  - Golang
---

In Go encoding an empty non-pointer struct to JSON,XML with the struct tag `omitempty` can be a challenge.  

<!--more-->

Preface of the overall context can be read here: [https://golang.org/pkg/encoding/json/#Marshal](https://golang.org/pkg/encoding/json/#Marshal)

Given the following types:

```
type Chars []byte

type Route struct {
    Sum32 uint32
    Chars
}

type Field struct {
	ID Route
	ConfigPath Route `json:",omitempty"`
	Label Chars `json:",omitempty"`
	CanBeEmpty bool `json:",omitempty"`
	// Default can contain any default config value: float64, int64, string, bool
	Default interface{} `json:",omitempty"`
}
```

I've removed lots of functions and other fields just to focus on the context.

The Field type defines several fields with type `Route`, a non-pointer struct. The sruct tag
`json:",omitempty"` says that an empty field can be omitted.

This example shows how the Field type looks encoded in JSON with all fields filled out:

<iframe class="playground" scrolling="no" src="//play.golang.org/p/ZkL7IZ1xiH" frameborder="0" style="width: 100%; height: 900px"><a href="//play.golang.org/p/ZkL7IZ1xiH">see this code in play.golang.org</a></iframe>

But what happens when the ConfigPath field is empty?

<iframe class="playground" scrolling="no" src="//play.golang.org/p/wdVipxb6WL" frameborder="0" style="width: 100%; height: 900px"><a href="//play.golang.org/p/wdVipxb6WL">see this code in play.golang.org</a></iframe>

Ups. The ConfigPath will also be rendered into JSON because the Marshaller has no clue to check if the
field ConfigPath is empty.

Developers usually run into this problem when having a `time.Time` type in struct. The Time type gets always
copied around as a non-pointer. If you JSON encode it you get  `"t":"0001-01-01T00:00:00Z"` instead of "t" being absent.

The reason for that has been buried down deep in the [JSON package](https://github.com/golang/go/blob/release-branch.go1.5/src%2Fencoding%2Fjson%2Fencode.go#L278): 

```
func isEmptyValue(v reflect.Value) bool {
	switch v.Kind() {
	case reflect.Array, reflect.Map, reflect.Slice, reflect.String:
		return v.Len() == 0
	case reflect.Bool:
		return !v.Bool()
	case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
		return v.Int() == 0
	case reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64, reflect.Uintptr:
		return v.Uint() == 0
	case reflect.Float32, reflect.Float64:
		return v.Float() == 0
	case reflect.Interface, reflect.Ptr:
		return v.IsNil()
	}
	return false
}
```

As you can see there is no switch case for `reflect.Struct`. Therefore the encoder has no knowledge how
to check if a struct is empty.

The issue is open since Nov. 2012 [#4357](https://github.com/golang/go/issues/4357).

There are several solutions:

1. Sept 2013: [golang-nuts](https://groups.google.com/forum/#!searchin/golang-nuts/omitempty/golang-nuts/3aTHW0FaDGA/o_M0A4kqr1QJ)
    to use a pointer.
2. Using a switch case for `reflect.Struct` [#11939](https://github.com/golang/go/issues/11939):

    ```
    case reflect.Struct:
            return reflect.Zero(v.Type()).Interface() == v.Interface()
    ```
3. Using an additional interface in the encoding package [#11939](https://github.com/golang/go/issues/11939) and 
in [#4357](https://github.com/golang/go/issues/4357):

    ```
    type IsZeroer interface {
            IsZero() bool
    }
    ```
4. json|xml.Marshal() should be able to return nil, nil (which is currently an error)
5. json|xml.Marshal() should be able to return nil, encoding.ErrIsEmpty

1. I'm not in for a pointer because it increases the pressure on the garbage collector.
2. It's one way to go.
3. Additional interface need to be maintained.
4. Was my first try until I realised the panic error. This feature cannot work because the
JSON/XML key has already been written.
5. Same as 4.

As [_rsc](https://twitter.com/_rsc) stated in [CL13914](https://go-review.googlesource.com/#/c/13914/): 

> I'd really like to stop adding to these packages. I think we need to leave well enough alone at some point.

So I was quite shocked. What to do?

I've implemented my own interface :-\. For now this seems to be so far so good. But can be refactored in the
future. Naming is hard ;-)

```
type SelfRouter interface {
	SelfRoute() Route
}
```

The new Field type looks like:

```
type Field struct {
	ID Route
	ConfigPath SelfRouter `json:",omitempty"`
	Label Chars `json:",omitempty"`
	CanBeEmpty bool `json:",omitempty"`
	Default interface{} `json:",omitempty"`
}
```

<iframe class="playground" scrolling="no" src="//play.golang.org/p/ttdT0sg3zs" frameborder="0" style="width: 100%; height: 1000px"><a href="//play.golang.org/p/ttdT0sg3zs">see this code in play.golang.org</a></iframe>

Can you spot or guess why `type Chars []byte` will be encoded to a human readable string instead of
to something like `{"ID":"aHR0cF9wb3J0","Default":8080}`? ;-)

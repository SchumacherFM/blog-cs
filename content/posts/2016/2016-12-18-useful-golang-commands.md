---
draft: true
title: Collection of useful Go command line instructions
author: Cyrill
date: 2016-12-18
categories:
  - Projects
tags:
  - Golang
  - CommandLine
---

This blog post gets updated frequently whenever I find a new Golang command line instruction or
a usage of a environment variable to influence the behaviour of a Go program.
Last update: 18. Dec. 2016 

<!--more-->

## General

```bash
export CDPATH=".:$HOME:$GOROOT/src:$GOPATH/src/golang.org:$GOPATH/src/github.com"
```

#### Disable CGO

```
$ export CGO_ENABLED=0
$ CGO_ENABLED=0 go test -v -bench=. -etc .
```

## Race

```bash
$ GORACE="halt_on_error=1" go test ./. $(ARGS) -v -race -timeout 15s
```

## Benchmark

```bash
$ go test -v -run=🤐 -bench $(BENCHMARK) -count=10 -benchmem . > bm_baseline_new.txt 
$ benchstat bm_baseline.txt bm_baseline_new.txt
```

[Benchstat computes and compares statistics about benchmarks](https://github.com/rsc/benchstat)

## Test - Memory and CPU Profile

```bash
$ go test $(LDFLAGS) -test.benchmem -bench $(BENCHMARK) $(ARGS) -memprofile mem.mprof -v
$ go test $(LDFLAGS) -test.benchmem -bench $(BENCHMARK) $(ARGS) -cpuprofile cpu.out -v
```


## Test - Finding Allocations



## Test Coverage

```bash
gocover() {
  t=`mktemp "$TMPDIR./gocover.XXXXXX"`
  go test $COVERFLAGS -coverprofile=$t $@ && go tool cover -func=$t && unlink $t
}

gocover-web() {
  t=`mktemp "$TMPDIR./gocover.XXXXXX"`
  go test $COVERFLAGS -covermode=count -coverprofile=$t $@ && go tool cover -html=$t && unlink $t
}

alias gi="goimports -w ."

godepgraphNative() {
   pkg=$(go list $@)
   (   echo "digraph G {"
       go list -f '{{range .Imports}}{{printf "\t%q -> %q;\n" $.ImportPath .}}{{end}}' \
          $(go list -f '{{join .Deps " "}}' $pkg) $pkg
       echo "}"
   ) | dot -Tsvg -o /tmp/deps.svg
}
alias godepgraphOpen='godepgraph . | dot -Tsvg -o /tmp/godepgraph.svg && open /tmp/godepgraph.svg'

```
[godepgraph - A Go dependency graph visualization tool](https://github.com/kisielk/godepgraph)


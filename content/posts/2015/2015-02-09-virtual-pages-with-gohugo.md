---
title: Virtual Pages with GoHugo.io
author: Cyrill
date: 2015-02-09
categories:
  - Thoughts
tags:
  - GoHugo
  - GoLang
---

Importing pages via JSON from another URL. With this feature you can let 
[Hugo](http://gohugo.io) render virtual pages.

<!--more-->

My idea is: Import Hugo-ready pages via JSON from any local file or URL.

The Go code is currently in my [url.go](https://github.com/SchumacherFM/hugo/blob/SchumacherFM_SourceJSON/source/url.go#L69).

Exists there a more appropriate name instead of *Virtual Pages* for that feature?

### How to implement?

Run the hugo binary with the command line option `--sourceUrl` and provide
a valid URL to a JSON stream.

```
$ hugo server -w -v --baseUrl="localhost" --cacheDir="./cache" --sourceUrl=http://anUrl/streamOfPages.json
```

The JSON file must be a valid stream. 

An object within the JSON stream consists of a `Path` and a `Content` key:

```
{"Path":".\/community\/contributing.md","Content":"The usual hugo content goes here"}
{"Path":".\/community\/contacts.md","Content":"The usual hugo content goes here"}
{"Path":".\/community\/authors.md","Content":"The usual hugo content goes here"}
```

The further processing is the same as you would create a hugo file on your hard disk.

#### Why a JSON Stream?

Details what a JSON stream is: [http://en.wikipedia.org/wiki/JSON_Streaming](http://en.wikipedia.org/wiki/JSON_Streaming)

I'm generating around 100k pages via a Magento module to export all products and categories.
So parsing these amounts ob objects as a single object is pretty inefficient there a stream comes 
in handy if parsing of one of the objects fails.

A demo stream: [https://github.com/SchumacherFM/hugo/blob/SchumacherFM_SourceJSON/source/streamOfPages.json](https://github.com/SchumacherFM/hugo/blob/SchumacherFM_SourceJSON/source/streamOfPages.json)

### Notes

The command line options `--cacheDir` and `--ignoreCache` have at the moment no effects because a previous
pull request [#748](https://github.com/spf13/hugo/pull/748) has not yet been merged into hugo.

If you run hugo with the watcher enabled, each time you change a file on the hard disk and
the watcher got triggered the source JSON stream will be re-downloaded.


---
title: Data-driven contents with GoHugo.io - Update
author: Cyrill
date: 2015-02-08
disqus_identifier: /2014/12/21/dynpages-gohugo/
categories:
  - Thoughts
tags:
  - GoHugo
  - GoLang
---

Check out the update in the notes section [2014/12/21/dynamic-pages-with-gohugo.io/](2014/12/21/dynamic-pages-with-gohugo.io/).

<!--more-->

Update 29. Jan. 2016:

Renamed the topic to Data-driven content because [better wording](https://gohugo.io/extras/datadrivencontent/) :-)

Update 8. Feb. 2015:

The parameter `--ignoreCache` has been added to ignore the read from the cache but writing to the cache
is still happening.

`getJSON` and `getCSV` are now variadic functions. You can submit multiple parts of an URL which
will be joined to the final URL. Example:

```
{{ $id := .Params._id }}
{{ $url_pre :=  "http://localhost:3000/db/persons/" }}
{{ $url_post := "/limit/10/skip/0" }}
{{ $gistJ := getJSON $url_pre $id $url_post }}
```

For `getCSV` the separator argument has been moved to the beginning of the function.

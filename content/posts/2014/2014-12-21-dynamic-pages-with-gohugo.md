---
title: Data-driven content with GoHugo.io
author: Cyrill
date: 2014-12-21
categories:
  - Thoughts
tags:
  - GoHugo
  - GoLang
aliases:
    - /2014/12/21/dynamic-pages-with-gohugo.io
---

Update: 8. Feb. 2015 See the Notes section at the end. 

Update: 27. Dec 2014

What if you want to create simple pseudo dynamic content within a page or a layout
with [Hugo](http://gohugo.io), the static site generator?

<!--more-->

My idea is: Import any JSON or CSV from any local file or URL and make the JSON or CSV content
available in a [shortcode](http://gohugo.io/extras/shortcodes/) or directly in the layout files.

The Go code is currently in my [template_resources.go](https://github.com/SchumacherFM/hugo/blob/dynamicJsonShortCodes/tpl/template_resources.go).

### How to implement?

Local JSON or CSV files must reside inside Hugos working directory.

As an example I'm using the JSON from my [GitHub Stars](https://api.github.com/users/schumacherfm/starred).

In your markdown template you can e.g. add a short code like:

```
{{</* demoJsonGH url="static/wp-content/uploads/hugo/starred.json" */>}}
```

```
{{</* demoJsonYT url="http://gdata.youtube.com/feeds/users/useryt/uploads?alt=json&max-results=10" */>}}
```

The demoJsonGH short code template is:

```
<ul class="pinglist">
  {{ $url := .Get "url" }}
  {{ range getJSON $url }}
    {{ $p := . }}
    <li>
      {{$p.language}}: <strong>{{ $p.name }}</strong>
      <a href="{{ $p.html_url }}" target="_blank">{{ $p.full_name }}</a>
      <br>
      Stars: {{$p.stargazers_count}} | Watchers: {{$p.watchers_count}}<br>
      {{ $p.description }}
    </li>
    {{ end }}
</ul>
```

### Parsing JSON results

{{< demoJsonGH url="static/wp-content/uploads/hugo/starred.json" >}}

{{< demoJsonGH url="static/wp-content/uploads/hugo/starred2.json" >}}

Parsing YouTube feed url:

{{< demoJsonYT url="static/wp-content/uploads/hugo/ytUploads.json" >}}

One strange problem occurs when parsing the Youtube API 2.0 (deprecated):

The JSON response looks something like:

```
  "entry": [
    {
      "id": {"$t": "http://gdata.youtube.com/feeds/videos/XeceUDREW0U"},
      "published": {"$t": "2014-12-20T22:35:14.000Z"},
      "updated": {"$t": "2014-12-20T22:37:03.000Z"},
      "category": [
        {
          "scheme": "http://schemas.google.com/g/2005#kind",
          "term": "http://gdata.youtube.com/schemas/2007#video"
        },
        {
          "scheme": "http://gdata.youtube.com/schemas/2007/categories.cat",
          "term": "Travel",
          "label": "Travel & Events"
        }
      ],
      "title": {
        "$t": "Carols in the Domain, Sydney 2014",
        "type": "text"
      },
```

The YouTube short code template is:

```
<ul class="pinglist">
  {{ $url := .Get "url" }}
  {{ $j := getJSON $url }}

  {{ range $j.feed.entry }}
    {{ $v := . }}
    <li>
      {{index $v.title }}<br>
    </li>
  {{ end }}
</ul>
```

Hugo totally panics and crashes when using: `{{$v.title.$t}}`.

The best solution should be switching to [Youtube API v3](https://developers.google.com/youtube/v3/).

Or any other ideas?

### Parsing CSV

The short code within your page for the CSV looks like:

```
{{</* demoCsv url="static/wp-content/uploads/hugo/SalesJan2009.csv" sep="," */>}}
```

The url can be a local or a remote resource. Sep is the CSV separator which can only be one character long.
There is currently no possibility to provide a line separator (Default: `\r\n` or `\n`; `\r` does not work.).

The html of the `demoCsv` short code displays:

```
<table border="1">
  {{ $url := .Get "url" }}
  {{ $sep := .Get "sep" }}
  {{ range $i, $r := getCSV $sep $url }}

    {{ if eq $i 0 }}
      <thead>
        <tr>
          {{ range $r }}
            <th>{{ . }}</th>
          {{end}}
        </tr>
      </thead>
    {{else}}
      <tbody>
        <tr>
          {{ range  $r }}
            <td>{{ . }}</td>
          {{end}}
        </tr>
      </tbody>
    {{end}}

  {{ end }}
</table>
```

The final result:

{{< demoCsv url="static/wp-content/uploads/hugo/SalesJan2009.csv" sep="," >}}

### Integrating into layout HTML files

An example on how I have integrated my GitHub Gists into the left sidebar can be found here:
[layouts/partials/sidebarLeftCategories.html#L29](https://github.com/SchumacherFM/blog-cs/blob/master/layouts/partials/sidebarLeftCategories.html#L29)

### Notes

Downloaded remote files will be cached in `--cacheDir`. The default cacheDir is set to `$TMPDIR/hugo_cache/` 
The only cache invalidation method is left to the user: `rm *`. Downloaded files are always cached.

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

### Futures Features

Once I have more time I would like to implement also an RSS reader and advanced authentication methods.

A far future feature would be to generated a whole category or category tree with n documents from a JSON file.
That feature would allow to import categories and products from Magento or any other system.

Update 29. Jan. 2016:

Renamed the topic to Data-driven content because [better wording](https://gohugo.io/extras/datadrivencontent/) :-)

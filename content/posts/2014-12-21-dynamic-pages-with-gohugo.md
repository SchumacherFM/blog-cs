---
title: Dynamic Pages with GoHugo.io
author: Cyrill
date: 2014-12-21
disqus_identifier: /2014/12/21/dynpages-gohugo/
categories:
  - Thoughts
tags:
  - GoHugo
  - GoLang
---

What if you want to create simple pseudo dynamic content within a page 
with [Hugo](http://gohugo.io), the static site generator?

<!--more-->

My idea is: Import any JSON or CSV from any local file or URL and make the JSON or CSV content
available in a [shortcode](http://gohugo.io/extras/shortcodes/).

The Go code is currently in my [fork shortcode_resources.go](https://github.com/SchumacherFM/hugo/blob/dynamicJsonShortCodes/hugolib%2Fshortcode_resources.go#L87).
Mainly to do some more refactor before sending a PR. I'm not quite happy with the code but it works. 
Any suggestions someone? Also tests are missing ... 8-|

### How to implement?

Local files must reside inside Hugos working directory.

As an example I'm using the JSON from my [GitHub Stars](https://api.github.com/users/schumacherfm/starred).

In your markdown template you can e.g. add a short code like:

```
{{</* jsonGH url="static/starred.json" */>}}
```

```
{{</* jsonYT url="http://gdata.youtube.com/feeds/users/useryt/uploads?alt=json&max-results=10" */>}}
```

The jsonGH short code template is:

```
<ul class="pinglist">
  {{ $url := .Get "url" }}
  {{ range .GetJson $url }}
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

### Parsing JSON

Parsing index 0:

{{< jsonGH url="static/starred.json" >}}

Parsing index 1:

{{< jsonGH url="static/starred2.json" >}}

Parsing YouTube feed url:

{{< jsonYT url="static/ytUploads.json" >}}

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
  {{ $j := .GetJson $url }}

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
{{</* csvDemo url="static/SalesJan2009.csv" sep="," */>}}
```

The url can be a local or a remote resource. Sep is the CSV separator which can only be one character long.
There is currently no possibility to provide a line separator (Default: `\r\n` or `\n`).

The html of the `csvDemo` short code displays:

```
<table border="1">
  {{ $url := .Get "url" }}
  {{ $sep := .Get "sep" }}
  {{ range $i, $r := .GetCsv $url $sep }}

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

{{< csvDemo url="static/SalesJan2009.csv" sep="," >}}

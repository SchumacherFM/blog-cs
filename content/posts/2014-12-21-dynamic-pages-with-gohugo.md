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
json:
  - static/starred.json
  - static/starred2.json
  - http://gdata.youtube.com/feeds/users/kiriwt/uploads?alt=json&max-results=10
---

What if you want to create simple pseudo dynamic content within a page 
with [Hugo](http://gohugo.io), the static site generator?

<!--more-->

My idea is: Import any JSON from any local file or URL and make the JSON content
available in a [shortcode](http://gohugo.io/extras/shortcodes/).

The Go code is currently in my [fork](https://github.com/SchumacherFM/hugo/blob/dynamicJsonShortCodes/hugolib/shortcode.go#L130).
Mainly to do some more refactor before sending a PR. I'm not quite happy with the code but it works. 
Any suggestions someone? Also tests are missing ... 8-|

### How to implement?

You should extend the [front matter](http://gohugo.io/content/front-matter/) per page with this list:

```
json:
  - static/starred.json
  - static/starred2.json
  - http://gdata.youtube.com/feeds/users/ytuser/uploads?alt=json&max-results=10
```

Local files must reside inside Hugos working directory.

As an example I'm using the JSON from my [GitHub Stars](https://api.github.com/users/schumacherfm/starred).

In your markdown template you can e.g. add a short code like:

```
{{</* jsonGH 0 */>}}
```

The 0 indicates which index to use in the json list within front matters.

The jsonGH short code template is:

```
<ul class="pinglist">
  {{ $i := index .Params 0 }}
  {{ range .GetJson $i }}
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

Parsing index 0:

{{< jsonGH 0 >}}

Parsing index 1:

{{< jsonGH 1 >}}

Parsing YouTube feed url:

{{< jsonYt 2 >}}

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
  {{ $i := index .Params 0 }}
  {{ $j := .GetJson $i }}

  {{ range $j.feed.entry }}
    {{ $v := . }}
    <li>
      {{index $v.title }}<br>
      Hugo dies when accessing: {{$v.title.$t}}: {{ $v.content.$t }}
    </li>
  {{ end }}
</ul>
```

Hugo totally panics and crashes when using: `{{$v.title.$t}}`.

The best solution should be switching to [Youtube API v3](https://developers.google.com/youtube/v3/).

Or any other ideas?

---
draft: true
title: Edge Side Includes with Caddy
author: Cyrill
date: 2017-03-04
disqus_identifier: /2017/03/04/caddyesi/
categories:
  - Projects
tags:
  - GoLang
  - EdgeSideIncludes
  - Caddy
  - CaddyESI
  - MicroServices
---

Introduction of a middleware for the <a href="https://caddyserver.com/" target="_blank">Caddy web server</a> 
to handle Edge Side Includes (ESI) tags. ESI tags are use to query backend
(micro) services. This middleware (CaddyESI) supports Redis, Memcache,
HTTP/HTTPS, HTTP2, shell scripts and gRPC (Protocol buffers).

<!--more-->

{{% hubinfo u="SchumacherFM" r="caddyesi" c="5" %}}

ESI tags are used to fetch content from a backend resource and inject that
content into the returned page to be displayed in a e.g. browser. ESI tags
limits itself not to HTML only, you can include them into all text formats.

**Warning:** Project still in beta phase and to enable more backend resources
(besides HTTP) you need to buy a monthly recurring Enterprise maintenance
support (Coming soon!)

This blog post and the GitHub might get moved to a different location.

## Architectural overview

[![Architectural overview](/posts/esi/caddy-esi-archi.png)](/posts/esi/caddy-esi-archi.png)

As the above sequence diagram shows, the output of the initial byte starts only
then, when all data from the backend resources has been received. This enables
us to calculate the correct `Content-Length` header and also allows to return
headers from the backend to the client. So <a href="https://en.wikipedia.org/wiki/Time_To_First_Byte" target="_blank">time to first byte &quot;TTFB&quot;</a>
depends on the slowest backend resource.

Future versions of CaddyESI provides the additional option of enabling
`Transfer-Encoding: chunked` to start immediately the output and then waiting
for all backend resources when the first ESI tag occurs in the page.

## Features

- Query data from HTTP, HTTPS, HTTP2, <a href="http://www.grpc.io" target="_blank">gRPC</a>, Redis, Memcache and soon SQL and fCGI.
- Multiple incoming requests trigger only one single parsing of the ESI tags per page
- Querying multiple backend server parallel and concurrent.
- Coalesce multiple incoming requests into one single request to a backend server
- Forwarding and returning (todo) of HTTP headers from backend servers
- Query multiple backend servers sequentially as a fall back mechanism
- Query multiple backend servers parallel and use the first returned result and
discard other responses, an obvious race condition. (todo)
- Support for NoSQL Server to query a key and simply display its value
- Variables support based on Server, Cookie, Header or GET/POST form parameters
- Error handling and fail over. Either display a text from a string or a static
file content when a backend server is unavailable.
- If an HTTP/S backend request takes longer than the specified timeout, flip the
source URL into an XHR request or an HTTP2 push. (todo)
- No full ESI support, if desired use a scripting language ;-)

More details how officially [Edge Side Includes](https://en.wikipedia.org/wiki/Edge_Side_Includes) are defined.

The middleware CaddyESI implements only the `<esi:include />` tag with different
features and interpretations.

## Example

The following ESI tag has been implemented into this markdown document:

    <esi_COLON_include src="grpcServerDemo" printdebug="1" key="session_{Fsession}" 
    forwardheaders="all" timeout="4ms" onerror="Demo gRPC server unavailable :-("/>

Short explanation for the tag above:

- `grpcServerDemo` is an alias stored in the resources file, which is not web accessible because it can contain sensitive data.
- `printdebug` prints duration, possible error messages and the parsed tag. You should only enable it during development.
- `session_{Fsession}` the uppercase `F` declares that the variable `session` can be found in the form, either GET or POST/PATCH/PUT.
- `forwardheaders` forwards all headers from your browser to the micro service. You can define specific headers only.
- `timeout` if the gRPC service takes longer than those `4ms` the error message in `onerror` gets displayed.

The content of the resources file looks:

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<items>
    <item>
        <alias>grpcServerDemo</alias>
        <url><![CDATA[grpc://127.0.0.1:42042]]></url>
    </item>
</items>
```

The following form enables you to create different session counters:

<form method="GET" action="/projects/2017-03-04-edge-side-includes-with-caddy/">
<label for="session">Session Name (8-128 characters)</label>
<input id="session" name="session" value="" maxlength="128" minlength="8">
<button type="submit">Submit</button>
</form>

<esi:include src="grpcServerDemo" printdebug="1" key="session_{Fsession}" forwardheaders="all" timeout="4ms" onerror="Demo gRPC server unavailable :-("/>

Now open the Web Inspector panel and search for HTML comment of the `printdebug` output.

<a href="https://github.com/SchumacherFM/caddyesi/blob/master/esitag/backend/grpc_server_main_demo.go" target="_blank">Click here</a> to discover the source for the gRPC server

## Documentation

Please switch to the [README.md](https://github.com/SchumacherFM/caddyesi/blob/master/README.md#plugin-configuration-optional) in the GitHub source code.

## JSON Example

Redis feature not enabled by default.

Lets say you want to output music stations as a JSON object. First we're
configuration the backend resource alias "myRedis". The URL to the Redis server
gets stored in the resource configuration file (see Caddyfile). Second we're
adding the ESI tags to the main JSON array, defining the src and each key points
to a key in the Redis server. The value of each key contains a valid JSON
object. Once the page gets requested from the e.g. browser the CaddyESI
middleware will query in parallel Redis and insert the value into the main JSON
array. As Redis is single threaded you can define additional Redis sources to
gain even more performance. Finally you only need to write a program to insert
the keys and values into Redis.

```json
[
  <esi:include src="myRedis" key="station/best_of_80s" />,
  <esi:include src="myRedis" key="station/herrmerktradio" />,
  <esi:include src="myRedis" key="station/bluesclub" />,
  <esi:include src="myRedis" key="station/jazzloft" />,
  <esi:include src="myRedis" key="station/jahfari" />,
  <esi:include src="myRedis" key="station/maximix" />,
  <esi:include src="myRedis" key="station/ondalatina" />,
  <esi:include src="myRedis" key="station/deepgroove" />,
  <esi:include src="myRedis" key="station/germanyfm" />,
  <esi:include src="myRedis" key="station/alternativeworld" />
]
```

## Similar technologies

#### Varnish ESI Tags

Correct me if I'm wrong:

- No HTTP2 support
- No HTTPS support
- Sequential processing of all ESI tags
- Nearly full support of the ESI tag specification

<a href="http://stackoverflow.com/questions/5960598/varnish-and-esi-how-is-the-performance" target="_blank">Stack Overflow: Varnish and ESI, how is the performance?</a>

CaddyESI solves this problem: <a href="http://serverfault.com/questions/737229/varnish-esi-streaming-response-is-it-possible-not-to-stream-the-response" target="_blank">Varnish ESI Streaming Response - Is it possible NOT to stream the response</a>

CaddyESI solves this problem: <a href="http://www.eschrade.com/page/magento-esi-varnish-and-performance/" target="_blank">ESchrade - Kevin Schroeder - MAGENTO, ESI, VARNISH AND PERFORMANCE</a>

#### BigPipe

<a href="https://www.facebook.com/notes/facebook-engineering/bigpipe-pipelining-web-pages-for-high-performance/389414033919" target="_blank">Invented at Facebook BigPipe</a>
 
<a href="https://www.drupal.org/docs/8/core/modules/bigpipe/overview" target="_blank">Drupal BigPipe Overview</a>

How it works

1. During rendering, the personalized parts are turned into placeholders.
2. By default, Drupal 8 uses the Single Flush strategy (aka "traditional") for replacing the placeholders. i.e. we don't send a response until we've replaced all placeholders.
3. The BigPipe module introduces a new strategy, that allows us to flush the initial page first, and then stream the replacements for the placeholders.
4. This results in hugely improved front-end/perceived performance (watch the 40-second screencast above).

## Download Caddy server incl. ESI support

TODO ;-)

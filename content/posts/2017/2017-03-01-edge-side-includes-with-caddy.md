---
title: Edge Side Includes with Caddy
author: Cyrill
date: 2017-03-01
disqus_identifier: /2017/03/01/caddyesi/
categories:
  - Thoughts
tags:
  - Golang
  - EdgeSideIncludes
  - Caddy
  - CaddyESI
  - MicroServices
---

Introduction of a middleware for the Caddy webserver to handle Edge Side
Includes (ESI) tags. ESI tags are use to query backend (micro) services. This
middleware (CaddyESI) supports Redis, Memcache, HTTP/HTTPS, HTTP2, shell scripts
and gRPC (Protocol buffers).

<!--more-->

More details how officially [Edge Side Includes](https://en.wikipedia.org/wiki/Edge_Side_Includes) are defined.

The middleware CaddyESI implements only the `<esi:include />` tag with different
features and interpretations.

## Architectural overview

![Architectural overview](/posts/esi/caddy-esi-archi.png)

## Example

<esi:include src="grpcServerDemo" printdebug="1" key="session_{Fsession}" forwardheaders="all" timeout="4ms" onerror="Demo gRPC server unavailable :-("/>

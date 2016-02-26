---
title: Mailout - SMTP client middleware for sending emails with CaddyServer and static sites
author: Cyrill
date: 2016-02-26
disqus_identifier: /2016/02/26/mailout-caddy/
categories:
  - Projects
tags:
  - Caddy
  - Mailout
  - GoLang
---

Ever wanted to send emails from your static website without depending on 3rd party services?
Meet the mailout middleware for Caddy Server!
 
<!--more-->

After moving several of my blogs away from WordPress and TYPO3 to [Hugo](https://gohugo.io),
the static site generator, I wasn't able to send emails from these static sites anymore. 

Of course there are 3rd party services like https://en.wikipedia.org/wiki/FormMail or 
www.formspree.io or any other interpreted script form processor, which you can install. 
But those scripts introduce another insecure dependency or someone reads your emails.

With the Go Language based [middleware](https://en.wikipedia.org/wiki/Middleware) mailout 
for [CaddyServer](https://caddyserver.com) I have solved all the "problems". The feature lists:

- Single binary and compiled into the Caddy web server
- Available for nearly all operating systems and architectures
- Receive the form via HTTP/2 with TLS
- Send the email optionally [PGP](https://en.wikipedia.org/wiki/Pretty_Good_Privacy) encrypted
- Partly RESTful API designed end point
- Support for plain text and HTML emails
- Rate limitation based on a [Token Bucket](http://en.wikipedia.org/wiki/Token_bucket) algorithm
- Full support for SMTP with SSL encryption (Port 465) or TLS encryption (Port 587). Of course unencrypted sending on Port 25 has not been deactivated. 
- Optional server side logging of sent emails. Logging after PGP encryption.

Due to the REST API you can use any other programming language to post your form data to the mailout endpoint.

## Can I test it?

Sure. Click on the top left of this page on the envelope icon below the "Follow:" headline.
 
A modal will open and enable you to send a PGP encrypted email to me. Be aware, I may respond.

## Where can I get it?

Download mailout compiled into Caddy from its download page: [https://caddyserver.com/download](https://caddyserver.com/download)

You can even add many more middleware features!

## I want to contribute or see the documentation!

Please go to the GitHub repository: [https://github.com/SchumacherFM/mailout](https://github.com/SchumacherFM/mailout)

{{% hubinfo u="SchumacherFM" r="mailout" c="5" %}}


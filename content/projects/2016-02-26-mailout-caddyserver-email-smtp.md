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
- Receive the posted HTML form via HTTP/2 with TLS
- Send the email optionally [PGP](https://en.wikipedia.org/wiki/Pretty_Good_Privacy) encrypted
- Partly RESTful API designed end point
- Support for plain text and HTML emails
- Rate limitation based on a [Token Bucket](http://en.wikipedia.org/wiki/Token_bucket) algorithm
- Full support for SMTP with SSL encryption (Port 465) or TLS encryption (Port 587). Of course unencrypted sending on Port 25 has not been deactivated. 
- Optional server side logging of sent emails. Logging after PGP encryption.

The mailout directive starts a service routine that runs during the lifetime of the server.
This background service manages the sending of the emails. It opens a connection to the SMTP
server, sends the email and then waits for 30 seconds if another email should be send out.
If no email gets transferred through the channel, the service routine closes the connection to
the SMTP server. For the next email the connection gets reopened.

During the start phase of the Caddy binary the mailout setup routine tries to ping the SMTP server and
checks if the log in credentials satisfy the authentication system. If that
ping fails, mailout service won't be available.

All email sending related errors gets logged in the error log file. The JSON API will not report
any failed sending of an email. If you enable email logging, no email gets lost despite SMTP errors.
If you do not provide a directory for email and error logging you will leave no trace on the hard disk
for a sent out email, theoretically.

Due to the REST API you can use any other programming language to post your form data to the mailout endpoint.

*PGP:* Note on sensitive information leakage when using PGP with multiple email message receivers: For each 
email address in the to, cc and bcc field you must add a public PGP key, if not, emails to recipients
without a public key won't be encrypted. For all email addresses with a PGP key, the mailout middleware
will send a separated email encrypted with the key of the receiver.

## Can I test it?

Sure. Click on the top left of this page on the envelope icon below the "Follow:" headline.
 
A modal will open and enable you to send a PGP encrypted email to me. Be aware, I may respond.

## Where can I get it?

Download mailout compiled into Caddy from its download page: [https://caddyserver.com/download](https://caddyserver.com/download)

You can even add many more middleware features!

## I want to contribute or see the documentation!

Please go to the GitHub repository: [https://github.com/SchumacherFM/mailout](https://github.com/SchumacherFM/mailout)

{{% hubinfo u="SchumacherFM" r="mailout" c="5" %}}


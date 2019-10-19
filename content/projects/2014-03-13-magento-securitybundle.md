---
title: Magento Security Bundle @todo
author: Cyrill
date: 2014-03-13
categories:
  - Projects
tags:
  - Magento
  - Security
  - Development
  - Todo
---

The Magento SecurityBundle provides additional security features for your e-commerce application.

This project is ideal for a hackathon.

<!--more-->

{{% hubinfo u="SchumacherFM" r="Magento-SecurityBundle" c="5" %}}

The Magento SecurityBundle provides additional security features for your e-commerce application. 

Idea: 

- [https://github.com/nelmio/NelmioSecurityBundle](https://github.com/nelmio/NelmioSecurityBundle)
- [http://ibuildings.nl/blog/2013/03/4-http-security-headers-you-should-always-be-using](http://ibuildings.nl/blog/2013/03/4-http-security-headers-you-should-always-be-using)

## Features

* **Content Security Policy**: Cross site scripting attacks (XSS) can be mitigated
in modern browsers using a policy which instructs the browser never to execute inline scripts, 
or never to load content from another domain than the page's domain.

* **Signed Cookies**: Specify certain cookies to be signed, so that the user cannot modify
  them. Note that they will not be encrypted, but signed only. The contents will still be
  visible to the user.

* **Encrypted Cookies**: Specify certain cookies to be encrypted, so that the value cannot be
  read. When you retreive the cookie it will be automatically decrypted.

* **Clickjacking Protection**: X-Frame-Options header is added to all responses to prevent your  
  site from being put in a frame/iframe. This can have serious security implications as it has
  been demonstrated time and time again with Facebook and others. You can allow framing of your  
  site from itself or from anywhere on a per-URL basis.

* **External Redirects Detection**: Redirecting from your site to arbitrary URLs based on user
  input can be exploited to confuse users into clicking links that seemingly point to valid
  sites while they in fact lead to malicious content. It also may be possible to gain PageRank
  that way.

* **Forced HTTPS/SSL Handling**: This forces by all requests to go through SSL. It will also
  send [HSTS](http://tools.ietf.org/html/draft-hodges-strict-transport-sec-02) headers so that
  modern browsers supporting it can make users use HTTPS even if they enter URLs without https, 
  avoiding attacks on public Wi-Fi.

* **Flexible HTTPS/SSL Handling**: If you don't want to force all users to use HTTPS, you should  
  at least use secure session cookies and force SSL for logged-in users. But then logged-in users  appear logged-out when they access a non-HTTPS resource. This is not really a good solution.  This will make the application detect logged-in users and redirect them to a secure URL,  without making the session cookie insecure.

* **Cookie Session Handler**: You can configure the session handler to use a cookie based storage.
  **WARNING**: by default the session is not encrypted, it is your responsibility to properly 
  configure the Encrypted Cookies  section to include the session cookie (default name: session). 
  The size limit of a cookie is 4KB, so make sure you are not  storing object or long text into session.

* **Disable Content Type Sniffing**: Require that scripts are loaded using the correct mime type. 
  This disables the feature that some browsers have which uses content sniffing to determine if 
  the response is a valid script file or not.

* Maybe: **Implement pbkdf2**: Encrypting passwords for customers, admins and API access

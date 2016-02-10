---
title: Mediamock
author: Cyrill
date: 2015-12-28
disqus_identifier: /2015/12/28/mediamock/
categories:
  - Projects
tags:
  - Magento
  - Mediamock
  - GoLang
---

Mediamock mocks a media directory for HTTP requests on your development 
environment. Avoids copying of GBs/TBs/PBs of files to your local machine.
Update 10. Feb. 2016.
 
<!--more-->

This blog posts reflects version [>=0.6.0](https://github.com/SchumacherFM/mediamock/releases).

Current use case: The media/assets folder of an online store or content 
management system, containing all images, pdf, etc, can have a pretty huge
total byte size, up to several GB or even TB. Copying these files to your 
development environment takes a long time and consumes lots of precious 
disk space. 

Mediamock also helps you to get not distracted by the original images.

[![Example mocked images in a store](/wp-content/uploads/mediamock-example-shop.png)](/wp-content/uploads/mediamock-example-shop.png)

{{% hubinfo u="SchumacherFM" r="mediamock" c="5" %}}

## Mediamock has two run modes:

- Analyze and save the folder structure and image width x height (in a CSV file) on the server.
- Download the CSV file onto your development machine either through a sftp/scp command or through mediamock itself.
- Start a web server and serve the only-the-fly generated files or without CSV proxy the requests.

### Run mode: Analyze

The program will recursively walk through the server side directories and saves
each media file including path, image width + height and modification 
date in a simple zipped CSV file.

### Run mode: Server

Generates the images on-the-fly as defined in the CSV file and/or acts as a proxy to download
the images from the production server onto your development machine (incl. caching).

The command `$ mediamock help server` gives you a detailed explanation how
to start the server with the TOML configuration file.

#### Server TOML config

You can specify additional folders with file name regex patterns in a configuration
[TOML](https://github.com/toml-lang/toml) file to allow media creation of files 
which do not exists in the CSV file. Type `$ mediamock imgconfig` to get an example 
[TOML](https://github.com/toml-lang/toml) configuration file.

Example:

```
[[dirs]]
name = "media/directory1/base"
width = 250
height = 120

[[dirs]]
# name must be the full path to the directory where the final file resides.
name = "media/directory1/admin"
# regex matches the full file name
regex = "x[a-z]+"
width =  350
height = 120

[[dirs]]
name = "media/directory1/admin"
# regex matches the full file name
regex = "1[a-z0-9]+"
width =  450
height = 120
```

- Directory `media/directory1/base` serves all requested images with a size of 250x120.
- Directory `media/directory1/admin` serves all requested images which contain the 
string `x[a-z]+` with a size of 350x120.
- Directory `media/directory1/admin` serves all requested images which contain the 
string `1[a-z0-9]+` with a size of 450x120.

A width or height of 0 gets ignored.

## How to use server mode with my Online Store or CMS?

### Magento

Magento 1: Please install [https://github.com/SchumacherFM/mediamock-magento](https://github.com/SchumacherFM/mediamock-magento).

You can then run the MySQL query to adjust the media path to mediamock server: 

```
UPDATE core_config_data set value='http://127.0.0.1:4711/media/' WHERE path LIKE '%media_url%';
```

Magento 2: Please install [https://github.com/SchumacherFM/mediamock-magento2](https://github.com/SchumacherFM/mediamock-magento2) todo.

These modules disable the HDD file access for reading images. Writing is still possible.

I need help for the following systems:

- TYPO3 / NEOS
- Drupal
- Hybris
- Shopware
- OXID
- .... ?

## Command line

```
$ mediamock
NAME:
   mediamock - reads your assets/media directory on your server and
               replicates it as a virtual structure on your development machine.
               On top can act as a proxy.

               $ mediamock help analyze|server|imgconfig for more options!


USAGE:
   mediamock [global options] command [command options] [arguments...]

VERSION:
   develop by @SchumacherFM (compiled 2016-02-10 07:22:28.97200081 +0100 CET)

COMMANDS:
   analyze, a	Analyze the directory structure on you production server and write into a
                csv.gz file.
   server, s	Server reads the csv.gz file and creates the assets/media structure on the fly
                as a HTTP server. Does not write anything to your hard disk. Open URL / on the server
                to retrieve a list of all files and folders.
   imgconfig	Prints an example TOML configuration file.
   help, h	    Shows a list of commands or help for one command

GLOBAL OPTIONS:
   -q			    No output
   --help, -h		show help
   --version, -v	print the version
```

### Run analyze

```
$ ./mediamock help a
NAME:
   analyze - Analyze the directory structure on you production server and write into a
	csv.gz file.

USAGE:
   command analyze [command options] [arguments...]

OPTIONS:
   -d "."						        Read this directory recursively and write into -o
   -o "/tmp/hostname_mediamock.csv.gz"	Write to this output file.
```

The following is an example output:

```
$ ./mediamock analyze -d ~/Sites/magento19-data/media
8187 / 8187 [=========================================================================================] 100.00 %
Image ~/Sites/magento19-data/media/catalog/product/6/4/64406_66803218048_1831204_n.jpg decoding error: image: unknown format
Image ~/Sites/magento19-data/media/catalog/product/6/4/64406_66803218048_1813204_n_1.jpg decoding error: image: unknown format
Image ~/Sites/magento19-data/media/catalog/product/i/m/IMG_1658_4.png decoding error: image: unknown format
Image ~/Sites/magento19-data/media/catalog/product/i/m/IMG_7445.JPG decoding error: image: unknown format
Image ~/Sites/magento19-data/media/catalog/product/i/m/IMG_7450_1.JPG decoding error: image: unknown format
Image ~/Sites/magento19-data/media/catalog/product/i/m/IMG_7450_2.JPG decoding error: image: unknown format
Image ~/Sites/magento19-data/media/catalog/product/p/h/photo1_4.JPG decoding error: image: unknown format
Wrote to file: /tmp/hostname_mediamock.csv.gz
```

Concerns: You must download the mediamock binary onto your server and execute 
it from there on the command line. 

### Run server

```
$ mediamock help server
NAME:
   mediamock server - Server reads the csv.gz file and creates the assets/media structure on the fly
                      as a HTTP server. Does not write anything to your hard disk. Open URL / on the server
                      to retrieve a list of all files and folders.

USAGE:
   mediamock server [command options] [arguments...]

OPTIONS:
   --img-config 	Path to the configuration file for virtual image generation.
    imgconfig defines a TOML configuration file which allows you to specify wilcard
    image generation. You define a path to a directory and declare the image width and
    height. All image http requests to that directory will have the same size. Further
    more you can declare more occurences of the same directory and add a regular
    expression to serve different width and height within that directory. The image
    extension will be detected automatically. Type on the CLI:
    '$ mediamock imgconfig' to see an example of a TOML config.
   --img-pattern "icon"		Image pattern: happy, warm, rand, happytext, warmtext, a HTML hex value or icon
   --url-prefix 		Prefix in the URL path of the csv.gz file.
   --csv 			Source of csv.gz (file or URL)
   --host "127.0.0.1:4711"	IP address or host name
   --media-url 			External URL to the base media directory. Apply this URL and mediamock
    will download the images and save them locally. If the remote image does not exists
    a mocked image will be generated. (Proxy Feature)
   --media-cache 	Local folder where to cache the downloaded images. (Proxy Feature)
```

If the option `img-pattern` contains a word like `happytext` or `warmtext` then the image file name
will be printed all over the generate image. This is useful if you need to inspect a zooming
effect on the frontend. Better way to use the icon feature (default) which generates an identicon.

Pattern *icon* generates a identicons like introduced here [https://github.com/blog/1586-identicons](https://github.com/blog/1586-identicons).
The pattern will be generated from the file name, not the whole path.

If an image doesn't exists in the optionally provided CSV file but is requested from the front end
mediamock will try to generated an appropriate image if it can detect width and height
information within the URL.

E.g.: `http://127.0.0.1:4711/media/catalog/product/cache/2/small_image/218x258/9df78eab33525d08d6e5fb8d27136e95/detail/myImage.jpg`
mediamock can detect that this image is 218px x 258px in size because URL mentions 218x258.

```
$ mediamock s -csv /tmp/mediamock.csv.gz -url-prefix media/
```

#### Proxy feature

```
$ mediamock s --media-url=http://www.my-domain-whatever.com/
```

Mediamock tries to download the requested path from `http://www.my-domain-whatever.com/` and saves
the image with the same path (but without the domain) in the `--media-cache` folder.

Try fiddling around with the last slash in the `--media-url`. All errors gets logged to StdErr. 

If the `--media-cache` option has not been provided the downloaded images will be cached in
the temporary folder shown during startup.

You can use the proxy feature together with the CSV file: 

1. Mediamock first tries to download the image from the server
2. If the remote image does not exists it looks up the TOML configuration
3. If no TOML configuration can be found the image gets generated from the CSV file
4. If no entry in the CSV file can be found then the image size get guessed from the request path.
5. Rick will gonna give you up ;-)

#### Statistics

For detailed statistic about the running mediamock server internals you can visit:

- `http://localhost:4711/` Tiny directory index
- `http://localhost:4711/debug/charts/` Garbage Collection and Memory Usage statistics
- `http://localhost:4711/json` all files as a JSON stream (if CSV has been provided)
- `http://localhost:4711/html` all files as a HTML table (if CSV has been provided)

![ScreenShot](/wp-content/uploads/mediamock-debug-charts.png)

## Install

Download binaries for windows, linux and darwin (OSX) in the [release section](https://github.com/SchumacherFM/mediamock/releases).

If you would like to have binaries for other operating systems please contact me.

## Contribute

`GO15VENDOREXPERIMENT` introduces reproducible builds with Go 1.5. With Go 1.6 the vendor variable
 has been enabled as default = 1.

```
$ go get -u -v github.com/SchumacherFM/mediamock/...
$ cd $GOPATH/src/github.com/SchumacherFM/mediamock
$ git remote rm origin
$ git remote add origin git@github.com:username/CloneOfMediaMock.git
$ git submodule init
$ git submodule update
hack hack hack ...
$ GO15VENDOREXPERIMENT=1 go run main.go
hack hack hack ...
$ GO15VENDOREXPERIMENT=1 go run main.go
$ gofmt -w *.go common/*.go record/*.go server/*.go
$ git commit -a -m 'Add feature X including tests'
$ git push -u origin master
create pull request to github.com/SchumacherFM/mediamock
```

If you introduce a new dependency this is how to add it:

```
$ cd $GOPATH/src/github.com/SchumacherFM/mediamock
$ git submodule add git@github.com:username/GoLangRep.git vendor/github.com/username/GoLangRep
```

How do I know all dependencies?

```
$ go list -json github.com/SchumacherFM/mediamock/...
```

Feel free to add some tests. I only add tests where it seems useful.

## License

Copyright (c) 2015-2016 Cyrill (at) Schumacher dot fm. All rights reserved. See LICENSE file.

[Cyrill Schumacher](https://github.com/SchumacherFM) - [My pgp public key](http://www.schumacher.fm/cyrill.asc)

Identicon code by: Copyright (c) 2013, Damian Gryski

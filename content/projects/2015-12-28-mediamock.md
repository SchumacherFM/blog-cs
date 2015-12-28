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
 
<!--more-->

Current use case: The media/assets folder of an online store or content 
management system, containing all images, pdf, etc, can have a pretty huge
total byte size, up to several GB or even TB. Copying these files to your 
development environment takes a long time and consumes lots of precious 
disk space. 

Mediamock also helps you to get not distracted by the original images.

[![Example mocked images in a store](/wp-content/uploads/mediamock-example-shop.png)](/wp-content/uploads/mediamock-example-shop.png)

{{% hubinfo u="SchumacherFM" r="mediamock" c="5" %}}

## Mediamock has three run modes:

- First analyze and save the folder structure (in a CSV file) on the server.
- Download the saved structure onto your development machine
and recreate a physical mocked copy of the directories and files.
- Start a web server and create the files when a requests must be served.

### Run mode: Analyze

The program will recursively walk through the server side directories and saves
each media file including path, image width + height and modification 
date in a simple CSV file.

### Run mode: Mock

The mock mode will read the CSV file from your hard drive or via HTTP and 
creates all the directories and files including correct modification date for the
files. For images it creates an image with a pattern and the correct width 
and height.

The image contains an uniform color in a random, warm or happy tone or and 
identicon (default).

Supported image formats: png, jpeg and gif.

The mocked images are be as small as possible. All other non-image
files are of size 0kb.

This mocking process may take several tens of minutes, depending on the
amount of files to create.

### Run mode: Server

Same as Mock, but generates the images on-the-fly and does not write to the hard drive.

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

The command `$ mediamock help server` gives you a detailed explanation how
to start the server with the TOML configuration file.

## How to use server mode with my Online Store or CMS?

### Magento

Magento 1: Please install [https://github.com/SchumacherFM/mediamock-magento](https://github.com/SchumacherFM/mediamock-magento).

You can then run MySQL query: 

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
               replicates that structure on your development machine.

               $ mediamock help analyze|mock|server for more options!


USAGE:
   mediamock [global options] command [command options] [arguments...]

VERSION:
   0.5.0 by @SchumacherFM (compiled 2015-12-26T18:29:07+01:00)

COMMANDS:
   analyze, a	Analyze the directory structure on you production server and write into a
			csv.gz file.
   mock, m	Mock reads the csv.gz file and recreates the files and folders. If a file represents
		an image, it will be created with a tiny file size and correct width x height.
   server, s	Server reads the csv.gz file and creates the assets/media structure on the fly
		as a HTTP server. Does not write anything to your hard disk. Open URL / on the server
		to retrieve a list of all files and folders.
   imgconfig	Prints an example TOML configuration file.
   help, h	Shows a list of commands or help for one command

GLOBAL OPTIONS:
   -p "icon"		Image pattern: happy, warm, rand, happytext, warmtext HTML hex value or icon
   -q			Quiet aka no output
   --help, -h		show help
   --version, -v	print the version
```

If the option `p` contains the word `text` like `happytext` or `warmtext` then the image file name
will be printed all over the generate image. This is useful if you need to inspect a zooming
effect on the frontend. Better way to use the icon features which generates a identicon.

Pattern *icon* generates identicons like introduced here [https://github.com/blog/1586-identicons](https://github.com/blog/1586-identicons).
The pattern will be generated from the file name.

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

### Run mock

```
$ ./mediamock help m
NAME:
   mock - Mock reads the csv.gz file and recreates the files and folders. If a file represents
	an image, it will be created with a tiny file size and correct width x height.

USAGE:
   command mock [command options] [arguments...]

OPTIONS:
   -i 		Read csv.gz from this input file or input URL.
   -d "."	Create structure in this directory.
```

```
$ ./mediamock m -d pathToMyDevFolder -i https://www.onlineshop.com.au/mediamock.csv.gz -p warm
Directory pathToMyDevFolder created
241 / 9957 [=====>------------------------------------------------------------------] 2.42 % 9m32s
```

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
   --imgconfig 			Path to the configuration file for virtual image generation.
				imgconfig defines a TOML configuration file which allows you to specify wilcard
				image generation. You define a path to a directory and declare the image width and
				height. All image http requests to that directory will have the same size. Further
				more you can declare more occurences of the same directory and add a regular
				expression to serve different width and height within that directory. The image
				extension will be detected automatically. Type on the CLI:
				'$ mediamock imgconfig' to see an example of a TOML config.
   --urlPrefix 			Prefix in the URL path
   -i 				Read csv.gz from this input file or input URL.
   --host "127.0.0.1:4711"	IP address or host name
```

```
$ mediamock s -i /tmp/mediamock.csv.gz -urlPrefix media/
```

For detailed statistic about the running mediamock server internals you can visit:

- `http://localhost:4711/` Tiny directory index
- `http://localhost:4711/debug/charts/` Garbage Collection and Memory Usage statistics
- `http://localhost:4711/json` all files as a JSON stream
- `http://localhost:4711/html` all files as a HTML table

![ScreenShot](/wp-content/uploads/mediamock-debug-charts.png)

You can retrieve a list of all served files by navigating to `http://127.0.0.1:4711`.

If an image doesn't exists in the CSV file but is requested from the front end
mediamock will try to generated an appropriate image if it can detect width and height
information within the URL.

E.g.: `http://127.0.0.1:4711/media/catalog/product/cache/2/small_image/218x258/9df78eab33525d08d6e5fb8d27136e95/detail/myImage.jpg`
mediamock can detect that this image is 218px x 258px in size because URL mentions 218x258.

## Install

Download binaries for windows, linux and darwin (OSX) in the [release section](https://github.com/SchumacherFM/mediamock/releases).

If you would like to have binaries for other operating systems please contact me.

## Contribute

`GO15VENDOREXPERIMENT` introduces reproduceable builds. 

```
$ go get -u -v github.com/SchumacherFM/mediamock/...
$ cd $GOPATH/src/github.com/SchumacherFM/mediamock
$ git remote rm origin
$ git remote add origin git@github.com:username/CloneOfMediaMock.git
$ git submodule init
$ git submodule update
hack hack hack ...
$ GO15VENDOREXPERIMENT=1 go run *.go
hack hack hack ...
$ GO15VENDOREXPERIMENT=1 go run *.go
$ gofmt -w *.go common/*.go record/*.go
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

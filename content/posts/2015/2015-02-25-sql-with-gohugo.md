---
title: Built-in SQL support for GoHugo.io
author: Cyrill
date: 2015-03-01
disqus_identifier: /2015/02/25/sqlsupport-gohugo/
categories:
  - Thoughts
tags:
  - GoHugo
  - GoLang
---

With my latest changes [Hugo](http://gohugo.io), the static site generator, 
is now capable to connect to any MSSQL, MySQL, PostgreSQL server and of course
sqlite3 databases.

<!--more-->

## Supported Databases

-  [MySQL](https://github.com/go-sql-driver/mysql/)
-  [Postgres](https://github.com/lib/pq)
-  [MSSQL](https://github.com/denisenkom/go-mssqldb)
-  [Sqlite3](https://github.com/mattn/go-sqlite3)

[Additional drivers](https://github.com/golang/go/wiki/SQLDrivers) may possibly be added in the future.

The default built-in driver is MySQL. Other drivers needs to be compiled by yourself
or I provide binaries in the future. One binary (for OSX 10) with all enabled drivers is available 
[here](https://github.com/SchumacherFM/blog-cs/blob/master/hugo).

To enable all drivers:

```
$ cd $GOPATH/src/github.com/spf13/hugo
$ go build -tags alldb .
```

To enable specific driver/s:

```
$ cd $GOPATH/src/github.com/spf13/hugo
$ go build -tags driverName1 driverName2 driverNameN .
```

Driver name can be: [mssql](https://github.com/SchumacherFM/hugo/blob/dynamicPagesWithGetSql/hugosql/mssql.go#L1),
[postgres](https://github.com/SchumacherFM/hugo/blob/dynamicPagesWithGetSql/hugosql%2Fpostgres.go#L1) or
[sqlite3](https://github.com/SchumacherFM/hugo/blob/dynamicPagesWithGetSql/hugosql%2Fsqlite.go#L1)

Maybe all drivers are included in the future.

## Hugo Configuration

To tell Hugo where to find the database credentials you have two possibilities:

### Via command line argument `--sqlSource`

`--sqlSource` requires the path to the file which contains the data source name (DSN).

```
$ hugo --sqlSource=/path/to/file.txt
```

### Via environment variable `HUGO_SQL_SOURCE`

To [set the variable](http://askubuntu.com/questions/58814/how-do-i-add-environment-variables) 
in e.g. the bash shell you can type:

```
$ export HUGO_SQL_SOURCE='data source name'
```

Env var is the abbreviation for environment variable.

## Data Source Name (DSN) and Driver name configuration

To make Hugo aware of which driver to use you must prepend the driver name at the
beginning of the DSN followed by an underscore character as separator. 
Driver names are always lowercase: `driverName_dataSourceName`. The file extension does not matter.

To see all supported drivers run `$ hugo -h`.

Examples for a file:

```
$ hugo --sqlSource=/path/to/music_collection_dsn.txt
```

Examples for the env var:

```
$ export HUGO_SQL_SOURCE='mysql_dsn...'
$ export HUGO_SQL_SOURCE='mssql_dsn...'
$ export HUGO_SQL_SOURCE='postgres_dsn...'
$ export HUGO_SQL_SOURCE='sqlite3_dsn...'
```

The content of the file or the env var is the data source name as explained 
in the documentation of each driver:

- MySQL [DSN](https://github.com/go-sql-driver/mysql/#dsn-data-source-name)
- Postgres [DSN](http://godoc.org/github.com/lib/pq#hdr-Connection_String_Parameters)
- MSSQL [DSN](https://github.com/denisenkom/go-mssqldb#connection-parameters)
- Sqlite3 [DSN](https://github.com/mattn/go-sqlite3/blob/master/_example/simple/simple.go#L14)

A quick DSN overview for each driver:

- mssql: `server=localhost;user id=sa;password=admin123;port=1411`
- sqlite3: `./path/to/foo.db`
- postgres: `postgres://pqgotest:password@localhost/pqgotest?sslmode=verify-full`
- mysql: `username:passw0rd@tcp(localhost:3306)/databaseName`

```
$ export HUGO_SQL_SOURCE='mysql_username:passw0rd@tcp(localhost:3306)/databaseName'
```

A file contains: `mysql_username:passw0rd@tcp(localhost:3306)/databaseName` for the MySQL driver.

Setting both values `--sqlSource` and the env var `HUGO_SQL_SOURCE` the env var will be applied.

## getSql

`getSql` is the only SQL-able function name which can be called in every template.

`getSql` accepts multiple string arguments and returns an array with all rows from the query.

```
{{ range _, $r := getSql "SELECT * FROM gopher_locations"  }}
    ...
{{end}}
```

If you would like to use a *dynamic* query:

```
{{ $city := "Sydney" }}
{{ range _, $r := getSql "SELECT * FROM gopher_locations WHERE city=\"" $city "\""  }}
    ...
{{end}}
```

**Heads up:** There is no protection from [SQL injections](https://www.owasp.org/index.php/SQL_Injection). 
You cannot have line breaks in the query parts or anywhere else.

If you would like to easily read longer queries you can put that query into a file 
and provide the path to the file as an argument to `getSql`. See the following example. 

File `demo_query.sql` selects data from Magento product flat table using demo data:

```
SELECT
  entity_id,
  name,
  sku,
  url_path,
  price,
  updated_at
FROM `catalog_product_flat_1`
WHERE type_id = "configurable" AND price > 80
```

This advanced `getSql` example of the short code can even sum up the price using 
the [Scratch](http://gohugo.io/extras/scratch/) feature.

```
<table border="1">
  {{ $.Scratch.Set "totalSum" 0 }}
  {{ range $i, $r := getSql $myConfigGlobalPath "demo_query.sql"  }}
    {{ if eq $i 0 }}
      <thead>
        <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Sku</th>
            <th>Price</th>
            <th>Updated</th>
        </tr>
      </thead>
      <tbody>
    {{end}}
    <tr>
        <td>{{ $r.Int "entity_id" | printf "%09d" }}</td>
        <td><a href="/{{ $r.Column "url_path" }}">{{ $r.Column "name" }}</a></td>
        <td>{{ $r.Column "sku" }}</td>
        {{ $p := $r.Float "price" }}
        <td>{{ $p | printf "%.2f" }}€</td>
        {{ $.Scratch.Add "totalSum" $p }}
        <td>{{ $r.DateTime "updated_at" "2006-01-02 15:04:05.999999" | dateFormat "02/Jan/2006" }}
          <br> {{ $r.Column "updated_at" }}
        </td>
    </tr>
  {{ end }}
  </tbody>
  <tfoot>
    <tr>
        <th>&nbsp;</th>
        <th>&nbsp;</th>
        <th>Total:</th>
        <th>{{ $.Scratch.Get "totalSum" }}€</th>
        <th>&nbsp;</th>
    </tr>
  </tfoot>
</table>
```

{{< demoMySql >}}

### Row functions

For each row `$r` you can use additional functions to retrieve the value from a column.

- `$r.Column "columnName"` gets the string value of a column.
- `$r.Columns` returns an array of all column names.
- `$r.JoinValues "Separator" "columnName1" "columnName2" "columnNameN"` joins the value of n-columns together using 
the first argument as a separator. The separator can have nearly any length. If you pass just a `*` as second
argument then all columns will be joined: `$r.JoinValues "Separator" "*"`.
- `$r.JoinColumns "Separator"` joins all column names using a separator.
- `$r.Int "columnName"` gets the integer value of a column. On error returns 0.
- `$r.Float "columnName"` gets the floating point number of a column. On error returns 0.
- `$r.DateTime "columnName" "layout"` parses the column string according to layout into the 
time object. On error returns 0000-00-00. More [info](http://golang.org/pkg/time/#example_Parse).

`$r.Int` and `$r.Float` can be perfectly used in conjunction with [printf](http://golang.org/pkg/fmt/).

To output all columns at once you should use the functions `$r.JoinValues` and `$r.JoinColumns`,
it would look like:

```
<table border="1">
  {{ range $i, $r := getSql "./demo_query.sql"  }}
    {{ if eq $i 0 }}
        <thead>
            <tr>
                <th>{{ $r.JoinColumns "</th><th>" | safeHtml }}</th>
            </tr>
        </thead>
     <tbody>
    {{ end }}
        <tr>
            <td>{{ $r.JoinValues "</td><td>" "*" | safeHtml }}</td>
        </tr>
  {{ end }}
  </tbody>
</table>
```

**Heads up**: You cannot iterate over the `$r` variable.

### Allowed SQL commands

The only possible SQL command is the `SELECT` statement. The validation checks if `SELECT` can 
be recognized at the beginning of each SQL statement. Of course there are workarounds ;-). 

Any questions :-) ? Please use the disqus form below.
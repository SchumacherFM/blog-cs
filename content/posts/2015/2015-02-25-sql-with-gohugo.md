---
title: Build in SQL support for GoHugo.io
author: Cyrill
date: 2015-02-25
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

## Demo Query 

```
<table border="1">
  {{ range $i, $r := getSql "SELECT entity_id,name,sku,url_path,price  FROM `catalog_product_flat_1` where type_id=\"configurable\" and  price > 350" }}

    {{ if eq $i 0 }}
      <thead>
        <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Sku</th>
            <th>Url</th>
        </tr>
      </thead>
    {{else}}
      <tbody>
        <tr>
            <td>{{ $r.FormatInt "entity_id" "%09d" }}</td>
            <td><a href="/{{ index $r "url_path" }}">{{ index $r "name" }}</a></td>
            <td>{{ index $r "sku" }}</td>
            <td>{{ $r.FormatFloat "price" "%.2f" }}€</td>
        </tr>
      </tbody>
    {{end}}

  {{ end }}
</table>
```


{{< demoMySql >}}


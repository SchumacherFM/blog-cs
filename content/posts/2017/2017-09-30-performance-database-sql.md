---
draft: true
title: Performance of Go's database/sql
author: Cyrill
date: 2017-09-30
disqus_identifier: /2017/03/03/mage2.2-dispatched-events/
categories:
  - Thoughts
tags:
  - Magento2
  - Dispatched Events
---

It bugged me

<!--more-->

```sql
CREATE TABLE `core_config_data` (
  `config_id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Config Id',
  `scope` varchar(8) NOT NULL DEFAULT 'default' COMMENT 'Config Scope',
  `scope_id` int(11) NOT NULL DEFAULT '0' COMMENT 'Config Scope Id',
  `path` varchar(255) NOT NULL DEFAULT 'general' COMMENT 'Config Path',
  `value` text COMMENT 'Config Value',
  PRIMARY KEY (`config_id`),
  UNIQUE KEY `CORE_CONFIG_DATA_SCOPE_SCOPE_ID_PATH` (`scope`,`scope_id`,`path`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Config Data';
```

```
// Table `core_config_data` with 2007 rows
// BenchmarkSelect_Integration_LoadStructs-4   	     300	   3995130 ns/op	  839604 B/op	   23915 allocs/op <- Reflection with struct tags
// BenchmarkSelect_Integration_LoadX-4         	     500	   3190194 ns/op	  752296 B/op	   21883 allocs/op <- "No Reflection"
// BenchmarkSelect_Integration_LoadGoSQLDriver-4   	 500	   2975945 ns/op	  738824 B/op	   17859 allocs/op
// BenchmarkSelect_Integration_LoadPubNative-4       500	   2826601 ns/op	  669699 B/op	   11966 allocs/op <- no database/sql
```

I've omitted the case for Reflection without struct tags because it's so worse, AFAIK over 38k allocs.


```go

func BenchmarkSelect_Integration_LoadPubNative(b *testing.B) {
	c, err := mysqldriver.NewConn("magento2", "magento2", "tcp", "localhost:3306", "magento22")
	if err != nil {
		b.Skipf("Skipping because %s", err)
	}

	defer c.Close()

	ctx := context.TODO()

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		ccd := newTableCoreConfigDatas()
		if _, err := ccd.LoadPubNative(ctx, c); err != nil {
			b.Fatalf("%+v", err)
		}
		if len(ccd.Data) != coreConfigDataRowCount {
			b.Fatal("Length mismatch")
		}
	}
}
```
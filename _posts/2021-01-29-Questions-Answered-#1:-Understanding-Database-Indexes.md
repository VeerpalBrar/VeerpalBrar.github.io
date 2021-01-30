---
published: true
layout: post
date: 29 January 2021
tags: ["Database", "Questions Answered"]
---

Questions Answered is a series where I try to learn the answer to a software development questions I have. This month, I tired to answer the question: What is an index and when do you need to create one?

### What is a database index

Consider the user table below. To find all users with the first name Sam, you will have to check each row of the table one by one to see if it matches. While this is not an issue on a small table, your search becomes slower and slower as the table grows.

| Id  | First Name |
| --- | ---------- |
| 1   | Matt       |
| 2   | Zack       |
| 3   | Mia        |
| 4   | Sam        |
| 5   | Emma       |
| 6   | Kate       |
| 7   | Andy       |
| 8   | Nick       |

Searching the first name column would be much faster if it was sorted. Then you could use [binary search](https://www.khanacademy.org/computing/computer-science/algorithms/binary-search/a/binary-search) to find data faster with fewer comparisons.

That is exactly what database indexes do! They store the column values inside a [B-tree](https://cstack.github.io/db_tutorial/parts/part7.html) so that the column can be searched using binary search.

Indexes are created per column, not per table. Each node of the tree stores a value from the column it's sorting, along with a pointer to the rest of the table data. The purpose of the pointer is to let the query return row data without duplicating this data on the index.

For example, an index for the first name column would have the following B-tree index.

![B-Tree Index](/images/tree-index.png)

When a query such as

```
SELECT * FROM users WHERE first_name='Sam';
```

is performed, the database can use the index to find all rows with the first name equal to Sam. Before, we had to check every row in the table, which took linear time. With a balanced B-tree, it's possible to search the tree in logarithmic time. On a table with millions of records, an index can be super helpful in speeding up your queries.

### When should you create an index?

You may want to index every column in your table, however, database indexes have a cost. While searching an indexed column is faster, modifying the table takes longer since you need to update both the table and the index. Furthermore, you have to use disk space to store the index itself. This is why you don't want to create an index for all your fields. Instead, analyze the response time of your queries and only apply indexes when a query is not as fast as you need it to be. In general, create indexes for columns on large tables that appear within the `WHERE` clause of a query. Since these columns are what the table is being filtered by, you want to be able to search them quickly.

Other times when an index is useful is when you have a column with a uniqueness constraint. Every time you add a new value to the column, you need to check that the column does not already contain this value. This is much faster if you index the column to search faster. In fact, in MySQL, when you add a unique constraint to a column it automatically creates a unique index for you.

Likewise, indexing foreign key columns can make managing foreign key relationships easier. An index makes it easier to find the rows referencing the foreign key when data in the foreign key table is updated or deleted.

### Multi-column index

It's also possible to create multi-column indexes. This is helpful when one column is not distinctive enough to sort data. Assume you are looking for a user based on first and last name. If multiple users have the same first name, you'll still have to search rows linearly by the last name to find the user.

In this case, you want to create a multi-column index on `first_name` and `last_name` fields like so:

```
CREATE INDEX test ON users(first_name, last_name);
```

This will create a B-tree that sorts on two values. First, it will sort by the first name, and for rows that have the same first name value, it will sort by the last name. Now, you can find users based on first name and last name, even when multiple users share a first name.

Note that the order of the columns is the exact order used for sorting in the index. For this reason, the order of the columns matters when you create an index.

Furthermore, a multi-column index is not the same as have many single-column indexes. Our multiple-column index is useful for queries containing both columns or only the first name column. It is not useful if you only query the last name. Since you are sorting data by the first name first, it's impossible to leverage the index when searching by last name only. For this reason, you should aim to put the column you query by most often, first.

### References

- [How Indexing Works](https://dataschool.com/sql-optimization/how-indexing-works/) chapter of SQL Optimization from the Data School
- [Chapter 4: Indexes](https://www.oreilly.com/library/view/high-performance-mysql/0596003064/ch04.html) from High Performance MySQL

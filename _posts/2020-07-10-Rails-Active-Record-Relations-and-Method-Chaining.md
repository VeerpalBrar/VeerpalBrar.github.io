---
published: true
layout: post
date: 10 July 2020
tags: ["Ruby on Rails", "Web Development"]
---
The other day, while working on a rails application I wrote the following line of code: 
`Poem.where(...).order("created_at DESC").limit(10)`

Then I had a thought: If the `where` method returns a large collection of poems, will I be loading hundreds of poems in memory when I only need a hundred?  

A quick check on my rails console showed me that this code executes one database query: `SELECT  "poems".* FROM "poems" WHERE (...) ORDER BY created_at DESC LIMIT ?  [["LIMIT", 10]]`

Somehow, the `where`, `order`, and `limit` methods combine into one database query instead of executing one after the other.  In the past, I've taken this functionality for granted without considering how the database queries are executed. However, I decided to finally dig deeper and understand what happens under the hood.  

### Active Record Relations
Methods such as `where`, `order`, and `limit` wait to query the database until the result is required by the application. It might appear as thought the methods return an array of objects. However, if you run the query in the rails console, the result is an `ActiveRecord::Relation` not an array. 

Query methods don't execute requests directly to the database. Instead, they return a Relation object. This allows you to chain multiple query methods together without repeatedly querying the database. When you run `Poem.where(...)`, it returns a Relation. `order` takes the Relation and adds its own criteria to it and returns another Relation.  This Relation is used by the `limit` query, which also returns a Relation. 

The Relation will only execute as a command to the database when you need to know what's inside the Relation. For example, it will not execute a database query if you ask for the class of the result. This is because, the relation does not need the database information to determine the class. In comparison, when you ask for the title of the first poem, it queries the database and returns the result. 

```
> Poem.where(search_query).order("created_at DESC").limit(10).class
=> Poem::ActiveRecord_Relation

> Poem.where(search_query).order("created_at DESC").limit(10).first.title
  Poem Load (0.3ms)  SELECT  "poems".* FROM "poems" WHERE (...) ORDER BY created_at DESC LIMIT ?  [["LIMIT", 10]]
=> "Roses"
```

### Do All Query Methods Return Relations?
No! Query methods that return a collection of objects such as `where` and `group` return an instance of `ActiveRecord::Relation`.  Methods which return a single entity, such as `find` and `first`, will return an instance of the model.

Therefore, it's good to keep in mind which methods return Relations and which return model objects. As well, you need to remember to put query methods that return a single instance at the end of your query since they execute immediately. 

### More Resources
For more information about the internals of Relations and how they are created and executed, I'd highly suggest watching this [Railscast Episode on ActiveRecord::Relation](http://railscasts.com/episodes/239-activerecord-relation-walkthrough?autoplay=true) It's only 11 minutes long and helped clarify my understanding of Active Record Relations

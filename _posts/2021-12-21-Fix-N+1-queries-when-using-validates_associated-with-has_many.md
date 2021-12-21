---
published: true
layout: post
date: 26 November 2021
tags: ["Ruby"]
---

This month, I ran into a interesting `N+1` query problem caused by using `validates_associated` on a `has_many` model.

In ActiveRecord, when validating an object, [`validates_accociated`](https://apidock.com/rails/ActiveRecord/Validations/ClassMethods/validates_associated) validates any associated objects. Assume that an author has many books. Every time the author is validated, `validates_associated` also validates the author's books.

```ruby
class Author < ActiveRecord::Base
 has_many :books
 validates_associated :books
end

class Book < ActiveRecord::Base
 belongs_to :author
 has_one :cover
 validates :title, presence: true
end

a = Author.last
a.name = "New Name"
a.save!
```

You can see the associated object validation in the logs. When saving the author, all the author's books are loaded into memory for validation.

```ruby
TRANSACTION (0.1ms) begin transaction

Book Load (0.3ms) SELECT "books".* FROM "books" WHERE "books"."author_id" = ? [["author_id", 1]]
Author Update (0.4ms) UPDATE "authors" SET "name" = ? WHERE "authors"."id" = ? [["name", "New Name"], ["id", 1]]

TRANSACTION (1.2ms) commit transaction
```

`validates_associated` is a quick way to ensure that active records objects dependent on each other don't become invalid when one of the objects changes. It may seem like a good idea to add this to all your models and always be confident that models are valid.

However, it's important to not overuse this method. Assume that a book has a cover. Every time the book updates, the cover also needs to be validated to ensure the cover has the correct title.

```ruby
class Author < ActiveRecord::Base
 has_many :books
 validates_associated :books
end

class Book < ActiveRecord::Base
 belongs_to :author
 has_one :cover
 validates :title, presence: true
 validates_associated :cover
end

class Cover < ActiveRecord::Base
 belongs_to :book
 validates_presence_of :book

 validate :cover_has_correct_title?
end

a = Author.last
a.name = "New Name"
a.save!
```

When saving the author model, all the author's books are still loaded into memory for validation. All the covers for each book are _also_ loaded into memory one at a time. This uses N+1 queries to fetch all the books and covers from the database.

```ruby
TRANSACTION (0.1ms) begin transaction
Book Load (0.2ms) SELECT "books".* FROM "books" WHERE "books"."author_id" = ? [["author_id", 1]]

Cover Load (0.1ms) SELECT "covers".* FROM "covers" WHERE "covers"."book_id" = ? LIMIT ? [["book_id", 1], ["LIMIT", 1]]
Cover Load (0.1ms) SELECT "covers".* FROM "covers" WHERE "covers"."book_id" = ? LIMIT ? [["book_id", 2], ["LIMIT", 1]]
Cover Load (0.1ms) SELECT "covers".* FROM "covers" WHERE "covers"."book_id" = ? LIMIT ? [["book_id", 3], ["LIMIT", 1]]

Author Update (0.4ms) UPDATE "authors" SET "name" = ? WHERE "authors"."id" = ? [["name", "New Name"], ["id", 1]]

TRANSACTION (1.0ms) commit transaction
```

Book covers need to be validated when a book updates not when the author information changes. Adding `validates_associated` to a model is a simple change with potential performance hits. Now multiple database calls are made whenever an author's information changes.

### Solution 1: Narrow the scope of validation

The first solution I've found to this problem is to narrow the scope of validation. Consider the scenarios where a model can be invalid. Then, set up your validation to only trigger in that scenario instead of trigger on every validation check.

In the author-book-cover example, a cover can be invalid if the title of the book changes. Then, the code should only validate the cover if a book's title has changed. This is possible by using some of the `validates_associated` configuration options.

```ruby
class Book < ActiveRecord::Base
 belongs_to :author
 has_one :cover
 validates :title, presence: true
 validates_associated :cover, if: -> { title_changed? }
end
```

With this approach, `validates_associated` checks if the title has changed. If it has, the associated cover is validated. Otherwise, assume that the cover is still valid from the last time the cover was validated.

Now, if you look at the logs, you can see that the N+1 query does not happen:

```ruby
TRANSACTION (0.1ms) begin transaction
Book Load (0.2ms) SELECT "books".* FROM "books" WHERE "books"."author_id" = ? [["author_id", 1]]

Author Update (0.4ms) UPDATE "authors" SET "name" = ? WHERE "authors"."id" = ? [["name", "New Name"], ["id", 1]]

TRANSACTION (1.7ms) commit transaction
```

By being more fine-grained with your validation, you can ensure you do not trigger unnecessary processing.

### Solution #2

If you need to validate books and covers every time an author updates, then avoid using `validate_associated`. Instead, have the author load both books and covers before running the validation.

```ruby
class Author < ActiveRecord::Base
 has_many :books
 validate :books_are_valid

 def books_are_valid
 books.preload(:cover).all?(&:valid?)
 end
end

class Book < ActiveRecord::Base
 belongs_to :author
 has_one :cover
 validates :title, presence: true
 validates_associated :cover
end

a = Author.last
a.name = "New Name"
a.save!
```

`preload` loads all the covers for all the author's books in one database query. This avoids the N+1 query problem caused by loading the covers for each book one at a time.

```ruby
TRANSACTION (0.0ms) begin transaction

Book Load (0.1ms) SELECT "books".* FROM "books" WHERE "books"."author_id" = ? [["author_id", 1]]
Cover Load (0.2ms) SELECT "covers".* FROM "covers" WHERE "covers"."book_id" IN (?, ?, ?) [["book_id", 1], ["book_id", 2], ["book_id", 3]]

Author Update (0.4ms) UPDATE "authors" SET "name" = ? WHERE "authors"."id" = ? [["name", "New Name"], ["id", 1]]

TRANSACTION (0.9ms) commit transaction
```

The downside to this approach is that the Author model is aware of the relationship between books and covers, coupling the three models together. That may be a trade-off you are willing to make to avoid calling the database more than necessary.

### In conclusion

In conclusion, Rails has a lot of "magic" methods that can make it easy to add new functionality. However, it can sometimes come with unintended consequences in practice such as N+1 queries.

Sometimes extra validation makes you feel safer but it could be slowing down your code if you are not careful. Thus, it is better to add as much validation as you need and nothing more.

#### Code

If you want to view and run the code mentioned in the blog post, you can see the source code in this [github gist](https://gist.github.com/VeerpalBrar/2fc3ec1913cabadcaeaec44c96223a40).

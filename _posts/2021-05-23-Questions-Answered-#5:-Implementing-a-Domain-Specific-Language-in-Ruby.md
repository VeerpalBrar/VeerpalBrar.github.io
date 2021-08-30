---
published: true
layout: post
date: 23 May 2021
tags: ["Ruby", "Metaprogramming", "Dev Journal"]
---

Over the last few months, I've been reading about metaprogramming in Ruby and how it works. This month, I wanted to apply what I've learned and create a domain specific language (DSL) in Ruby.

### What is a Domain Specific Language

Domain specific languages are computer languages that focus on a particular domain as opposed to general programming concepts. For example, RSpec provides a domain language for testing code with methods such as `expect`, `describe`, and `context`. These are not built-in ruby methods but methods RSpec uses to express the domain of testing.

There are two types of DSLs: external and internal. External DSLs have a parser separate from the language that parses the language. Programs written in the DSL, get parsed and executed by a separate program. This can be time-consuming to create since you need to validate the syntax of the program along with implementing the logic of the DSL.

Internal DSLs take an existing language, such as Ruby, and implement an API to create the DSL. For example, RSpec is a DSL that's implemented in ruby. You can use RSpec syntax to test your code, but under the hood, you are still running ruby code.

### JSON Parser

In this blog, I'll walk through how I created an internal DSL that parses JSON responses from an API.

The first aspect of creating a DSL is figuring out the syntax. For my JSON parser, I'm using the following format.

```
url = "https://swapi.dev/api/starships/"

JsonParser.fetch(url) do
  get "results"
  where "passengers", :==, "0"
  where "cargo_capacity", :>, "110"
  get "name"
end
```

This allows the user to reference the URL they would like to fetch and indicate which fields to retrieve from the response. They can `get` the value for a particular field. If a field is a list of values, they can use `where` to filter with items from the list to retrieve.

In the example above, I first select the results field. Then I filter on starships that have zero passengers and a cargo capacity greater than 110. Finally, I get the name of each starship that matches these requirements.

The benefit of ruby is that it's possible to write code that reads like English. Yet someone familiar with ruby code would know three methods are being used here: `fetch`, `get`, and `where`.

If I were to implement this JSON parser in ruby, the code would look like this.

```
class JsonParser
  attr_reader :data
  def self.fetch(url)
    uri = URI(url)
    response = Net::HTTP.get(uri)
    self.new(response)
  end

  def initialize(data)
    @data = Response.new(JSON.parse(data))
  end

  def get(key)
    @data = @data.get(key)
  end

  def where(key, method, value)
    @data = @data.where(key, method, value)
  end
end

class HashResponse
  attr_reader :response

  def initialize(response)
    @response = response
  end

  def where(key, method, value)
    result = response[key].send(method, value)

    Response.new(result)
  end

  def get(key)
    Response.new(response[key])
  end
end
```

I chose to separate the response filtering into a `Response` class. This makes the separation of responsibilities cleaner. The `Response` class will handle implementing the `get` and `where` methods. `JsonParser` builds the overall response that is returned to the user. This is done by overriding the `@data` variable whenever `get` or `where` is called. This way, we're always filtering on the most recent result instead of the API response as a whole.

#### What is send?

The most complicated line is `response[key].send(method, value)`. [`send`](https://apidock.com/ruby/Object/send) allows you to invoke a method on an object instance by the method name. In our code, `where` has a parameter called `method` which is a method name (ie `:<=`, `:>=`, `:==`) in symbol format. `where` will call the method on the `response[key]` object with `value` as an argument. For example, if we call `where "passengers", :==, "0"`, we're checking if `response["passengers"] == "0"`. In other words, we're sending the `==` method to the `response["passengers"]` string object.

The `JsonParser` code can be run as followed:

```
parser = JsonParser.fetch(url)
parser.get "results"
parser.where "passengers", :==, "0"
parser.where "cargo_capacity", :>, "110"
parser.get "name"

puts parser.data.response # final result
```

The next step is passing the `get` and `where` filters in a block passed to fetch so that we don't need to store the parser in a variable.

#### Using `instance_eval`

After adding the block to our parser, our code would look like this:

```
class JsonParser

  def self.fetch(url, &block)
    uri = URI(url)
    response = Net::HTTP.get(uri)
    self.new(response).query(&block)
  end

  def initialize(data)
    @data = Response.create(JSON.parse(data))
  end

  def query(&block)
    instance_eval(&block)
    pp @data.response
  end

  def get(key)
    @data = @data.get(key)
  end

  def where(key, method, value)
    @data = @data.where(key, method, value)
  end
end
```

The main change is the new `query` method which takes the block passed to `fetch` and then runs it using `instance_eval`. [`instance_eval`](https://apidock.com/ruby/Object/instance_eval) takes a block and executes it in the scope of the receiver object instead of the scope the block was created in. So in this case, it evaluates the block in the scope of the `JsonParser` class. So when we call `get` and `where` in the block, it calls the `get` and `where` instance methods of the `JsonParser` class.

We call `pp @data.response` to print the final result after the block executes instead of requiring the caller to access `data`.

> pp is short for "pretty print". You can use this method to print hashes in an easy-to-read format.

Now, our DSL is finished and we can run the code like so:

```
JsonParser.fetch(url) do
  get "results"
  where "passengers", :==, "0"
  where "cargo_capacity", :>, "110"
  get "name"
end
```

### Considerations

By leveraging methods such as `send` and `instance_eval`, creating a DSL in Ruby can be easy. One thing to watch out for is error handling. If the user uses incorrect syntax or calls methods that don't exist, they will get an error message such as "MethodNotFound". This may be confusing for non-programmers who won't know that the DSL is written in ruby. You can add error handling for common errors and provide descriptive error messages. One way to do this would be to override `method_missing`.

The other thing to watch out for is that `instance_eval` allows someone to run arbitrary ruby code from within your DSL. This could be used for malicious purposes. Thus it's important to add security checks when being used by external users.

### Code

You can view the entire [source code for the DSL](https://github.com/VeerpalBrar/JSONParserDSL) on my Github.

### Resources

- [Chapter 16 of Design patterns in Ruby](https://www.oreilly.com/library/view/design-patterns-in/9780321490452/ch16.html)
- [Understanding Ruby Metaprogramming and DSLs](https://www.admios.com/blog/understanding-ruby-metaprogramming-and-dsls)
- [Building DSL with Ruby](https://longliveruby.com/articles/building-dsl-with-ruby)

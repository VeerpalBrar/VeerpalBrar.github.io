---
published: true
layout: post
date: 02 February 2021
tags: ["Ruby", "Questions Answered"]
---

Questions Answered is a series where I try to learn the answer to a software development questions I have. This month I tried to understand how closures work in ruby.

Closures are a concept I learned about in school but I never fully wrapped my head around. Even the definition from the [Wikipedia page](<https://en.wikipedia.org/wiki/Closure_(computer_programming)>) sounds theoretical and hard to understand:

> a **closure**, [...] is a technique for implementing [lexically scoped](https://en.wikipedia.org/wiki/Lexically_scoped "Lexically scoped") [name binding](https://en.wikipedia.org/wiki/Name_binding "Name binding") in a language with [first-class functions](https://en.wikipedia.org/wiki/First-class_function "First-class function"). [Operationally](https://en.wikipedia.org/wiki/Operational_semantics "Operational semantics"), a closure is a [record](<https://en.wikipedia.org/wiki/Record_(computer_science)> "Record (computer science)") storing a [function](<https://en.wikipedia.org/wiki/Function_(computer_science)> "Function (computer science)")[\[a\]](<https://en.wikipedia.org/wiki/Closure_(computer_programming)#cite_note-1>) together with an environment.[\[1\]](<https://en.wikipedia.org/wiki/Closure_(computer_programming)#cite_note-2>)

In this blog post, I explain how closures work in ruby by breaking down the Wikipedia definition of a closure.

### First Class Functions

The definition states that closures are used in languages with first-class functions. A language has first-class functions if it's possible to:
a) pass functions as arguments to other functions
b) return a function from another function
c) assign functions to variables

If you have used Ruby before, you'll know that ruby does not use functions in this way. For example, if you pass a function to another method, it tries to evaluate the function instead of passing the function as a reference.

```
def foo(func)
 func()
end

def hello
 "hello"
end

foo(hello) # returns an error
```

So, how does ruby allow programmers to use closures? Well, that's where Procs (and blocks) come in.

#### What are Blocks?

You've used blocks before in ruby if you've written code such as:

```
arr = [1, 2, 3]

arr.map {|num| num * 2}

# alternative
arr.map do |num|
 num * 2
end
```

The block is the code inside the curly braces or inside the `do / end` statement. Unlike a method, a block is not evaluated the moment it's passed as an argument to a function. Instead, it's up to the receiving method to run the code inside of the block using the `yield` keyword.

```
def foo
 puts "inside foo"
 yield "hello"
 end

 foo {|message| puts "inside block with message #{message}" }

# output:
# inside foo
# inside block with message hello
```

> Aside: You may be wondering how `foo` was able to `yield` to the block without taking a parameter. Well, in ruby, all methods implicitly take a block argument that they can call with yield.

Blocks are pieces of code that can be passed to a function to be executed at a later time. Blocks allow us to pass functions to other methods, which is the first requirement for a first-class function. However, you can't save a block to a variable or be returned by a method, so they don't count as first-class functions. This is where Proc's come in!

#### What are Procs?

Proc's are like blocks except they are considered objects and can be assigned to variables. The example above can be re-created with Procs like so:

```
def foo(my_proc)
 puts "inside foo"
 my_proc.call "hello"
 end

a_proc = Proc.new {|message| puts "inside proc with message #{message}" }

foo(a_proc)

# output:
# inside foo
# inside proc with message hello
```

Since proc's are objects, it's also possible to return a proc from a function.

```
def get_proc
 Proc.new { puts "I'm a proc!" }
end

a_proc = get_proc

a_proc.call # I'm a proc!
```

With procs, we have an object that can act as a "first-class function" within ruby. A proc can be assigned to a variable, passed to other functions, and returned from a function.

Now that we understand how ruby implements a "first-class function", we can move on to understanding the "lexically scoped" part of the closure definition.

### What is lexical scope?

The scope of a variable refers to all the parts of the code where the variable is "available". Meaning, where you can reference a variable and not cause an "undefined variable" error. There are different ways to determine scope but we'll look at lexical scope.

Lexical scope uses the source code to determine the scope of a variable. You can determine the scope of a variable by reading the code without running it.

In ruby, a variable is available or 'in scope' within the method/class it is defined in. Since you can understand the start and end of a method/class by reading the code, it's possible to understand the scope of a variable by looking at the code. For this reason, Ruby is a lexically scoped language.

If you are not within the same scope as where the variable is defined, you can not reference the variable. Consider the following example:

```
def foo
 a = "hello"
end

puts a #undefined local variable or method `a'
```

The variable `a` is defined within method `foo` and is not accessible outside of this method. Therefore, we can say that the scope of `a` is within the `foo` method. A similar logic is applied to accessing variables inside classes or files.

This raises an interesting question for first-class functions. First-class functions may reference variables within their scope when they are defined. For example, here the proc references the count variable:

```
def foo
  count = 3
  Proc.new {|num| num + count}
end
```

This is allowed because the proc and `count` have the same scope. However, what happens if someone calls `foo` and then tries to call the Proc? The `count` variable is no longer in scope so how will it be added to the `num` arg?

If you can only call first-class functions within the scope they are defined, you lose the ability to delay code execution. Closures are how we solve this problem.

### What is a Closure?

Closures are how you implement lexical scoping even with first-class functions. You can create a first-class function which references variables in its scope and have it retain access to these variables even if it's called in a different scope.

Let's see this in action with proc's in ruby.

```
def foo(a_proc)
 a_proc.call(23)
 puts one
end

one = 1
my_proc = Proc.new { |num| puts num + one }

foo(my_proc)

# output
# 24
# NameError (undefined local variable or method `one' for main:Object)
```

In this example, when `my_proc` is called it's able to access `one`, add it to the `num` param, and print `24`. Yet, when `foo` tries to access `one`, it causes an error. This is because `my_proc` is defined in the same scope as `one` and so it's able to reference `one` even within `foo`. Outside of the proc, we don't have access to `one` within `foo`.

To implement lexical scope, a proc carries a reference to all the local variables and methods available within its scope. That way, no matter which scope it's called in, it can reference these variables correctly. This process of carrying both the code needed to execute and a reference to the scope it was created in is, is called a **closure**.

Closures also have some interesting properties as a side effect in ruby. If you modify a variable within a proc, you are modifying the actual variable not just a copy. That makes code like the following possible:

```
def foo(a_proc)
 count = 3
 a_proc.call(5)
 puts "count inside foo: #{count}"
end

count = 1
puts "count before foo is called: #{count}"

add_to_count = Proc.new { |num| count += num }

foo(add_to_count)
puts "count after foo is called: #{count}"

# output:
count before foo is called: 1
count inside foo: 3
count after foo is called: 6
```

When you call `my_proc` it modifies the `count` variable on line 6, not the count variable defined in `foo`. Defining a `count` variable within foo does not override the reference to `count` stored within the proc! This is because `my_proc` is not defined within `foo` so it doesn't have access to any variables within `foo` itself unless they are passed as a parameter. `my_proc` only has access to the variables defined in the same scope as it.

### Conclusion

If we go back to the original Wikipedia definition we can see that it's making two points.

1. A closure is how you can implement lexical scope with first-class functions.
2. To create a closure we have the first-class function carry the context of their scope with them.

Closures can seem complicated until you break down the definition and see them in action. I did a lot of reading for this blog post but what helped solidify closures was writing code and trying to guess what the output would be. It helped me determine the gaps in my understanding.

### References

- [Closures in Ruby](https://www.sitepoint.com/closures-ruby/)
- [Ruby Closures 101](https://medium.com/swlh/ruby-closures-101-e130d62b7fa0)
- [The Ultimate Guide to Blocks, Procs & Lambdas](https://www.rubyguides.com/2016/02/ruby-procs-and-lambdas/)
- [Closures](<https://en.wikipedia.org/wiki/Closure_(computer_programming)>)
- [Lexical Scope](<https://en.wikipedia.org/wiki/Scope_(computer_science)#Lexical_scope_vs._dynamic_scope>)

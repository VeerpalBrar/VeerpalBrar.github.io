---
published: true
layout: post
date: 25 April 2021
tags: ["Ruby", "Metaprogramming"]
---

In my last blog post on [Structs and OpenStructs](/blog/2021/03/26/Questions-Answered-3-Struct-and-OpenStruct), I referenced how OpenStruct uses `define_singleton_method` to add methods to a single instance of OpenStruct during run time. In this blog post, I want to dig deeper into the mechanics of the ruby that make this possible.

### Objects, Everywhere!

You may have heard that everything in ruby is an object. This means that even classes themselves are objects! When you create a new class, you are creating a `Class` object.

The consequence of this is that you can now modify this class object to add new methods to the class during runtime.

For example, the following is valid code in ruby:

```ruby
class D
  def x
   "x"
  end
end

obj = D.new

obj.x  # => "x"


class D
  def y
    "y"
  end
end

obj.y  # => "y"
```

This code is not creating two classes called `D`. But rather, the second time you call `class D`, ruby sees that there is already a class object with the name `D`. Instead of creating a new class, it simply modifies the existing class to also have the method `y`.

This is why when you create an instance of the class `D` it has access to both methods `x` and `y` even though the methods were not created at the same time.

You may be wondering - if we modify the class `D` after `obj` is created, why does `obj` have access to the method `y`. In ruby, methods are stored on the Class object, not the class instances themselves. In the example above, the list of methods `obj` responds to is stored in the `D` class object, not on `obj` itself. Therefore, when a new method is added to the class `D` it's immediately available to all instances of `D` as well.

That's why it's possible to write code that creates new methods during runtime. Ruby is modifying the class Objects to add new methods to the class.

But wait! OpenStruct only creates a method for a particular instance of OpenStruct, not all OpenStruct instances! Well, that's possible because of another ruby feature - singleton classes.

### Singleton Classes

All instances of a class have a hidden class, which belongs only to that instance. It's called singleton class. Singleton classes are only ever able to have one instance objected created.

Referencing our example from before, when you run `obj = D.new` you create an instance of the `D` class, but you also create a singleton class for `obj`. The singleton class is usually hidden from you when you look up the ancestors for `obj` but you can access the singleton class by doing: `obj.singleton_class`.

In ruby, two instances of the 'D' class will have the same class but different singleton classes. The purpose of this hidden singleton class is to hold an object's singleton methods. Remember when I said that the methods for an object are stored in its class? Well, if you want to create methods that only one instance of a class can respond to, you would add these methods to the instance objects singleton class. Since no two objects have the same singleton class, when you add a method to an object's singleton class, only that object will be able to respond to that method.

Therefore, when you call `define_singleton_method` you are creating a method on the object's singleton class rather than its class.

```ruby
class D
  def x
   "x"
  end
end

obj1 = D.new
obj2 = D.newz

obj1.define_singleton_method(:a) do
  "a"
end

obj1.a #a

obj2.a # undefined method `a'

```

When you call a method on an object, it first looks to see if the method is defined on the object's singleton class. If not, it checks to see if the method is defined on an object's class, and so on, up its ancestor chain.

### In conclusion

When you create an instance of OpenStruct, it uses `define_singleton_methods` to add methods to the instances singleton class. That how an OpenStruct can create new methods for an instance during runtime without affecting other instances of OpenStruct.

References:

- [Unraveling Classes, Instances and Metaclasses in Ruby](https://blog.appsignal.com/2019/02/05/ruby-magic-classes-instances-and-metaclasses.html)

- [Ruby Metaprogramming Is Even Cooler Than It Sounds](https://www.toptal.com/ruby/ruby-metaprogramming-cooler-than-it-sounds)

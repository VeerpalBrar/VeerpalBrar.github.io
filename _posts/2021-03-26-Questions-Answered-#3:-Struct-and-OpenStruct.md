---
published: true
layout: post
date: 26 March 2021
tags: ["Ruby"]
---

This month I explore what Structs and OpenStructs are and how they compare with classes and hashes.

### Why do I care about Struct /OpenStruct

Structs/OpenStructs are data containers you can use to bundle a set of values together in an object. Once you create a Struct/OpenStruct, you can access the attributes as a method.

```ruby
Person = Struct.new(:name, :age)
john  = Person.new "john", 30
john.name

jane = OpenStruct.new({name: "Jane", age:"30"})
jane.name

```

Struct/OpenStructs share some similarities with hashes and classes but have their own benefits.

### What is a Struct

Structs are a part of the core Ruby programming language and are a shortcut for creating a class.

```ruby
Person = Struct.new(:name, :age)
john  = Person.new "john", 30
```

When you call `Struct.new`, you create an anonymous class, which has attributes corresponding to the symbols passed to the instructor. The Struct class above is similar to doing the following in a class.

```
class Person
 attr_accessor :name
 attr_accessor :age

 def initialize(name, age)
     @name = name
     @age = age
 end
end
```

Essentially, you create an anonymous class that has a set of variables already defined.
You may be wondering why you can call `Person.new` in the example. When you assign an anonymous class to a variable, then the name of the class is set to the variable name. In the example, the name of the anonymous class is set to `Person`. After that, you can initialize new instances of this anonymous class by calling `Person.new`.

##### Why not use a class?

Creating a class using a struct will give you some different functionality out of the box compared to creating a plain ruby class.

For one, a struct inherits from [Enumerable](https://ruby-doc.org/core-3.0.0/Enumerable.html). This means a struct will respond to methods such as `any?`, `find`, `filter`, `map` which iterate over the attributes of the struct. If you wanted similar functionality with a class, you would have to implement it yourself.

Another difference between a struct and a class is that equality is based on the value of the attributes, not the object id. Normally, if you create two objects of the same class, you look at the object id to determine if two objects are equal. However, with structs, by default equality will depend on the attributes.

```
john  = Person.new "john", 30
john2  = Person.new "john", 30
john == john2 // true
```

However, equality depends on the Structs being instances of the same anonymous class.

```
P1 = Struct.new(:name)
P2 = Struct.new(:name)

P1.new("John") == P2.new("John") // false
```

Even though `P1` and `P2` have the same attributes, they are different classes under the hood. This is why `P1` and `P2` are not equal.

If having equality based on attributes or being able to iterate over attributes is useful, then this is a sign to use Struct over a class.

### What is an OpenStruct

Unlike, Struct, OpenStruct is not a part of the core Ruby language. To use OpenStruct, you have to call `require 'ostruct'`

An OpenStruct is essentially a fancy wrapper around a hash.
You create an OpenStruct by passing it a hash and then you can access the attributes of the hash as methods.

```
jane = OpenStruct.new({name: "Jane", age:"30"})
jane.age // 30
```

Unlike a Struct, where attributes are fixed at initialization, you can add new attributes to the OpenStruct after initialization.

```
jane.last_name = "Doe"
```

> 💡 This actually creates a new `last_name` method on the open struct instance by using `define_singleton_method`. `define_singleton_method` allows you to create a new method for an object without adding this method to other instances of the same class. In this case, the `last_name` method is added to the `jane` object without adding it to all instances of `OpenStruct`

Furthermore, if you try to access an attribute that doesn't exist on a Struct, you will get a method not defined error. However, for OpenStruct, this will not cause an error but rather return `nill`.

```
jane.address // nil
```

> 💡 Aside: OpenStruct uses `method_missing` to catch all method calls for attributes that do not exist on the object. This allows it to return `nil` instead of throwing an error.

Finally, two OpenStructs are considered equal if the underlying hashes are the same.

##### Why not use a hash?

Hashes also allow you to define new key/value pairs after initialization and access keys that do not exist on the hash. If an OpenStruct uses hashes under the hood and behaves similarly to a hash, why not use a hash?

Well, even though an OpenStruct is implemented using a hash, it is not a hash! You don't have access to methods such as `length`, `compact` etc that you have for a hash. Use OpenStruct when you need a simple object that responds to a set of methods. For example, if you need to pass it as a param to a method that expects an object and not a hash.

Furthermore, [OpenStructs are very slow](https://palexander.posthaven.com/ruby-data-object-comparison-or-why-you-should-never-ever-use-openstruct). They are almost 3 times slower than Structs. For this reason, if performance is a huge concern, you'll want to use a struct or a hash.

### Conclusion

The purpose of learning about Structs and OpenStructs was to learn more about how to handle data in ruby. While you may not be using Structs all the time in my day-to-day coding, it's good to know what options are available to you so that you know you are picking the best tool for the job.

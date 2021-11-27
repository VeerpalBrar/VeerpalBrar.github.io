---
published: true
layout: post
date: 26 November 2021
tags: ["Ruby"]
---

This month, I took the time to go back to basics and try to understand how `include`, `extend` and `prepend` work in ruby.

### Modules

Ruby uses modules to share behaviour across classes. A module will contain all the logic for the desired behaviour. Any class which would like to use the same behaviour, can either `include` or `extend` the module.

What is the difference between `include` and `extend`? When a class `include`'s a module, it adds the module methods as _instance methods_ on the class.

When a class `extend`'s a module, it adds the module methods as _class methods_ on the class.

```ruby
module A
 def hello
 "world"
 end
end

class Foo
 include A
end

class Bar
 extend A
end

Foo.new.hello #works
Foo.hello #error

Bar.new.hello #error
Bar.hello #works
```

If it makes sense for an instance of a class to implement the behaviour, then you would include the module. Then each instance has access to the module methods.

If the behaviour is not tied to a particular instance, then you can extend the module. Then the methods will be available as class methods.

### self.included

What if you want some methods to be instance methods and others to be class methods? A common way to implement this is to use the `self.included` callback. Whenever a class includes a module, it runs the `self.included` callback on the module. We can add the logic for extending another module on the class inside of the `self.included` method.

To do this, we create a nested module that contains the class methods. The self.included callback will extend the nested module on every class that includes the main module. Then the class will have access to the nested module's methods as class methods.

```ruby
module A
 def self.included(base)
 base.extend(ClassMethods)
 end

 def hello
 "world"
 end

 module ClassMethods
 def hi
 "bye"
 end
 end
end

class Foo
 include A
end

Foo.new.hello #works
Foo.hello #error

Foo.new.hi #error
Foo.hi #works
```

Using `self.included`, lets us provide both instance and class methods when the module is included.

Note that this approach only works with the module that is included in a class. If we were to `extend` the module in this example, then Foo would have `hello` as a class method but not `hi`.

```ruby
module A
 def self.included(base)
 base.extend(ClassMethods)
 end

 def hello
 "world"
 end

 module ClassMethods
 def hi
 "bye"
 end
 end
end

class Foo
 extend A
end

Foo.new.hello #error
Foo.hello #works

Foo.new.hi #error
Foo.hi #error
```

#### Ancestor chain

So what's actually happening when you include or extend a module?
When you include a module, you add it to the ancestor chain of the class.
The ancestor chain is the order of lookup Ruby follows when determining if a method is defined on an object. When you call a method on a class, ruby will check to see if the method is defined on the first item in the ancestor chain (the class). If it is not, it will check the next item in the ancestor chain and so on.

```ruby
module A
 def hello
 "world"
 end
end

class Foo
 include A
end

Foo.ancestors # [Foo, A, Object, Kernel, BasicObject]
```

Similarly, if you extend a module, you add the module to the ancestor list of the singleton class. If you're unfamiliar with singleton classes, I mention them in [[Ruby Object Blog Post]]. The main idea is that every object has a hidden singleton class which stores methods **implemented only on that object**. A class object also has a singleton class that stores methods implemented on that class ie class methods.

When calling a class method, ruby will look at the singleton classes ancestor chain to see where the class method is defined. Since class methods get defined on the singleton class, extending a module adds it to the **singleton class's** ancestor chain.

```ruby
module A
 def hello
 "world"
 end
end

class Bar
 extend A
end

Bar.ancestors # [Bar, Object, Kernel, BasicObject]
Bar.singleton_class.ancestors # [#<Class:Bar>, A, #<Class:Object>, #<Class:BasicObject>, Class, Module, Object, Kernel, BasicObject]
```

### Prepend

Prepend is like `include` in its functionality. The only difference is where in the ancestor chain the module is added. With `include`, the module is added **after** the class in the ancestor chain. With prepend, the module is added **before** the class in the ancestor chain. This means ruby will look at the module to see if an instance method is defined before checking if it is defined in the class.

This is useful if you want to wrap some logic around your methods.

```ruby
Module A
 def hello
 put "Log hello in module"
 super
 end
end

class Foo
 include A

 def hello
 "World"
 end
end

Foo.new.hello
# log hello from module
# World
```

### Resources

- [Ruby modules: Include vs Prepend vs Extend](https://medium.com/@leo_hetsch/ruby-modules-include-vs-prepend-vs-extend-f09837a5b073)
- [Ruby mixins: extend and include](https://stackoverflow.com/questions/17552915/ruby-mixins-extend-and-include)
- [Include vs extend in ruby](http://www.railstips.org/blog/archives/2009/05/15/include-vs-extend-in-ruby/)

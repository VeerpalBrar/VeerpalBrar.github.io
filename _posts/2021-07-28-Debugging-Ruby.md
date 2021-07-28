---
published: true
layout: post
date: 28 July 2021
tags: ["Ruby", "Debugging"]
---

This month I looked into debugging ruby code. While I usually can figure out the source of bugs, I've been thinking about how to debug code more efficiently. When I debug in ruby, I tend to rely on printing variables to the terminal. If the code is more complex, I step through the code with `byebug` or `binding.pry`. During this past month, I've been learning techniques that let me level up these skills.

### Navigating code

I learned a few techniques to navigate the codebase faster and level up both printing and `byebug` based debugging.

#### Printing methods

One technique that I already used but is still worth mentioning is to use `p` instead of `puts`. `puts` calls `to_s` on the object, which by default is the object class and `id`. You can override the `to_s` class to return detailed information about the object. The other option is to use `p`, which calls `.inspect` on the object. By default, inspect returns a string with the class, object_id, and instance variables. The output of `p` can be difficult to parse if an object has many instance variables. In this case, you can use `pp`, which stands for pretty print, and makes the output easier to read. `pp` is also helps to format hashes and JSON objects.

#### Raising errors

Sometimes it can be difficult to find the print statements in the server logs. One option is to prepend print statements with strings like "!!!" and search for them on the server output. Another technique is to raise an exception immediately after the print statements. Then you can find the code faster as you know it happens right before the exception. Raising errors is useful if that section of code runs many times. You can use conditional logic to raise an error in the cases you want to investigate.

#### Freezing

If you want to know when an object is modified, you can `freeze` it. Then whenever the object is modified, it will raise an exception. Freezing an object is a faster way to figure out which classes are modifying it.

### Leveraging Ruby

Methods such as `inspect` and `pp` are useful but don't always appear in beginner ruby tutorials. I've found that learning more about ruby has given me new tools for debugging Ruby code. There are many methods in ruby that are there to make it easier for developers to work with ruby.

#### Objects

For example, if you have a method that takes an input ( `input_obj`) but it's not clear what type of input it is. Normally, I would search the code base for all the locations that this method is invoked. In the calling method, you can figure out what is passed in as the input. A faster way to figure this out would be to run the code and do `p input_obj.class.name`. That way, you know the exact class of the input. Everything in ruby is an object and inherits from the [`Object` class](https://ruby-doc.org/core-3.0.2/Object.html) class. It has methods such as `methods`, `instance_variables`, `responds_to?` that you can use to learn more about method inputs. Granted, you can figure out a lot of this information with `inspect`.

The Object class also mixes the [Kernel module, which has a `caller`](https://ruby-doc.org/core-3.0.2/Kernel.html#method-i-caller) method. You can use `caller` to get the calling stack for an object. `caller` is a faster way to figure out who is calling a method instead of searching through the entire code base.

#### Method

In ruby, even [methods](https://ruby-doc.org/core-3.0.2/Method.html#method-i-source_location) are objects! You can determine where a method is implemented by calling `source_location` on the method:

`ClassName.instance_method(:method_name).source_location`

Using `source_location` is especially useful when the method name is common and is harder to search for in the code. If a method calls `super`, you can use `super_method` to get the `Method` object for the super method:
`ClassName.instance_method(:method_name).super_method`

#### Inheritance Hierarchy

Sometimes, the source of bugs is due to objects extending many modules that change their behavior in unexpected ways. You can track when a module is added to an object with [`included`](https://ruby-doc.org/core-2.5.0/Module.html#method-i-included). You can overwrite `included` to print information when a module is included on an object. Use [`method_added`](https://ruby-doc.org/core-2.5.0/Module.html#method-i-method_added) to track when an instance method is added to a module. These methods help track down bugs related to metaprogramming.

#### Tracepoint

[`Tracepoint`](https://ruby-doc.org/core-2.5.0/TracePoint.html) allows you to trace the call stack for a piece of code. To see all the methods called while a code block run, you could trace the call stack with Tracepoint:

```
trace = TracePoint.new(:call) do |tp|
 p[tp.path, tp.lineno, tp.defined_class, tp.method_id]
end

trace.enable
User.some_method
trace.disable
```

After you create a new tracepoint, you must enable it. When enabled, a tracepoint object will log all the methods calls until the trace is disabled. When you initialize a new tracepoint, it takes a block executes for each method call. The example above prints the file the method is located in (`tp.path`), the line number `tp.lineno`, the class `tp.defined_class`, and the method `tp.method_id`.

The logging for Tracepoint is quite verbose as it will also output the method calls for code in gems. Thus, Tracepoint is more useful for getting the general execution path for the code.

To reduce the output, you can use conditionals to only print in certain cases:

```
TracePoint.trace(:call) do |tp|
 next unless tp.self.is_a?(User) # only print method calls for Users
 # tracing logic
end
```

That way, you can see how the execution path for a particular object to see how it is used.

Tracepoint's code is also less intuitive to write. Rather than memorizing the code, I'd save it in a snippet and copy it whenever I want to use it.

### Reading gem source code

Sometimes, the code I'm interested in exists in a gem instead of the application code. Understanding gem code usually requires reading the gem documentation to figure out how the code work. If you can not find the information in the docs, you would have to read the source code. I can read the code on Github, but this can be tedious to navigate and search. Instead, you can do `bundle open <gem_name>` to open the code for the gem in a text editor. It will open the version specified in the nearest Gemfile. That way, you can use your IDE to search and navigate the gem code. In your application code, you can use `source_location` to find the location of a method defined in a gem! You can also use print statements and `byebug` to debug the gem source code if needed. When you finish debugging, use `gem pristine <gem_name>` to clean up any changes.

### Conclusion

Debugging ruby goes beyond the use of print statements to trace code execution. There is a lot of built-in ruby functionality which can help you more effectively debug your code. As I dig deeper into ruby, I now consider how I can leverage what I learn to debug code.

### Sources

- [Debugging Libraries: Ruby Edition](https://maximomussini.com/posts/debugging-ruby-libraries/)
- [I am a puts debugger](https://tenderlovemaking.com/2016/02/05/i-am-a-puts-debuggerer.html)
- [Ruby debugging magic cheat sheet](https://www.schneems.com/2016/01/25/ruby-debugging-magic-cheat-sheet.html)
- [Changing the Approach to Debugging in Ruby with TracePoint](https://blog.appsignal.com/2020/04/01/changing-the-approach-to-debugging-in-ruby-with-tracepoint.html)
- [How To Spy on Your Ruby Methods](https://www.rubyguides.com/2017/01/spy-on-your-ruby-methods/)

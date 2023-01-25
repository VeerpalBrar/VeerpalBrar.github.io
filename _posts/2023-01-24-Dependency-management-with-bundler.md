---
published: true
layout: post
date: 24 January 2023
tags: ["Ruby"]
---

The `venv` module in python isolates packages of one python project from another project. I remember trying to install flask and running into dependency conflicts until I learned about `venv`. Recently, I started wondering why I don't run into the same issues when working with rails. This led me down the rabbit hole of learning about bundler and dependency isolation. 

### What is bundler?
Bundler is a popular ruby gem used to install project dependencies instead of installing each gem via ruby gem. An application can define a `Gemfile` with all the project's gem dependencies. Then `bundle install` will install each of the gems. It will also resolve any dependency conflicts. For example, assume the application depends on `gem_a` and `gem_b`.  It requires `gem_a` to be version 3 or higher. `gem_b` also depends on `gem_a` but it requires version 4 or higher. Bundler will install version 4 since that satisfies all dependencies.  Bundler then creates a `Gemfile.lock` file which lists all the gems installed and their versions. This makes it easy for another developer to install the same dependencies on their computer. 

### What is bundle exec?
So how does that offer dependency isolation? Well, it is common to run rails with `bundle exec` (ie `bundle exec rspec <path/to/file>`). Running `bundle exec` ensures all the gems specified in the `Gemfile` are automatically available to the ruby application via `require`. More so, it ensures that only those gems are available. So if you have many versions of a gem installed, it will ensure only the version specified in the `Gemfile` is available to the application. 

For example, `require 'json'` will always use the latest version of `json` installed on the computer. So if another application is using a higher version of the gem, that version may be imported instead of the version you intended. 

With `bundle exec`, only the versions specified in the `Gemfile` will be available, which ensures the correct version is imported by `require`. 

### Ruby load path
So, how exactly does `bundle exec` ensure the correct version is used by the application? 

RubyGem uses a global variable called `$LOAD_PATH`, which stores the path to a gem on a computer. `require` uses the `$LOAD_PATH` to find the gem and import it. By default, the $LOAD_PATH has the path to the latest version of a gem.   

However `bundle exec` [overrides the `$LOAD_PATH`](https://github.com/rubygems/rubygems/blob/master/bundler/lib/bundler/runtime.rb#L16)to contain paths to the gems in the Gemfile (with the version specified in the Gemfile) and only those gems. This ensures that the correct version of each gem is always used regardless of which other versions may be installed on the computer. 

### Testing this in practice 
You can see this in action by running code that requires the JSON gem and then prints the load path. It also converts a hash to JSON. 
```
require 'json'
pp $LOAD_PATH

print JSON.generate({"key"=>"http://www.example.com/test"}, escape_slash: true)
```

Without bundler, it loads the latest json gem I have installed (2.6.3). Notice this version of the json gem escapes the slashes.  
```

 % ruby json_with_escape.rb
["/Users/veerpalbrar/.rvm/gems/ruby-2.7.2/gems/json-2.6.3/lib",
 "/Users/veerpalbrar/.rvm/gems/ruby-2.7.2/extensions/x86_64-darwin-21/2.7.0/json-2.6.3",
 "/Users/veerpalbrar/.rvm/rubies/ruby-2.7.2/lib/ruby/site_ruby/2.7.0",
...]

{"key":"http:\/\/www.example.com\/test"}
```

When I create a Gemfile specifying version 2.3.1, and run the ruby file with `bundle exec`, you can see that version 2.3.1 is listed in the $LAOD_PATH. You can also see this version of the gem doesn't escape the slashes in the url.  
```
 % bundle exec ruby json_with_escape.rb
["/Users/veerpalbrar/.rvm/gems/ruby-2.7.2/gems/bundler-2.3.19/lib",
 "/Users/veerpalbrar/.rvm/gems/ruby-2.7.2/gems/json-2.3.1/lib",
 "/Users/veerpalbrar/.rvm/gems/ruby-2.7.2/extensions/x86_64-darwin-21/2.7.0/json-2.3.1",
 "/Users/veerpalbrar/.rvm/rubies/ruby-2.7.2/lib/ruby/site_ruby/2.7.0",
...]
{"key":"http://www.example.com/test"}
 
```

This is why your application needs to specify its dependencies.  If the gem is updated, you want the application to continue to use the older version and not break existing behaviour. `bundler` is one tool you can you for this dependency management. 

### Sources
- [Bundler]()
- [Understanding Bundler Setup Process](https://www.brianstorti.com/understanding-bundler-setup-process/)
- [Why to use $LOAD_PATH in ruby](https://medium.com/@aayushsharda/why-to-use-load-path-in-ruby-ce971bc1d864#:~:text=%24LOAD_PATH%20is%20used%20for%20the,the%20dependencies%20in%20the%20project)
- [Ruby load_path](https://webapps-for-beginners.rubymonstas.org/libraries/load_path.html)
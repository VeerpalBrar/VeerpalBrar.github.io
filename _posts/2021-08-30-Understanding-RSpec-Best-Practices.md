---
published: true
layout: post
date: 30 August 2021
tags: ["RSpec", "Testing"]
---

This past month, I looked at "best practices" for writing RSpec tests. Sites like [betterspecs](https://www.betterspecs.org/)and the [RSpec style guide](https://rspec.rubystyle.guide) offer simple rules to follow. Yet, they do not elaborate on why they suggest the practices they do. Therefore, I decided to spend some time better understanding their recommendations.

### DRY vs DAMP

Both sites mention `DRY`(Don't Repeat Yourself) at some point. DRY (Don't Repeat Yourself) is a programming principle that aims to reduce duplication in code. Since you are testing one class in many scenarios, you can expect some duplication in the setup and execution of your tests. If you follow DRY, you would move this duplication into `before` and `let` blocks.

However, it can be harder to figure out what is being tested because all of the logic is outside of the actual test. This makes it harder to read the code and understand how a class is expected to work. You should aim to make tests readable and easy to understand, even if you duplicate some bits of code. This is sometimes known as DAMP (Descriptive and Meaningful phrases).

That said, lots of duplication in tests makes them harder to modify. The RSpec style guide suggests "doing everything directly in your `it` blocks even if it is duplication and then refactor your tests after you have them working to be a little more DRY".

The aim is to strike a balance between `DAMP` and `DRY` and be okay with some duplication to help increase readability.

### Using `let` vs `before` blocks

Both sites suggest instantiating variables using `let` statements instead of inside `before` blocks. Code within each `before(:each)` block runs before every example block. A variable defined in a `before` block is created for each example, even if the test does not reference the variable. Creating a lot of database objects in a `before(:each)` block, will slow down tests. In comparison, `let` is lazy-loaded. A `let` object is only created after it is referenced in a test. Each test will only create the objects referenced in the test itself. Thus, you avoid creating unnecessary objects in your tests.

Avoid using `before(:all)` to instantiate data that is used across many tests. It can cause data to leak between tests, leading to flaky or false positive tests. All examples in Rspec run in a transaction. All database changes are rolled back at the end of the test. That way, you start with a clean database at the beginning of each example. Changes made in a `before(:all)` block are not part of the transaction. Though you can clean up the database changes in an `after(:all)` block. If you forget to clean up the data, it will persist across all tests and could cause other tests to fail. Database changes made in `let` blocks or `before(:each)` blocks get rolled back at the end of the example by the database transaction.

### Factories

Both sites advocate for factories over fixtures ([though there is a not clear consensus](https://github.com/betterspecs/betterspecs/issues/11)). With fixtures, test objects are all defined in fixture files with predefined data. Fixtures can be used across tests but modifying an existing fixture can break tests that depend on that fixture. As a codebase grows managing fixtures for all the various states of your object can be difficult. In comparison, factories let you build and configure new objects per test.

Working with factories can also be overwhelming, especially when you are new to them. I have found a couple of helpful tips that can make working with factories easier:

- When defining factory defaults, only provide the attributes required to pass validation. All other functionality should be added via traits. Avoid creating associations that are not required by default. That way you don't create database objects that are not required for each test.
- When using factories in a test, provide only the traits required for the test to pass. It clarifies the properties of the object that are required to make the test pass.
- If your test references a default value of a factory, set the default value during object creation. For example, even if the default name for a user is "Bob", create should your user with `build(:user, name: "Bob")`. This indicates that the name is important for the test and makes it explicit where the value of `"Bob"` is coming from.
- If you use FactoryBot, try to build your factory objects instead of creating them. When you use `create`, it calls the database to instantiate the object and all its associations. `build`, will set up the attributes but not save them to the database. It will still call `create` on the associations and will run validation on those. Finally, if you use `build_stubbed`, the object associated are stubbed out so the database is not called. So, try to build test objects to avoid hitting the DB and help speed up tests.

### Mocking

The rails style guide has some guidelines related to mocking objects.

First, they suggest to not stub the object you are trying to test. For example, avoid doing `allow(object_under_test).to receive(:foo).and_return("bar")`.

Tests ensure that your code does what you expect it to. When you stub out parts of the object you are testing, you risk false positive tests. The stubbed code never runs, so even if the test passes, you can't be confident that your code works.

Sometimes, we want to see what a method returns based on the state of the test object. Thus, we're tempted to stub some of its methods to match the expected state. Instead of stubbing the state of the object, build the object with the desired state using a factory. Likewise, you might want to stub out a method that makes a complicated library call that's hard to test. In that case, either stub out the library call or extract the complicated logic into another class. Then stub out the class in your tests. When you extract the logic into another class, you are now stubbing the collaborator, instead of the object under test.

Mocking collaborators of the object under test is acceptable. The collaborator has been tested in its own unit tests. You can test the collaborator is called with the correct arguments but stub the response for faster tests. Therefore, you rely on the collaborators interface rather than its implementation.

### In conclusion

When I started researching best practices, I wanted some tips on writing better tests. In reality, I've realized it's not that clear-cut, and there are many ways of testing an object. I realized that even "best practices" have exceptions. Instead of following rules blindly, it helps to understand the reasoning behind the rules. Then you can confidently know you are using these rules correctly.

#### Resources

- [betterspecs.org](https://www.betterspecs.org)
- [RSpec style guide](https://rspec.rubystyle.guide)
- [Testing Rails](https://books.thoughtbot.com/assets/testing-rails.pdf)
- [Thoughts on Mocking](http://myronmars.to/n/dev-blog/2012/06/thoughts-on-mocking)

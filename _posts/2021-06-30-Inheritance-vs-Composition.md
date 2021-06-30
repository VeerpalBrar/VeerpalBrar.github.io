---
published: true
layout: post
date: 30 June 2021
tags: ["Design"]
---

When I first learned object-oriented programming, I saw inheritance as a useful way for objects to share functionality. Yet, I often hear programmers say they prefer "Composition over inheritance".  This is an idea that I've been thinking about a lot as I've been reading books on object-oriented programming and design patterns. In this blog post, I attempt to summarize what I've understood about the benefits and drawbacks of inheritance.

### What is inheritance
Inheritance is when a class (referred to as the child) derives code from another class (called the parent). By default, the child will inherit all the methods and functionality of the parent. The child can choose to override the functionality of the parent or add new functionality. Say you have an `Animal` class with `walk` and `talk` methods and a 'Dog' class which inherits from `Animal`. By default, the `Dog` class will be able to `walk` and `talk`. It may even override `talk` to return the specific noise a dog makes. 

### What is Composition
Composition is when you add functionality by referencing other objects. For example, a 'Car' class may have variables to reference `engine` object and `wheel` objects. To make the car drive, the 'Car' object would delegate these tasks to the `wheel` and `engine` objects. In a sense, a 'Car' composes many different objects. 

### What does composition over inheritance mean? 
Choosing "composition over inheritance", means adding behavior to an object by composing objects instead of using inheritance. 

While inheritance is a useful way to share functionality, it does have drawbacks. The main one being that inheritance is a form of dependency. When you have one class inherit from another, you are coupling the two classes together. Especially in languages that only allow a class to inherit from one class.  Changes made to the parent class will change the behavior of the child class, potentially creating a bug. If you don't want the child class to change, you will have to modify the child class to override the behavior of the parent class. The more behavior a child class overrides, the harder it becomes to maintain. Anytime a programmer wants to change the child or parent class, they will need to understand how both classes work or risk introducing bugs. 

Composition relies on using small classes with clear responsibilities. Functionality lives in a single class that is responsible for implementing it. To use some functionality delegate to the class that implements it. If a particular functionality needs to change, you only have to modify one class. If you require behavior that diverges from the current implementation, create a new class to implement it. It's easier to change the objects you reference than to start inheriting from a whole new class. 

### It's a guideline, not a rule 
Composition isn't without its drawbacks. For example, with composition, you have to handle the message passing explicitly. If you tell a car to "start_engine", you need a method that calls the `engine` object to start the engine. With inheritance, you can tell a dog to "walk" without implementing the "walk" method in the dog class. By default, inheritance handles delegating this message to the parent class. With composition, the message passing can be very complicated for complex objects. Especially if the objects know too much about each other's implementation details. You could end up creating a class that is composed of tightly coupled classes. Always choosing "composition over inheritance" means you miss cases where inheritance is appropriate

### When to use inheritance vs composition
A good rule of thumb is that inheritance represents an "is-a" relationship. Composition represents a "has-a" relationship. For example, a car **has an** engine, but it **is not an** engine. An animal is a dog, but an animal does not have a dog. Consider the relationship between objects when deciding between inheritance and composition. 

Be wary of confusing real-world concepts with classes representing those concepts. In the real world, both dogs and fish are animals. However, the behavior of a dog and a fish is different. A fish can not walk, and a dog can not swim. It may not be correct for a dog and a fish to inherit from the same parent class since they only share a small subset of behavior. A better option is getting this behavior from objects like "Legs", "Gills" etc that implement "walk" or "swim". 

If your class only needs part of the functionality of another class, don't shoehorn the two classes into an inheritance hierarchy. You will have to override all the functionality you don't need. Instead, use composition to get only the behavior you desire. 

Choose inheritance when an object needs all of the behavior of the parent class. Meaning, wherever the parent is used, you could replace it with an instance of the child class (see [Liskov Substitution Principle](https://stackify.com/solid-design-liskov-substitution-principle/)). In this case, the child is an instance of the parent. With inheritance, the parent often represents the general case of the object, while the child is a specialization of that object. For example, you can have a 'Dog' parent class with child classes for the different dog breeds.  The breeds may have different attributes. However, you could replace one breed with another and get the same behavior. Breeds are a specialization of 'Dogs' at an atomic level. It's hard to break breeds down to further subtypes. 

I think programmers prefer composition over inheritance because most software contains complex objects that are difficult to model with inheritance. However, inheritance does have its place in software development (there is a reason many design patterns use inheritance). If you rely on composition over inheritance too heavily, you may miss use cases for inheritance. Use "composition over inheritance" when you have the potential for more behavior changes or an unclear future design. If you find yourself with "Dog", "Fish", and "Animal" classes and it's not clear inheritance is the correct choice, your better off sticking with the flexibility of composition until the requirements become better defined.

### Sources
- Practical Object Oriented Programming by Sandi Metz
- [Composition](https://stackify.com/oop-concepts-composition/)
- [Inheritance](https://stackify.com/oop-concept-inheritance/)

---
published: true
layout: post
date: 27 December 2016
tags: ["Open Source"]
---
All newbie programmers hear how they should contribute to open source in order to build their portfolio and give back to the programming community. This is a hundred percent true, but it's also a daunting task.
I'm going to share my experiences as a newbie open source contributor and share some tips that helped me in the process. 

### The First Contribution
A common way to contribute to open source in to submit a pull request on GitHub where many open source projects are hosted. This requires the use of git, which can be a whole new challenge on top of open source contributions. There is a lot to learn about branching, forking, and commiting.

This is why I started small for my first contribution. I wanted easy to implement code so I could focus on the git aspect of contributing.

I decided to commit to the python3 page on [learnXinYMinutes](https://learnxinyminutes.com/docs/python3/). Since I was already familiar with python syntax it was easy for me to find a small detail that could be added to the project. I noticed that the range function explanation did not provide information on the step parameter. I decided to add this parameter to the explanation. 

Then came the harder part. There are a lot of resources out there about using git. I read a bunch of them and tried to get a grasp on how git worked and what order I needed to use the commands.

In particular I tried to learn about [setting up git](https://help.github.com/articles/set-up-git/) forking (https://help.github.com/articles/fork-a-repo/), [branching](https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell), [commiting](http://media.pragprog.com/titles/tsgit/chap-005-extract.html), [pushing](https://help.github.com/articles/pushing-to-a-remote/) and [creating a pull request](https://help.github.com/articles/creating-a-pull-request/). 

I basically followed the instructions I found online, forked the learnXinYMinutes, made changes and then created a pull request. Actually, I remember at one point I was getting so confused I had to delete everything and start over again. I had a lot of questions and it took me a whole weekend to figure out the process. But in the end, I made my pull request and got it merged!

### The Second Contribution 
So learnXinYMinutes was technically my first open source contribution. I made a couple more documentation related contributions such as for the [FreeCodeCamp wiki](https://github.com/FreeCodeCamp/wiki). But contributing to open source is more than just learning git. Another part of contributing is finding things to fix in code itself not just the documentation.

I think that this is something many newcomers struggle with. Projects usually have large code bases with multiple files that interact with one another. This can feel overwhelming as it's difficult to understand where to begin. This is why I picked my second contribution to be for [Duck Duck Go Instant Answers](https://duckduckhack.com/), which is a feature in the Duck Duck Go search engine which tries to provide answers to user searches using APIs. Each instant answer only requires understanding a couple of files so the learning curve is less steep compared to larger projects. Not to mention, they have great [documentation](https://docs.duckduckhack.com/) to help beginners get started. I ended up improving the [RandWord Instant Answer](https://duck.co/ia/view/rand_word) as well as creating a [Sass Long tail](https://duck.co/ia/view/sass). I had a lots of help from developers in the Duck Duck Go community along the way. 

### Today
Currently, I work on contributing to small projects that my friends have started. These projects usually have twenty or so files and it can be overwhelming to know where to start. However, I just take my time, looking the code (sometimes more than once) and trying to figure out what it does. I google syntax I'm unfamiliar with and figure out where the changes I want to make fit in. 

I hope that as my familiarity with programming increases, I will one day contribute to large open source project that reaches thousands of users.

---
published: true
layout: post
date: 17 Feburary 2023
tags: ["Bash", "Dev Journal", "Tools"]
---
I've been learning a bit about docker and found myself repeating the same commands over and over again to push a docker image. I decided to see if I could create an alias for multiple commands in bash. 

A quick google search shows that you can define functions in your `.bashrc` to run multiple commands at once. In the end, this is what I came up with. 

```
function docker_push {
  LINE=$(docker build . 2>&1 | grep "writing image sha256")
  IMAGE_SHA=$(echo  $LINE |  awk '{print substr($0,26,10)}')
  docker tag $IMAGE_SHA $1
  docker push $1
}
```

Then you can run `docker_push username/repo:version` to push your docker image. 

If you're bash knowledge is as rusty as mine, here is a quick breakdown of how `docker_push` works. 
## Redirect docker build output to grep 
First off, I knew I wanted to grep the output for `docker build .` for the docker image SHA256 code. I tried to do `docker build . | grep "writing image sha256"` but that resulted in an empty file. 

[Then I realized that docker build outputs to stderr, not stdout.](https://forums.docker.com/t/capture-ouput-of-docker-build-into-a-log-file/123178/2) 

> 💡 Bash automatically provides [3 types of file descriptors.](https://catonmat.net/bash-one-liners-explained-part-three#:~:text=When%20bash%20starts%20it%20opens,them%20and%20read%20from%20them.) There is stdout (file descriptor 1), stderr (file descriptor 2), and stdin (file descriptor 0). Commands read from stdin and then output to stdout or stdin. 
When we use `|` in bash, we are piping the stdout of the first command as the stdin of the second command. 

Therefore I used `2>&1` to redirect the stderr of `docker build` command to the stdout file descriptor instead. Then I could use `|` to redirect the stdout of `docker build .` to the stdin of the grep command. 

This let me grep for the line with the SHA256 code. I save the output of grep into a variable for later use. This is done with `MY_VAR=$(COMMAND)` syntax, where the result of `COMMAND` is saved to `MY_VAR`. 

For reference, the value of `LINE` is something like `#11 writing image sha256:ee19794e19c05bfab071c3e3593379a20ae9b59cf0dd47ac0c39274e0333e6b2 done`

## Extracting the SHA256 code from the grep output
Next, I used `awk` to get the substring of the `LINE` that contains the beginning of the SHA256 code. 

Since I know that `LINE` always starts with `#11 writing image sha256:`, I decided to get the substring starting at character 26, and get the next 10 characters, which are the starting of the SHA256 code. I did this with `awk '{print substr($0,26,10)}'` (full credit: [stackoverflow](https://stackoverflow.com/questions/24427009/is-there-a-cleaner-way-of-getting-the-last-n-characters-of-every-line))

Again, awk reads from `stdin` so I used `echo $LINE` to get the value of `LINE` and then I redirected that to stdin of `awk`. I save the result in $IMAGE_SHA. 

## Getting function arguments. 
Now that I have the image SHA256 code, I can pass that as an argument to `docker tag`. The `docker tag` command needs the SHA256 code and the repo tag. Since the repo tag value changes based on which repo you are working with, I decided to pass that in as an argument to `docker_push`. Then I can use `$1` to reference the first argument passed to my function. 

So if I call `docker_push username/repo:version` then the value of `$1` is "username/repo:version". 

### Sources:
- [Make a bash alias that takes a function](https://stackoverflow.com/questions/7131670/make-a-bash-alias-that-takes-a-parameter)
- [Capture output of a command in a variable](https://stackoverflow.com/questions/5955577/automatically-capture-output-of-last-command-into-a-variable-using-bash)
- [Redirect stderr to stdout](https://unix.stackexchange.com/questions/400038/send-stderr-to-stdout-for-purposes-of-grep)
- [Bash One-Liners Explained, Part III: All about redirection](https://catonmat.net/bash-one-liners-explained-part-three#:~:text=When%20bash%20starts%20it%20opens,them%20and%20read%20from%20them.)


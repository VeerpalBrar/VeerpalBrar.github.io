---
published: true
layout: post
date: 01 January 2024
title: How to Run a Program or Script Hourly on macOS
tags: ["Tools", "Dev Journal"]
permalink: /blog/:title/
---
Do you have a program or bash script that needs to run continuously or on a specific time interval on your Mac? The solution lies in using `launchd`, an Apple-recommended approach and an open-source service management framework. 

## What is `launchd`?

`launchd` is an open-source service management framework recommended by Apple. It enables you to "start, stop, and manage various processes, including daemons, applications, and scripts"[1]. For the purpose of this blog, we'll concentrate on working with a launch agent, a process that runs on behalf of the logged-in user.

## How Does `launchd` Work?

1. **Generate a Plist File**: Create a property list (plist) file, which stores preferences in XML format. Use any text editor to define which program or script to run and how often. I'll explain the structure of the file more below. 

2. **Save to `~/Library/LaunchAgents/`**: Save the plist file to the `~/Library/LaunchAgents/` folder. The system monitors this folder and uses the plist to run your program or script based on the specified time frequency.

3. **Use `launchctl` for Testing**: The `launchctl` command-line utility helps start, stop, and load your job for testing purposes.

## Creating a Plist File

A plist file is a straightforward XML file with key-value entries. Here's an overview of the key entries and their significance:

- Label (Required Key): The Label key is mandatory, serving as the unique name for your job. It must be distinctive to avoid conflicts with other jobs.

- Program: The Program key specifies the program or script you want to run. In our example, it points to a script containing the logic you want to execute hourly. If you're using a script, ensure it is set to be executable by your user. You can achieve this with the command `chmod +x <path/to/script>`.

 - StartInterval: The StartInterval key determines how frequently your job should run, specified in seconds. For running a job every hour, set it to 3600 seconds (60 seconds/minute * 60 minutes/hour).

- StandardOutPath, StandardInPath, StandardErrorPath: These keys allow you to define the paths for standard output, standard input, and standard error logs, respectively. It's useful for organizing and accessing logs related to your job.

Below is an example plist file for running a script every hour:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>Label</key>
	<string>local.example.script.start</string>
	<key>Program</key>
	<string>/Users/me/path/to/file/script.sh</string>
    <key>StartInterval</key>
    <integer>3600</integer>
	<key>StandardOutPath</key>
	<string>/Users/me/path/to/logs/log.stdout</string>
	<key>StandardInPath</key>
    <string>/Users/me/path/to/logs/log.stdin</string>
    <key>StandardErrorPath</key>
    <string>/Users/me/path/to/logs/log.stderr</string>
</dict>
</plist>
```
Ensure that your plist file adheres to this structure, and customize the values accordingly to suit your specific requirements.
## Testing Your Launch Agent

Use the following command to load a new job:`launchctl load -w ~/Library/LaunchAgents/local.example.script.start.plist`

Once loaded, run your job and check the final status. 

- `launchctl start local.example.script.start`: Start a specific job.
- `launchctl list | grep "local.example"`: Check the status of your job. A status of zero is a successful run. 

If you encounter a non-zero status, you can decipher them using: `launchctl error my_err_code`


## Using LaunchControl

For a more user-friendly experience and better error messages, consider using third-party software like LaunchControl. It verifies your plist file and helps identify issues. For instance, if your script is not executable, LaunchControl makes this clear in the UI and provides a clear error messages more precise then the output of `launchctl error`. You can download LaunchControl for free, and the trial version allows you to verify your plist files.

## Resources
1. [Launchd.info](https://launchd.info/): An excellent resource for learning more about configuring and running launch agents.
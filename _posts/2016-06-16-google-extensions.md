---
layout: post
title: Google Extensions - Using Variables as Object Keys
date: 16 June 2016
published: true
tags: ["Javascript", "Dev Journal"]
---

Recently, I just finished creating my first google chrome extension, called SafetyTab. Now, google chrome extensions are relatively simple to create, as long as you know some HTML, CSS, and JavaScript (including asynchronous JavaScript). 
 
The documentation provided by google is simple, straightforward and they have a lot of samples to look at. Not to mention, there is a wealth of tutorials available online. I highly encourage anyone looking for a quick coding project to try and create a google chrome extension. 

However, there was one aspect that I struggled with, for which I did not find as much documentation. When using the google storage API, one can set key/value pairs like so:

``` javascript
chrome.storage.sync.set({"key":"value"}, function(){
   \\using null retrieves all stored values
   chrome.storage.sync.get(null, function(result) {
    	console.log(result);
	});
});
```
The output would be Object {key: "value"} as expected. 

This works great and if one  quite useful. However, the following does not have expected results.

``` javascript
var key = $("#key").val(); // assume that key refers to the string "item"
chrome.storage.sync.set({key:"value"}, function(){
	chrome.storage.sync.get(null, function(result) {
    		console.log(result);
	});
});
```
The console output is: Object {key: "value"}. 

This is unexpected since the key was meant to be "item" not key. Essentially, google sets the key to be the variable name, not the value which the variable holds. This can be frustrating if one does not know what the key will be - thus requiring the use of a variable. 

However, after much debugging and googling, I learned that this was common behaviour in JavaScript. (No wonder so many people seem to dislike the language!). 


To get around this, you can set a variable value as a key by doing this:

``` javascript
var key = $("#key").val(); 
var save = {};
save[key] = null;
chrome.storage.sync.set(save, function(){
	chrome.storage.sync.get(null, function(result) {
    	console.log(result);
	});
});
```

Then the output will be Object {item: "value"} as desired. 

Admittedly, it is not a concise as one would like it to be, but it's easy to understand and it gets the job done!

Also, if you interested, you can learn about the [google storage API](https://developer.chrome.com/extensions/storage) or follow their [Building a Chrome Extension Tutorial](https://developer.chrome.com/extensions/getstarted).

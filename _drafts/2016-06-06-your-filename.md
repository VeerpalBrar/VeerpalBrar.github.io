 am writing a chrome extension that will be using the chrome storage API. I am trying to use a variable for the key and set the value to null:

function save() {
    var item = $("#item").val();
    chrome.storage.sync.set({item:null}, function(){
        console.log("sync settings saved");
    });
}
I am then running the following to view all saved data:

chrome.storage.sync.get(null, function(items) {
    console.log(items);
});
The console output is:

Object {item: ""}
So basically it is getting set, but instead of saving it with the value of the variable it is saving it with the variable name.

Any ideas how to get it to save the variable value instead?

It's expected behavior in JavaScript. It is how you define keys in Objects.

If you want to set a variable value as an object key you can do something like:

var item = $("#item").val();
var save = {};
save[item] = null;
chrome.storage.sync.set(save)
//...
Then save object will not use "item" as a key but it's value.
function showProject(evt, className) {
    var x = document.getElementsByClassName('project');
    var i
    var proj;
    for (i = 0; i < x.length; i++) {
        proj = x[i];
        proj.style.display = 'none';
        
    }

    // Get all elements with class="tablinks" and remove the class "active"
    var tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    evt.currentTarget.className += " active";
    
    var x = document.getElementsByClassName(className);
    var i
    var proj;
    for (i = 0; i < x.length; i++) {
        proj = x[i];
        if (proj.style.display === 'none') {
            proj.style.display = 'inline-block';
        } else {
            proj.style.display = 'none';
        }
    }
}
#Zi

is a CSS post-processor.

###zi.config 
is the important bit: it returns a json object that looks a lot like normal css. replace this method with your own.

###the zi.css method 
injects a synthetic style tag into the head of the html document, if it's not there, and injects the css.

###the zi.transform method 
just transforms the results of the zi.config method into a string appropriate to injection into that style tag.

##Why do this?
- because I'm a contrarian
- because i would rather not keep track of both a CSS and JS file for every iteration of my app
- because sometimes i need to do a calculation for styles based on the client and i don't want $.css junk all over the place
- because once upon a time i needed the entire css/html base of an app as a single long string
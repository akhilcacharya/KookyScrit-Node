
A Twitter bot I wrote in Node - the original version was written in Java in 2013 and was even worse than this one. Check it out https://twitter.com/kookyscrit

(This was around the same time they started banning most bots - our record was a ban after 2 hours!).

----

#KookyScrit-Node

Revamped, for Node.js. 

Corrects word usage for random people on Twitter. Inspired by @StealthMountain 

##Installation

1. Clone repo. 

2. Enter twitter/DB credentials in "config.json" (this is already filled in)

3. Do ``npm install``

4. Start the application by doing "node app.js"

##Customization

All query terms are stored in the "keywords.json" JSON file.Follow the existing schema to add some more. 

Delay can be found in the config.json file, and is in milliseconds. (Current is 7 minutes, 42,000 MS)

##License

MIT





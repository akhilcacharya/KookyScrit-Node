var Twit = require('twit');
var mongoose = require('mongoose');
var config = require('./config.json');
var querywords = require('./keywords.json');

var _ = require('lodash-node');

var Twitter = new Twit({
    consumer_key: config.twitter.consumer_key,
    consumer_secret: config.twitter.secret_key,
    access_token: config.twitter.access_token,
    access_token_secret: config.twitter.access_token_secret
});

var kookyscrit = {

    setup: function() {

        //DB
        //Connect to DB
        var mongo_url = config.db.base_url + "" + config.db.username + ':' + config.db.password + config.db.path;
        mongoose.connect(mongo_url);

        var db = mongoose.connection;
        db.on('error', console.error.bind(console, "Connection error"));
        db.once('open', function callback() {
            console.log("Connected to server");
            console.log("\n\n");

            //Models
            //Instantiate model
            require('./models/EntryModel.js')

            //Set interval to re-call Query function indefinitely
            setInterval(kookyscrit.query, config.twitter.delay);
            kookyscrit.query();

        });
    },

    query: function() {
        var queryWord = kookyscrit.utils.getWord();

        console.log("Searching for..." + queryWord.word);

        Twitter.get('search/tweets', {
            q: queryWord.word + "",
            count: 5
        }, function(err, reply) {
            if (reply.statuses.length > 0) {
                if (config.debug) {
                    console.log(reply.statuses[0]);
                    console.log("\n\n");
                    console.log(reply.statuses[0].user);
                }
                kookyscrit.reply(reply.statuses[0], queryWord);
            } else {
                console.log("No tweets, apparently. Skipping a turn");
                console.log("\n\n");
            }
        })
    },

    reply: function(tweet, word) {
        var response = this.utils.constructTweet(tweet.user.screen_name, word);

        //TODO: Check if already responded first

        var Entry = mongoose.model("Entry");


        var respondToTweet = function() {
            if (config.production) {
                Twitter.post("statuses/update", {
                    in_reply_to_status_id: tweet.id_str,
                    status: response
                }, function(err, reply) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Response is: " + response)
                        console.log("Responded!");
                        kookyscrit.save(tweet, response, word);
                    }
                })
            } else {
                console.log("Test response is: " + response)
                console.log("Responded!");
                kookyscrit.save(tweet, response, word);
            }
        }

        var finish = _.after(1, respondToTweet)

        Entry.findOne({
            tweetId: tweet.id_str
        }, function(err, entry) {
            if (entry == undefined) {
                finish();
            } else {
                console.log("Whups, looks like I've already responded. Lets skip a turn!");
                console.log("\n\n");
            }
        })

    },

    save: function(tweet, response, word) {
        console.log("Saving tweet by " + tweet.user.screen_name + " which contains " + word.word);

        var Entry = mongoose.model('Entry');

        var newEntry = new Entry({
            userId: tweet.user.screen_name,
            userProfilePicture: tweet.user.profile_image_url,
            realName: tweet.user.name,
            location: tweet.user.location,
            followers: tweet.user.followers_count,
            following: tweet.user.friends_count,
            time_zone: tweet.user.time_zone,

            tweetId: tweet.id_str,
            createdAt: tweet.created_at,
            word: word,
            initialTweet: tweet.text,
            responseTweet: response,
            userAgent: tweet.source,
            retweet_count: tweet.retweet_count,
        });

        newEntry.save(function(err) {
            if (err) {
                console.log(err);
                console.log("Could not save :(");
            } else {
                console.log("Saved! Waiting for another " + config.twitter.delay / (1000 * 60) + " minutes");
            }
            console.log("\n\n");
        })
    },

    utils: {
        getWord: function() {
            return querywords.query_words[kookyscrit.utils.getRandomNumber(0, querywords.query_words.length)];
        },

        constructTweet: function(username, word) {
            var position = kookyscrit.utils.getRandomNumber(0, word.responses.length);
            return "@" + username + " " + word.responses[position];
        },

        getRandomNumber: function(floor, ceiling) {
            var random = Math.floor((Math.random() * ceiling) + floor);
            if(config.debug){
            	console.log(random);
            }
            return random;
        }
    }
}

kookyscrit.setup();

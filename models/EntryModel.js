var mongoose = require('mongoose'); 

var entrySchema = mongoose.Schema({
	userId: String, 
	userProfilePicture: String, 
	realName: String, 
	location: String, 
	time_zone: String, 
	followers: Number, 
	following: Number, 
	tweetId: String, 
	createdAt: String, 
	word: String, 
	initialTweet: String, 
	responseTweet: String,
	userAgent: String, 
	retweet_count: Number, 
}); 

mongoose.model("Entry", entrySchema); 


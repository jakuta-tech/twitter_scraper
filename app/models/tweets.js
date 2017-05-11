var mongoose = require('mongoose');

//MongoDB Tweet schema
var tweetSchema = mongoose.Schema({
    twitter: {
    	created_at: String,
        id: String,
        text: String,
        user_id: String,
        user_name: String,
        user_screen_name: String,
        user_location: String,
        user_followers_count: String,
        user_friends_count: String,
        user_created_at: String,
        user_time_zone: String,
        user_profile_background_color: String,
        user_profile_image_url: String,
        geo: String,
        coordinates: String,
        place: String
    }
});

module.exports = mongoose.model('Tweet', tweetSchema);

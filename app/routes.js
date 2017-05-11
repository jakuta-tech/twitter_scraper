var Twitter = require('twitter');
var Tweet = require('../app/models/tweets');
var fs = require('fs');
var js2xmlparser = require("js2xmlparser");
// var path = require('path');
// var mime = require('mime');

module.exports = function(app, express) {

    function get_tweets(tweets, res, callback){

        var error_count = 0;

        //Assume search api is being called
        var statuses_api = false;

        //If tweets.length is defined we are instead calling
        //the status timeline api
        if(tweets.length != undefined){
            statuses_api = true
        }
        else{
            //For the search api
            if(tweets.statuses == undefined || tweets.statuses.length <= 1){
                res.send("Sorry, no tweets were added to the database");
                return;
            }
        }
        //Status timeline api for a particular user : parsing and saving to mongodb
        if(statuses_api == true){
            var remaining = tweets.length;

            for (var i = 0; i < tweets.length; i++) {
                
                var tweet = new Tweet();

                tweet.twitter.created_at = tweets[i].created_at;
                tweet.twitter.id = tweets[i].id;
                tweet.twitter.text = tweets[i].text;
                tweet.twitter.user_id = tweets[i].user.id;
                tweet.twitter.user_name = tweets[i].user.name;
                tweet.twitter.user_screen_name = tweets[i].user.screen_name;
                tweet.twitter.user_location = tweets[i].user.location;
                tweet.twitter.user_followers_count = tweets[i].user.followers_count;
                tweet.twitter.user_friends_count = tweets[i].user.friends_count;
                tweet.twitter.user_created_at = tweets[i].user.created_at;
                tweet.twitter.user_time_zone = tweets[i].user.time_zone;
                tweet.twitter.user_profile_background_color = tweets[i].user.profile_background_color;
                tweet.twitter.user_profile_image_url = tweets[i].user.profile_image_url;
                tweet.twitter.geo = tweets[i].geo;
                tweet.twitter.coordinates = tweets[i].coordinates;
                tweet.twitter.place = tweets[i].place;

                //Save tweets to database
                tweet.save(function (err, results) {
                    remaining --;
                    if(err != null){
                        error_count += 1;
                    }
                    if(remaining == 0) {
                        callback(error_count);
                    }
                });
            }
        }
        //Search api for a particular topic or location : parsing and saving to mongodb
        else {
            var remaining = tweets.statuses.length;
            for (var i = 0; i < tweets.statuses.length; i++) {
                
                var tweet = new Tweet();

                tweet.twitter.created_at = tweets.statuses[i].created_at;
                tweet.twitter.id = tweets.statuses[i].id;
                tweet.twitter.text = tweets.statuses[i].text;
                tweet.twitter.user_id = tweets.statuses[i].user.id;
                tweet.twitter.user_name = tweets.statuses[i].user.name;
                tweet.twitter.user_screen_name = tweets.statuses[i].user.screen_name;
                tweet.twitter.user_location = tweets.statuses[i].user.location;
                tweet.twitter.user_followers_count = tweets.statuses[i].user.followers_count;
                tweet.twitter.user_friends_count = tweets.statuses[i].user.friends_count;
                tweet.twitter.user_created_at = tweets.statuses[i].user.created_at;
                tweet.twitter.user_time_zone = tweets.statuses[i].user.time_zone;
                tweet.twitter.user_profile_background_color = tweets.statuses[i].user.profile_background_color;
                tweet.twitter.user_profile_image_url = tweets.statuses[i].user.profile_image_url;
                tweet.twitter.geo = tweets.statuses[i].geo;
                tweet.twitter.coordinates = tweets.statuses[i].coordinates;
                tweet.twitter.place = tweets.statuses[i].place;

                //Save tweets to database
                tweet.save(function (err, results) {
                    remaining --;
                    if(err != null){
                        error_count += 1;
                    }
                    if(remaining == 0) {
                        callback(error_count);
                    }
                });
            }
        }
    }
    
    //Check if input is a valid integer
    function isInt(value) {
        var x = parseFloat(value);
        return !isNaN(value) && (x | 0) === x; 
    }

    //Trim Function to remove white space
    if(typeof(String.prototype.trim) === "undefined")
    {
        String.prototype.trim = function() 
        {
            return String(this).replace(/^\s+|\s+$/g, '');
        };
    }

    //Tweet text and data (to output to JSON file)
    tweets_array = []
    
    //Twitter credentials
    var client = new Twitter({
      consumer_key: 'jKGAGGgBM73WvbMcWQYRql8It',
      consumer_secret: 'TtdGCbtPNusoTVx2ehxYkIxODZhJXzX52k7gBIs32CTyY4mC3h',
      access_token_key: '243405576-kTmFPozQd89EQ1LGPWaElkqaXsYLLYDD4lQWjJQd',
      access_token_secret: 'cj7hS6kDsHmeZQxbOE5PR80iALAXuF6nCV7diHmPmfg02'
    });

    app.get('/', function (req, res) {
        res.render('index.html');
    });

    app.get('/visualize', function (req, res) {
        res.render('visualize.html');
    });

    //CSV, XML, and JSON Conversion Code
    app.post('/export',function (req, res) {

        var file_name = req.body.file_name;
        if(file_name == ''){
            file_name = "untitled";
        }

        Tweet.find({}, function (err, docs) {
            //Retrieve all tweets from MongoDB
            //Push into an array that can be accessed by all conversion code
            for(var i = 0; i< docs.length; i++){
                tweets_array.push({"created_at":docs[i].twitter.created_at, "id":docs[i].twitter.id, "text":docs[i].twitter.text, "user_id":docs[i].twitter.user_id, "user_name":docs[i].twitter.user_name, "user_screen_name":docs[i].twitter.user_screen_name, "user_location":docs[i].twitter.user_location, "user_followers_count":docs[i].twitter.user_followers_count, "user_friends_count":docs[i].twitter.user_friends_count, "user_created_at":docs[i].twitter.user_created_at, "user_time_zone":docs[i].twitter.user_time_zone,"user_profile_background_color":docs[i].twitter.user_profile_background_color,"user_profile_image_url":docs[i].twitter.user_profile_image_url,"geo":docs[i].twitter.geo,"coordinates":docs[i].twitter.coordinates,"place":docs[i].twitter.place}); //Add each tweet to an array
            }
            //-----> JSON CONVERSION CODE
            if(req.body.format == "JSON"){
                //Check if file exists, alert the user if it does or does not
                // fs.stat(file_name + '.json', function(err, stat) {
                //     // if(err == null) {
                //     //     res.send("File already exists. Overwriting it.");
                //     // }
                //     // else{
                //     //     res.send("Creating file");
                //     // }
                // });
                fs.writeFile(file_name + '.json', JSON.stringify(tweets_array), function(err) {
                    if(err){
                        console.log(err);
                    }
                    else{
                        var file = file_name + '.json';
                        res.download(file);
                    }
                    //Clear the tweets array so that the user can get a new stream of tweets and export
                    //that stream if they so choose to
                    tweets_array = [];
                    return;
                });
            }
            //-----> XML CONVERSION CODE <STILL NOT WORKING PROPERLY>
            else if(req.body.format == "XML"){
                xmlString = js2xmlparser.parse("tweet", tweets_array);
                //Check if file already exists
                fs.stat(file_name + '.xml', function(err, stat) {
                    if(err == null) {
                        res.send("File already exists. Overwriting it.");
                    }
                    else{
                        res.send("Creating file");
                    }
                });
                fs.writeFile(file_name + '.xml', xmlString, function(err) {
                    if(err){
                        console.log(err);
                    }
                    //Clear the tweets array so that the user can get a new stream of tweets and export
                    //that stream if they so choose to
                    tweets_array = []; 
                });
            }
            //-----> CSV CONVERSION CODE
            else if(req.body.format == "CSV"){
                fs.stat(file_name + '.csv', function(err, stat) {
                    if(err == null) {
                        res.send("File already exists. Overwriting it.");
                    }
                    else{
                        res.send("Creating file");
                    }
                });
                //Create CSV header row
                var str = '"created_at","id","text","user_id","user_name","user_screen_name","user_location","user_followers_count","user_friends_count","user_created_at","user_time_zone","user_profile_background_color","user_profile_image_url","geo","coordinates","place"\n';
                // Loop through tweets array
                // Create CSV formatted string
                for(i=0; i<tweets_array.length; i++){
                    var tweet_text = (tweets_array[i].text).trim();
                    str+= tweets_array[i].created_at + ',' + tweets_array[i].id + ',' +  '"' + tweet_text + '"' + ',' + tweets_array[i].user_id + ',' + tweets_array[i].user_name + ',' + tweets_array[i].user_screen_name + ',' + '"' + tweets_array[i].user_location + '"' + ',' + tweets_array[i].user_followers_count + ',' + tweets_array[i].user_friends_count + ',' + tweets_array[i].user_created_at + ',' + tweets_array[i].user_time_zone + ',' + tweets_array[i].user_profile_background_color + ',' + tweets_array[i].user_profile_image_url + ',' + tweets_array[i].geo + ',' + tweets_array[i].coordinates + ',' + tweets_array[i].place + '\n';
                }
                //Actually write to the file the CSV string
                fs.writeFile(file_name + '.csv', str, function(err) {
                    if(err){
                        console.log(err);
                    }
                    //Clear the tweets array so that the user can get a new stream of tweets and export
                    //that stream if they so choose to
                    tweets_array = []; 
                });
            }
        });
    });

    app.post('/build_tweet_db', function (req, res) {
        Tweet.remove(function(err,removed) {
            // Remove all Tweets from database
        });
        var query, api_type = "";
        //Determine what the query request is: by topic or location
        //Based on this determine what api call should be used
        if(req.body.type == 'topic'){
            var tweet_topic, tweet_count; //Initialize important query variables

            //Error checking
            if(req.body.topic == ''){
                tweet_topic = "Information Technology";
            }
            else{
                tweet_topic = req.body.topic;
            }
            if(req.body.tweet_limit == '' || !isInt(req.body.tweet_limit) || (req.body.tweet_limit <= 1)){
                tweet_count = 5;
            }
            else {
                tweet_count = req.body.tweet_limit;
            }
            api_type = 'search/tweets';
            query = {q: tweet_topic, count: tweet_count};
        }
        //Location search api
        else if(req.body.type == 'location'){
            var latitude, longitude, tweet_count; //Initialize important query variables
            if(req.body.latitude == '' || req.body.longitude == ''){
                latitude = 42.7302
                longitude = 73.6788
            }
            else{
                latitude = req.body.latitude;
                longitude = req.body.longitude;
            }
            //If the count has not been set of the count is not an integer
            if(req.body.tweet_limit == '' || !isInt(req.body.tweet_limit) || (req.body.tweet_limit <= 1)){
                tweet_count = 5;
            }
            else {
                tweet_count = req.body.tweet_limit;
            }
            api_type = 'search/tweets'
            query = {q:'', geocode:latitude+','+longitude+',30mi', count: tweet_count, lang:"en"};
        }
        //Get status updates from a particular user
        //Defaults to DT
        else if(req.body.type == 'username'){
            var tweet_username, tweet_count; //Initialize important query variables

            //Error checking
            if(req.body.username == ''){
                tweet_username = "@realDonaldTrump ";
            }
            else{
                tweet_username = req.body.username;
            }
            if(req.body.tweet_limit == '' || !isInt(req.body.tweet_limit) || (req.body.tweet_limit <= 1)){
                tweet_count = 5;
            }
            else {
                tweet_count = req.body.tweet_limit;
            }
            api_type = 'statuses/user_timeline';
            query = {screen_name: tweet_username, count: tweet_count};
        }

        //Make the api call to Twitter
        client.get(api_type, query, function(error, tweets, response) {
            if(error) {
                res.send("There was an error saving the tweets to the database. Try again!");
            }
            else{
                //Error checking + pushing tweets to mongodb
                try{
                   get_tweets(tweets, res, function(error_count){
                   	   if(api_type == 'statuses/user_timeline' && error_count == tweets.length){
                            res.send("There was an error saving the tweets to the database. Try again!");
                       }
	                   else if(api_type == 'search/tweets' && error_count == tweets.statuses.length){
	                        res.send("There was an error saving the tweets to the database. Try again!");
	                   }
	                   else if(error_count != 0){
	                        res.send("There was an error adding at least one tweet to the database.");
	                   }
	                   else{
	                        res.send("Tweets have been added to the database!");
	                   }
                   });
                }
                catch(err){
                    console.log(err);
                    res.send("There was an error saving the tweets to the database. Try again!");
                }
            }
        });
    });

    app.get('/get_tweets', function (req, res) {
        Tweet.find({}, 'twitter.text', function (err, docs) {
            if(err || docs == undefined){
                res.send("Sorry, could not get any tweets from the DB. Please try again later."); //Send tweets to client
                return;
            }
            // console.log(docs);
            res.send(docs); //Send tweets to client
            return;
        });
    });

    app.get('/clear', function (req, res) {
        Tweet.remove(function(err,removed) {
            // Remove all Tweets from database
            res.send("Refreshing");
        });

    });

    //Visualize Tweets Three Different Ways
    //By location, follower level or friends level
    //Follower and friends levels are aggregatations
    //For example, if a twitter user has 50 followers they will be 
    //put into the 0-99 followers category
    app.post('/visualize_function', function(req, res){
        Tweet.find({}, function (err, tweets) {
            if(err || tweets == undefined){
                res.send("Sorry, could not get any tweets from the DB. Please try again later."); //Send tweets to client
                return;
            }

            var dict = {}; //dictionary where keys are levels or locations, values are frequency of tweets that fit these categories
            var keys = []; //list of keys

            //Go through all tweets returned from db
            for(i=0; i<tweets.length; i++){
                //Determine appropriate operation
                if(req.body.q == 'location'){

                    //If key (location) not defined define it, set frequency to 1
                    if(dict[tweets[i].twitter.user_location] == undefined){
                        dict[tweets[i].twitter.user_location] = 1;
                        keys.push(tweets[i].twitter.user_location);
                        console.log(tweets[i].twitter.user_location);
                    }
                    else{
                        //Else, increment frequency of tweets
                        //That fall into a particular location
                        dict[tweets[i].twitter.user_location] += 1;
                    }
                }
                else if(req.body.q == 'friends_count_level'){
                    if(parseInt(tweets[i].twitter.user_friends_count) >= 10000){ //10000

                        //If key (category) not defined define it, set frequency to 1
                        if(dict[">= 10,000"] == undefined){
                            dict[">= 10,000"] = 1;
                            keys.push(">= 10,000");
                            console.log(">= 10,000");
                        }
                        else{
                            //Else, increment frequency of tweets
                            //That fall into a particular category
                            dict[">= 10,000"] += 1;
                        }
                    }
                    else if(parseInt(tweets[i].twitter.user_friends_count) >= 1000){ //10000
                        //If key (category) not defined define it, set frequency to 1
                        if(dict["1,000 - 9,999"] == undefined){
                            dict["1,000 - 9,999"] = 1;
                            keys.push("1,000 - 9,999");
                            console.log("1,000 - 9,999");
                        }
                        else{
                            //Else, increment frequency of tweets
                            //That fall into a particular category
                            dict["1,000 - 9,999"] += 1;
                        }
                    }
                    else if(parseInt(tweets[i].twitter.user_friends_count) >= 100){ //10000
                        if(dict["100 - 999"] == undefined){
                            dict["100 - 999"] = 1;
                            keys.push("100 - 999");
                            console.log("100 - 999");
                        }
                        else{
                            dict["100 - 999"] += 1;
                        }
                    }
                    else{
                        if(dict["0-99"] == undefined){
                            dict["0-99"] = 1;
                            keys.push("0-99");
                            console.log("0-99");
                        }
                        else{
                            dict["0-99"] += 1;
                        }
                    }  
                }
                else if(req.body.q == 'followers_count_level'){

                    if(parseInt(tweets[i].twitter.user_followers_count) >= 10000){ //10000
                        if(dict[">= 10,000"] == undefined){
                            dict[">= 10,000"] = 1;
                            keys.push(">= 10,000");
                            console.log(">= 10,000");
                        }
                        else{
                            dict[">= 10,000"] += 1;
                        }
                    }
                    else if(parseInt(tweets[i].twitter.user_followers_count) >= 1000){ //10000
                        if(dict["1,000 - 9,999"] == undefined){
                            dict["1,000 - 9,999"] = 1;
                            keys.push("1,000 - 9,999");
                            console.log("1,000 - 9,999");
                        }
                        else{
                            dict["1,000 - 9,999"] += 1;
                        }
                    }
                    else if(parseInt(tweets[i].twitter.user_followers_count) >= 100){ //10000
                        if(dict["100 - 999"] == undefined){
                            dict["100 - 999"] = 1;
                            keys.push("100 - 999");
                            console.log("100 - 999");
                        }
                        else{
                            dict["100 - 999"] += 1;
                        }
                    }
                    else{
                        if(dict["0-99"] == undefined){
                            dict["0-99"] = 1;
                            keys.push("0-99");
                            console.log("0-99");
                        }
                        else{
                            dict["0-99"] += 1;
                        }
                    }
                }
                else{
                    res.send("Sorry an error occured!");
                    return;
                }
                //Send array back to client, first element the dictionary and the second keys array
                //Used to index dictionary
                if(i == tweets.length-1){
                    res.send([dict,keys]);
                    return;
                }
            }
        });
    });
};
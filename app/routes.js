var Twitter = require('twitter');
var fs = require('fs');
var js2xmlparser = require("js2xmlparser");

var twitter = {
    created_at: "",
    id:"",
    tweet:"",
    user_id:"",
    user_name:"",
    user_screen_name:"",
    user_location:"",
    user_followers_count:"",
    user_friends_count:"",
    user_created_at:"",
    user_time_zone:"",
    user_profile_background_color:"",
    user_profile_image_url:"",
    geo:"",
    coordinates:"",
    place:""
};

module.exports = function(app, express) {

    function get_tweets(tweets, req, res, callback){
        var error_count = 0;

        //Assume search api is being called
        var search_api = true;

        console.log(tweets);

        //tweets.statuses undefined means its not the search api
		if(tweets.statuses == undefined){
            search_api = false;
            console.log('Status API...');
        }

        //Case where no tweets returned for search api
        if(tweets.statuses != undefined){
        	if(tweets.statuses.length == 0){
        		console.log("Error 103");
        		res.send("Sorry there was an error!");
        	}
        }

        //Case where no tweets are returned for status timeline api
        if(tweets != undefined){
        	if(tweets.length == 0){
        		console.log("Error 104");
        		res.send("Sorry there was an error!");
        	}
        }


        //estalish array in session to hold data
        req.session.tweets_pa = [];

        //Status timeline api for a particular user : parsing and saving to mongodb
        if(search_api == false){
            var remaining = tweets.length;

            for (var i = 0; i < tweets.length; i++) {
                
                twitter.created_at = tweets[i].created_at;
                twitter.id = tweets[i].id;
                twitter.text = tweets[i].text;
                twitter.user_id = tweets[i].user.id;
                twitter.user_name = tweets[i].user.name;
                twitter.user_screen_name = tweets[i].user.screen_name;
                twitter.user_location = tweets[i].user.location;
                twitter.user_followers_count = tweets[i].user.followers_count;
                twitter.user_friends_count = tweets[i].user.friends_count;
                twitter.user_created_at = tweets[i].user.created_at;
                twitter.user_time_zone = tweets[i].user.time_zone;
                twitter.user_profile_background_color = tweets[i].user.profile_background_color;
                twitter.user_profile_image_url = tweets[i].user.profile_image_url;
                twitter.geo = tweets[i].geo;
                twitter.coordinates = tweets[i].coordinates;
                twitter.place = tweets[i].place;
                req.session.tweets_pa.push([twitter.created_at,twitter.id,twitter.text,twitter.user_id,twitter.user_name,twitter.user_screen_name,twitter.user_location,twitter.user_followers_count,twitter.user_friends_count,twitter.user_created_at,twitter.user_time_zone,twitter.user_profile_background_color,twitter.user_profile_image_url,twitter.geo,twitter.coordinates,twitter.place])

                //Save tweets to database
                // tweet.save(function (err, results) {
                remaining --;
                if(remaining == 0) {
                    // console.log(req.session);
                    callback(error_count);
                }
                // });
            }
        }
        //Search api for a particular topic or location : parsing and saving to mongodb
        else {
            var remaining = tweets.statuses.length;
            for (var i = 0; i < tweets.statuses.length; i++) {
                twitter.created_at = tweets.statuses[i].created_at;
                twitter.id = tweets.statuses[i].id;
                twitter.text = tweets.statuses[i].text;
                twitter.user_id = tweets.statuses[i].user.id;
                twitter.user_name = tweets.statuses[i].user.name;
                twitter.user_screen_name = tweets.statuses[i].user.screen_name;
                twitter.user_location = tweets.statuses[i].user.location;
                twitter.user_followers_count = tweets.statuses[i].user.followers_count;
                twitter.user_friends_count = tweets.statuses[i].user.friends_count;
                twitter.user_created_at = tweets.statuses[i].user.created_at;
                twitter.user_time_zone = tweets.statuses[i].user.time_zone;
                twitter.user_profile_background_color = tweets.statuses[i].user.profile_background_color;
                twitter.user_profile_image_url = tweets.statuses[i].user.profile_image_url;
                twitter.geo = tweets.statuses[i].geo;
                twitter.coordinates = tweets.statuses[i].coordinates;
                twitter.place = tweets.statuses[i].place;
                req.session.tweets_pa.push([twitter.created_at,twitter.id,twitter.text,twitter.user_id,twitter.user_name,twitter.user_screen_name,twitter.user_location,twitter.user_followers_count,twitter.user_friends_count,twitter.user_created_at,twitter.user_time_zone,twitter.user_profile_background_color,twitter.user_profile_image_url,twitter.geo,twitter.coordinates,twitter.place])

                //Save tweets to database
                // tweet.save(function (err, results) {
                remaining --;
                if(remaining == 0) {
                    // console.log(req.session);
                    callback(error_count);
                }
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

    // //Tweet text and data (to output to JSON file)
    // req.session.tweets_fr = []
    
    //Twitter credentials
    var client = new Twitter({
      consumer_key: 'XXXXXXXXXXX',
      consumer_secret: 'XXXXXXXXXXX',
      access_token_key: 'XXXXXXXXXXX',
      access_token_secret: 'XXXXXXXXXXX'
    });

    app.get('/', function (req, res) {
        res.render('index.html');
    });

    app.get('/visualize', function (req, res) {
        res.render('visualize.html');
    });

    app.get('/download/json', function (req, res) {
       res.download('./twitter.json');
    });

    app.get('/download/xml', function (req, res) {
       res.download('./twitter.xml');
    });

    app.get('/download/csv', function (req, res) {
       res.download('./twitter.csv');
    });

    //CSV, XML, and JSON Conversion Code
    app.post('/export',function (req, res) {

        //formatted array of tweets for exporting
        req.session.tweets_fr = [];

        //Retrieve all tweets
        //Push into an array that can be accessed by all conversion code
        for(var i = 0; i< req.session.tweets_pa.length; i++){
            req.session.tweets_fr.push({"created_at":req.session.tweets_pa[i][0], "id":req.session.tweets_pa[i][1], "text":req.session.tweets_pa[i][2], "user_id":req.session.tweets_pa[i][3], "user_name":req.session.tweets_pa[i][4], "user_screen_name":req.session.tweets_pa[i][5], "user_location":req.session.tweets_pa[i][6], "user_followers_count":req.session.tweets_pa[i][7], "user_friends_count":req.session.tweets_pa[i][8], "user_created_at":req.session.tweets_pa[i][9], "user_time_zone":req.session.tweets_pa[i][10],"user_profile_background_color":req.session.tweets_pa[i][11],"user_profile_image_url":req.session.tweets_pa[i][12],"geo":req.session.tweets_pa[i][13],"coordinates":req.session.tweets_pa[i][14],"place":req.session.tweets_pa[i][15]}); //Add each tweet to an array
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
            fs.writeFile('twitter.json', JSON.stringify(req.session.tweets_fr), function(err) {
                if(err){
                    console.log(err);
                }
                else{
                    res.send('/download/json'); 
                }
                //Clear the tweets array so that the user can get a new stream of tweets and export
                //that stream if they so choose to
                req.session.tweets_fr = [];
                return;
            });
        }
        //-----> XML CONVERSION CODE <STILL NOT WORKING PROPERLY>
        else if(req.body.format == "XML"){
            xmlString = js2xmlparser.parse("tweet", req.session.tweets_fr);
            fs.writeFile('twitter.xml', xmlString, function(err) {
                if(err){
                    console.log(err);
                }
                else{
                    res.send('/download/xml'); 
                }
                //Clear the tweets array so that the user can get a new stream of tweets and export
                //that stream if they so choose to
                req.session.tweets_fr = [];
                return; 
            });
        }
        //-----> CSV CONVERSION CODE
        else if(req.body.format == "CSV"){
            //Create CSV header row
            var str = '"created_at","id","text","user_id","user_name","user_screen_name","user_location","user_followers_count","user_friends_count","user_created_at","user_time_zone","user_profile_background_color","user_profile_image_url","geo","coordinates","place"\n';
            // Loop through tweets array
            // Create CSV formatted string
            for(i=0; i<req.session.tweets_fr.length; i++){
                var tweet_text = (req.session.tweets_fr[i].text).trim();
                str+= req.session.tweets_fr[i].created_at + ',' + req.session.tweets_fr[i].id + ',' +  '"' + tweet_text + '"' + ',' + req.session.tweets_fr[i].user_id + ',' + req.session.tweets_fr[i].user_name + ',' + req.session.tweets_fr[i].user_screen_name + ',' + '"' + req.session.tweets_fr[i].user_location + '"' + ',' + req.session.tweets_fr[i].user_followers_count + ',' + req.session.tweets_fr[i].user_friends_count + ',' + req.session.tweets_fr[i].user_created_at + ',' + req.session.tweets_fr[i].user_time_zone + ',' + req.session.tweets_fr[i].user_profile_background_color + ',' + req.session.tweets_fr[i].user_profile_image_url + ',' + req.session.tweets_fr[i].geo + ',' + req.session.tweets_fr[i].coordinates + ',' + req.session.tweets_fr[i].place + '\n';
            }
            //Actually write to the file the CSV string
            fs.writeFile('twitter.csv', str, function(err) {
                if(err){
                    console.log(err);
                }
                else{
                    res.send('/download/csv'); 
                }
                //Clear the tweets array so that the user can get a new stream of tweets and export
                //that stream if they so choose to
                req.session.tweets_fr = []; 
                return;
            });
        }
    });

    app.post('/build_tweet_db', function (req, res) {
        req.session.tweets_pa = [];

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
            if(req.body.tweet_limit == '' || !isInt(req.body.tweet_limit) || (req.body.tweet_limit <= 1) || (req.body.tweet_limit > 50)){
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
            if(req.body.tweet_limit == '' || !isInt(req.body.tweet_limit) || (req.body.tweet_limit <= 1) || (req.body.tweet_limit > 50)){
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
            if(req.body.tweet_limit == '' || !isInt(req.body.tweet_limit) || (req.body.tweet_limit <= 1) || (req.body.tweet_limit > 50)){
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
                   get_tweets(tweets, req, res, function(error_count){
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
        if(req.session.tweets_pa.length >= 1){
            res.send(req.session.tweets_pa);
            return;
        }
        else{
            res.send("Sorry, could not get any tweets from the DB. Please try again later."); //Send tweets to client
            return; 
        }
    });

    app.get('/clear', function (req, res) {
        req.session.tweets_pa = [];
        res.send("Refreshing");
    });

    //Visualize Tweets Three Different Ways
    //By location, follower level or friends level
    //Follower and friends levels are aggregatations
    //For example, if a twitter user has 50 followers they will be 
    //put into the 0-99 followers category
    app.post('/visualize_function', function(req, res){
        // Tweet.find({}, function (err, tweets) {
            // if(err || tweets == undefined){
            //     res.send("Sorry, could not get any tweets from the DB. Please try again later."); //Send tweets to client
            //     return;
            // }

            var dict = {}; //dictionary where keys are levels or locations, values are frequency of tweets that fit these categories
            var keys = []; //list of keys

            //Go through all tweets returned from db
            for(i=0; i<req.session.tweets_pa.length; i++){
                //Determine appropriate operation
                if(req.body.q == 'location'){

                    //If key (location) not defined define it, set frequency to 1
                    if(dict[req.session.tweets_pa[i][6]] == undefined){
                        dict[req.session.tweets_pa[i][6]] = 1;
                        keys.push(req.session.tweets_pa[i][6]);
                        console.log(req.session.tweets_pa[i][6]);
                    }
                    else{
                        //Else, increment frequency of tweets
                        //That fall into a particular location
                        dict[req.session.tweets_pa[i][6]] += 1;
                    }
                }
                else if(req.body.q == 'friends_count_level'){
                    if(parseInt(req.session.tweets_pa[i][8]) >= 10000){ //10000

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
                    else if(parseInt(req.session.tweets_pa[i][8]) >= 1000){ //10000
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
                    else if(parseInt(req.session.tweets_pa[i][8]) >= 100){ //10000
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

                    if(parseInt(req.session.tweets_pa[i][7]) >= 10000){ //10000
                        if(dict[">= 10,000"] == undefined){
                            dict[">= 10,000"] = 1;
                            keys.push(">= 10,000");
                            console.log(">= 10,000");
                        }
                        else{
                            dict[">= 10,000"] += 1;
                        }
                    }
                    else if(parseInt(req.session.tweets_pa[i][7]) >= 1000){ //10000
                        if(dict["1,000 - 9,999"] == undefined){
                            dict["1,000 - 9,999"] = 1;
                            keys.push("1,000 - 9,999");
                            console.log("1,000 - 9,999");
                        }
                        else{
                            dict["1,000 - 9,999"] += 1;
                        }
                    }
                    else if(parseInt(req.session.tweets_pa[i][7]) >= 100){ //10000
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
                if(i == req.session.tweets_pa.length-1){
                    res.send([dict,keys]);
                    return;
                }
            }
        });
    // });
};

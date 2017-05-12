I did a pretty large redesign of the landing page as far as functionality is concerned and layout to some degree as well. First and foremost, after tweets are put into the db they are automatically displayed on the page. I thought this was more intutive then having the users have to click a second button just to see the tweets. Additionally, I put some togggle buttons on the page to only display the information the user needs to see at any particular period of time. 

As far as analytics is concerned, I used the Google Analytics library (same library I used for my SingleStream project). I created functions for analyzing tweets by location, follower level, and friends level -- all of which are explained in the code and on the html page.

To get the twitter scraper running all you should have to do is type npm install and then go to localhost:3000. A mongodb db and collection should be configured automatically.

-John
# Twitter Scraper

The app is written in Node.js and uses the Twitter Rest API to extract, filter, and display tweets. Tweets can be filtered by location, username, or topic. The documentation for the Twitter Rest API can be found [here!](https://dev.twitter.com/rest/public)

In order to use this twitter scraper you must register as a Twitter developer and fill in the consumer_key, consumer_secret, access_token_key, and access_token_secret fields in the `app/routes.js` file. To register as a Twitter developer [click here.](https://dev.twitter.com/index)

## Installation Instructions

To run this app you must have [Node.js](https://nodejs.org/en/download/) and [npm](https://www.npmjs.com/get-npm) installed. 

After you have cloned this repository to your machine:

1.  Navigate to the directory of the repository
2.  Open the app/routes.js file using a text editor and insert your Twitter developer consumer_key, consumer_secret, access_token_key, and access_token_secret (lines 144-147). Remember to save the changes.
2.  Open a terminal and run `npm install`
3.  Run `npm start` (this will start the server)
4.  Open a web browser and in the url bar enter "http://localhost:8080"
5.  Begin downloading and visualizing tweets!

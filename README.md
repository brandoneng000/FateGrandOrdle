# Fate/Grand Ordle

## Overview

FGOrdle is a Wordle-like game that uses characters from Fate/Grand Order instead of 5 letter words. The website informs the player on what aspects of the character they picked are correct. When the player either picks the correct daily character or uses up their 8 guesses then the daily character is revealed. Users can also create and account to maintain their current wins and how many times they have played.

Built with microservice architecture in mind, the frontend of the website is HTML, CSS, and Javascript while the character information is stored using MongoDB. An API made with Flask retrieves this character information for the website. The MongoDB is updated through a cron job and AWS Lambda function. Account creation and sign in is stored in an SQLite DB, and the information is processed through a separate API made with Flask. Afterwards, the API then authenticates users with a JWT (JSON Web Token).
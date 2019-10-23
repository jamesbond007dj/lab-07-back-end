'use strict'

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const superagent = require('superagent');

app.use(cors());

const PORT = process.env.PORT || 3003;


app.get('/location', handleLocation);
app.get('/weather', handleWeather);
app.get('*', handleError);


//cached data:
let storedUrls = {};



function handleLocation(request, response) {
  console.log(`this is line 25`, request.query.data);
  const location = request.query.data;
  console.log(`location: ${location}`);
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${process.env.GEOCODE_API_KEY}`;

  if (storedUrls[url]) {
    console.log('using cached url');
    response.send(storedUrls[url]);
  } else {
    console.log('making the api call to get the data');
    superagent.get(url)
      .then(resultsFromSuperagent => {
        console.log(resultsFromSuperagent.body);
        const locationObject = new Location(location, resultsFromSuperagent.body);
        storedUrls[url] = locationObject;
        response.status(200).send(locationObject);
      })
      .catch(error => {
        console.error('Error');
      });
  };
}

// function locationData(city) {
//   // const geoData = require('./data/geo.json');
//   // console.log(geoData);
//   const locationObject = new Location(city, geoData);
//   return locationObject;
// }

function Location(location, geoData) {
  this.search_query = location;
  this.formatted_query = geoData.formatted_address;
  this.latitude = geoData.geometry.location.lat;
  this.longitude = geoData.geometry.location.lng;
}

function handleWeather(request, response) {
  const darkskyData = require('./data/darksky.json')
  const tempArray = [];

  darkskyData.daily.data.forEach(object => {
    let tempValue = new Weather(object);
    tempArray.push(tempValue);
  })
  try {
    response.status(200).send(tempArray);
  }
  catch (error) {
    Error(error, response)
  }
};


function Weather(object) {
  this.forecast = object.summary
  this.time = this.revisedDate(object.time);
}

Weather.prototype.revisedDate = function (time) {
  let date = new Date(time * 1000);
  return date.toDateString()
}

function Error(error, response) {
  console.error(error);
  return response.status(500).send('Sorry, there is a temporary problem.Please try it later.');
}

function handleError(request, response) {
  response.status(404);
  response.send('Server connection problem');
};

app.listen(PORT, () => console.log(`app is listening on ${PORT}`));


'use strict'

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const superagent = require('superagent')


app.use(cors());

const PORT = process.env.PORT || 3003

app.get('/location', (request, response) => {
  try {
    const city = request.query.data;
    const location = locationData(city);
    console.log(location);
    response.send(location);
  }
  catch (error) {
    Error(error, response);
  }
});



function locationData(city) {
  const geoData = require('./data/geo.json');
  console.log(geoData);
  const locationObject = new Location(city, geoData);
  return locationObject;
}

function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData.results[0].formatted_address;
  this.latitude = geoData.results[0].geometry.location.lat;
  this.longitude = geoData.results[0].geometry.location.lng;
}


app.get('/weather', (request, response) => {
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
});

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

app.get('*', (request, response) => {
  response.status(404);
  response.send('Server connection problem');
});

app.listen(PORT, () => console.log(`app is listening on ${PORT}`));


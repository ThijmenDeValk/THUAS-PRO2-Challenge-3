/*
 *  SPACEX Big Martian Dome Clock
 *  MADE BY THIJMEN
 *
 *  TABLE OF CONTENTS:
 *  1. HELPER THINGS
 *  2. CLOCK CLASS
 *  3. INITIALIZE
 */

const weatherApiKey = 'f4d70530ba2bd5a0a070506901e28268';
const mapsboxApiKey = 'pk.eyJ1IjoidGhpam1lbi10aHVhcyIsImEiOiJja2JydzFqenEyNzk4MnRyNXlhcmV3YjdyIn0.afMokbRcTFYI_Ef4r4UkaQ';

const startingPosition = [-80.5648, 28.4734]; // Cape Canaveral

const locationElement = document.querySelector('.location');
const marker = new mapboxgl.Marker();

function getLocationInfo(coordinates) {
  fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates.lng},${coordinates.lat}.json?types=place,locality,region,country&access_token=${mapsboxApiKey}`)
    .then((response) => response.json())
    .then((json) => {
      console.log(json);

      const target = locationElement.querySelector('h2');

      target.innerHTML = (json.features && json.features[0] && json.features[0].place_name) || '<i>unknown</i>';
      target.title = (json.features && json.features[0] && json.features[0].place_name) || 'unknown';
    });
}

function getWeatherData(coordinates) {
  fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${coordinates.lat}&lon=${coordinates.lng}&units=metric&exclude=daily&appid=${weatherApiKey}`)
    .then((response) => response.json())
    .then((json) => {
      console.log(json);
      locationElement.querySelector('img').src = `http://openweathermap.org/img/wn/${json.current.weather[0].icon}@2x.png`;
    });
}

function handleLocationChange(coordinates) {
  locationElement.querySelector('h1').innerHTML = `${coordinates.lng.toFixed(4)}, ${coordinates.lat.toFixed(4)}`;
  getWeatherData(coordinates);
  getLocationInfo(coordinates);
  marker
    .setLngLat(coordinates)
    .addTo(map);
}

mapboxgl.accessToken = mapsboxApiKey;

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/thijmen-thuas/ckbscyom474gb1jqqcbg5sl7f',
  center: [-80.5648, 28.4734],
  zoom: 5,
});

const nav = new mapboxgl.NavigationControl({ showCompass: false });
map.addControl(nav, 'bottom-right');

handleLocationChange({ lng: startingPosition[0], lat: startingPosition[1] });

map.on('click', (e) => {
  map.flyTo({ center: e.lngLat });
  handleLocationChange(e.lngLat);
});

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
const weatherElement = document.querySelector('.weather');
const windElement = document.querySelector('.wind');
const marker = new mapboxgl.Marker();

function getLocationData(coordinates) {
  fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates.lng},${coordinates.lat}.json?types=place,locality,region,country&access_token=${mapsboxApiKey}`)
    .then((response) => response.json())
    .then((json) => {
      // Figure out what this place is called
      const target = locationElement.querySelector('h2');

      target.innerHTML = (json.features && json.features[0] && json.features[0].place_name) || '<i>unknown</i>';
      target.title = (json.features && json.features[0] && json.features[0].place_name) || 'unknown';
    });
}

function getWeatherData(coordinates) {
  fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${coordinates.lat}&lon=${coordinates.lng}&units=metric&exclude=daily&appid=${weatherApiKey}`)
    .then((response) => response.json())
    .then((json) => {
      // LOCAL TIME
      // We need the time in UTC, in seconds sinds epoch, so we can calculate timezone offset
      const now = new Date();
      const localTimeSinceEpoch = now.getTime() + json.timezone_offset * 1000;
      const localTime = new Date(localTimeSinceEpoch);

      locationElement.querySelector('time').innerHTML = `${localTime.getUTCHours().toString().padStart(2, '0')}:${localTime.getUTCMinutes().toString().padStart(2, '0')}`;

      // WEATHER ICON
      const imageTarget = weatherElement.querySelector('img');
      imageTarget.src = `http://openweathermap.org/img/wn/${json.current.weather[0].icon}@2x.png`;
      imageTarget.title = json.current.weather[0].description;

      // TEMPERATURE
      weatherElement.querySelector('.weather__temperature b').innerHTML = json.current.temp.toFixed(1);

      // WIND
      windElement.querySelector('.wind__direction').style.transform = `rotate(${json.current.wind_deg}deg)`;
      windElement.querySelector('.wind__speed b').innerHTML = json.current.wind_speed.toFixed(1);
    });
}

function handleLocationChange(coordinates) {
  // Update the coordinates
  locationElement.querySelector('h1').innerHTML = `${coordinates.lng.toFixed(4)}, ${coordinates.lat.toFixed(4)}`;

  // Call our APIs and update screen
  getWeatherData(coordinates);
  getLocationData(coordinates);

  // Place marker on new location
  marker
    .setLngLat(coordinates)
    .addTo(map);
}

/*
 * MAPBOX SETUP & INIT
 */
mapboxgl.accessToken = mapsboxApiKey;

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/thijmen-thuas/ckbscyom474gb1jqqcbg5sl7f',
  center: [-80.5648, 28.4734],
  zoom: 5,
});

// Add zoom controls
const nav = new mapboxgl.NavigationControl({ showCompass: false });
map.addControl(nav, 'bottom-right');

// Start by calling the APIs once on page load...
handleLocationChange({ lng: startingPosition[0], lat: startingPosition[1] });

// ... and then everytime you click somewhere
map.on('click', (e) => {
  map.flyTo({ center: e.lngLat });
  handleLocationChange(e.lngLat);
});

const { workerData, parentPort } = require('worker_threads');
const geolib = require('geolib');
const { isDeepStrictEqual } = require('util');

parentPort.on('message', (data) => {
  try {
    cities = Array.from(data.workerData.cache.cities);
    console.log('cities size:', cities.length);
    city_coords = data.workerData.cache.city_coords;
    city = data.workerData.city;
    maxMiles = data.workerData.miles;
    console.log(`maxMiles: ${maxMiles}`);
    // coordinates: { latitude: 51.5004439, longitude: -0.1265398 } 
    cityMiles = {}
    for (c of cities) {
      cityMiles[c] = 0;
    }
    let nearCities = cities.filter(c => {
      if (c == city) return true;
      const distance = geolib.getDistance(
        city_coords[city],
        city_coords[c],
        1 // accuracy in meters
      );
      const distanceMiles = geolib.convertDistance(distance, 'mi');
      cityMiles[c] = distanceMiles;
      return distanceMiles <= maxMiles;
    });
    nearCities = new Set(nearCities);
    console.log(`nearCities size: ${nearCities.size}`)
    const groups = data.workerData.cache.groups;
    temp_result = groups.filter(g => {
      const c = g.city;
      if (!c) return false;
      if (nearCities.has(c.toLowerCase())) {
        g['miles'] = cityMiles[c.toLowerCase()];
        return true;
      }
      return false;
    });
    // distinct groups
    result = []
    idSet = new Set();
    for (g of temp_result) {
      if (!(idSet.has(g.group_id))) {
        result.push(g)
        idSet.add(g.group_id)
      }
    }
    result.sort((a, b) => a.miles - b.miles);
    parentPort.postMessage({ result });
  } catch (error) {
    console.log(error);
  }

}); 
const express = require('express');
const { Worker } = require('worker_threads')
const mongodb = require('./db');
var cors = require("cors");

const app = express();
app.use(cors());
const port = 3000;
const groups_cache = {
  groups: [],
  cities: new Set(),
  city_coords: {}
}
let worker = null;

app.get('/', async (req, res) => {
  res.send('Hello');
});

app.get('/cities/:state', async (req, res) => {
  const stateCode = req.params.state;
  if (!stateCode) {
    res.send('no state code!');
    return;
  }
  /* It's slow to get cities from db
  const database = mongodb.getDb();
  const towns = database.collection('towns');
  const cities = await towns.find().limit(Number.MAX_SAFE_INTEGER).toArray();*/
  // get cities from groups cache
  results = [];
  const citySet = new Set();
  for (g of groups_cache.groups) {
    if (g['state_code'] == stateCode.toUpperCase() && !citySet.has(g['city'])) {
      results.push({ name: g['city'], latitude: g['latitude'], longitude: g['longitude'] });
      citySet.add(g['city']);
    }
  }
  res.send(JSON.stringify(results));
});

app.get('/worker/:city/:miles', async (req, res) => {
  const start = Date.now();
  if (!req.params.city) {
    res.send({ msg: 'no city provided' })
    return;
  }
  if (!req.params.miles || !Number.isInteger(Number(req.params.miles))) {
    res.send({ msg: 'no miles provided' })
    return;
  }
  const city = req.params.city.toLowerCase();
  const miles = Number(req.params.miles);
  console.log(`args => city: ${city}, miles: ${miles}`);
  const result = await runworkerThreadService({
    cache: groups_cache,
    city,
    miles,
  });
  const end = Date.now();
  console.log(`The request took ${end - start} mili-seconds.`);
  res.send(JSON.stringify(result));
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);

  mongodb.connectToServer(function (err) {
    if (err) {
      console.error(err);
      return;
    }
    init();
  });
});

async function init() {
  // init worker
  // consider using worker threads pool if the data size increased a lot
  // currently from testing one worker is enough 
  worker = new Worker("./worker.js");
  worker.setMaxListeners(1000);

  // in order to increasing the working performance
  // prepar the data in memory cache
  const database = mongodb.getDb();
  const groups = database.collection('groups_ma');
  const groups_ma = await groups.find().limit(Number.MAX_SAFE_INTEGER).toArray();
  groups_cache.groups.push(...groups_ma);
  for (group of groups_ma) {
    group['latitude'] = Number(group['latitude'])
    group['longitude'] = Number(group['longitude'])
    if (group['city']) {
      groups_cache.cities.add(group['city'].toLowerCase())
      groups_cache.city_coords[group['city'].toLowerCase()] = {
        latitude: group['latitude'],
        longitude: group['longitude'],
      }
    }
  }
}


function runworkerThreadService(workerData) {
  return new Promise((resolve, reject) => {
    //const worker = new Worker("./worker.js");
    worker.postMessage({ workerData });
    worker.on("message", (data) => {
      //console.log("msg:" + JSON.stringify(data));
      //worker.terminate();
      return resolve(data);
    });
    worker.on("error", reject);
    worker.on("exit", (code) => {
      console.log(`worker exit: ${code}`);
      if (code !== 0) reject(new Error(`worker thread stoped with code: ${code}`))
    });
  });
}


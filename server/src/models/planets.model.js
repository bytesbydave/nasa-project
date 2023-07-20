const { parse } = require('csv-parse');
const path = require('path');
const fs = require('fs');

const planets = require('./planets.mongo');

const isHabitablePlanet = (planet) => {
  return (
    planet['koi_disposition'] === 'CONFIRMED' &&
    planet['koi_insol'] > 0.36 &&
    planet['koi_insol'] < 1.11 &&
    planet['koi_prad'] < 1.6
  );
};

function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, '..', '..', 'data', 'kepler_data.csv')
    )
      .pipe(
        parse({
          comment: '#',
          columns: true,
        })
      )
      .on('data', async (data) => {
        if (isHabitablePlanet(data)) {
          savePlanet(data);
        }
      })
      .on('error', (err) => {
        console.log(err);
        reject(err);
      })
      .on('end', async () => {
        const countPlanetsFound = (await getAllPlanets()).length;
        console.log(`habitable planets: ${countPlanetsFound}`);
        resolve();
      });
  });
}

async function savePlanet(planet) {
  try {
    // insert + update = upsert
    await planets.updateOne(
      { keplerName: planet.kepler_name },
      { keplerName: planet.kepler_name },
      { upsert: true }
    );
  } catch (err) {
    console.error(`could not save planet. Error: ${err}`);
  }
}

async function getAllPlanets() {
  // find allows to search for specific values
  return await planets.find(
    {},
    {
      _id: 0,
      __v: 0,
    }
  );
  // return await planets.find({});
}

module.exports = {
  loadPlanetsData,
  getAllPlanets,
};

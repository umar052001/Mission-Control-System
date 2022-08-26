const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse");

const planets = require("./planets.mongo");

function habitablePlanets(planets) {
  return (
    planets["koi_disposition"] === "CONFIRMED" &&
    planets["koi_insol"] < 1.11 &&
    planets["koi_insol"] > 0.36 &&
    planets["koi_prad"] < 1.6
  );
}

function loadPlanets() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, "..", "..", "data", "kepler_data.csv")
    )
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", async (data) => {
        if (habitablePlanets(data)) {
          savePlanet(data);
        }
      })
      .on("error", (err) => {
        console.log(err);
        reject(err);
      })
      .on("end", async () => {
        const countPlanetsHabitable = (await getAllPlanets()).length;
        console.log(`${countPlanetsHabitable} habitable planets found!`);
        resolve();
      });
  });
}

async function getAllPlanets() {
  return await planets.find({});
}

async function savePlanet(planet) {
  // insert + update = upsert (for not duplicating existing ones)
  try {
    await planets.updateOne(
      {
        keplerName: planet.kepler_name,
      },
      {
        keplerName: planet.kepler_name,
      },
      {
        upsert: true,
      }
    );
  } catch (error) {
    console.error(`Could not save the planet ${error}`);
  }
}

module.exports = {
  loadPlanets,
  getAllPlanets,
};

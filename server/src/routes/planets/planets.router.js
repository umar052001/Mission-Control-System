const express = require("express");
const { httpGetPlanets } = require("./planets.controller");

const planetRouter = express.Router();

planetRouter.get("/", httpGetPlanets);

module.exports = planetRouter;

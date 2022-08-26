const express = require("express");

const planetRouter = require("./planets/planets.router");
const launchesRouter = require("./launches/launches.router");

api = express.Router();

api.use("/planets", planetRouter);
api.use("/launches", launchesRouter);

module.exports = api;

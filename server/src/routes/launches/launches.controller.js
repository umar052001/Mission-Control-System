const {
  getAllLaunches,
  scheduleNewLaunch,
  existLaunchCheck,
  abortLaunchByID,
} = require("../../models/launches.model");

const { getPagination } = require("../../services/query");

async function httpGetAllLaunches(req, res) {
  const { skip, limit } = getPagination(req.query);
  return res.status(200).json(await getAllLaunches(skip, limit));
}

async function httpAddNewLaunch(req, res) {
  const launch = req.body;
  if (
    !launch.mission ||
    !launch.target ||
    !launch.launchDate ||
    !launch.rocket
  ) {
    return res.status(400).json({
      error: "Missing launch data",
    });
  }

  launch.launchDate = new Date(launch.launchDate);

  if (isNaN(launch.launchDate)) {
    return res.status(400).json({ error: "Invalid launch date" });
  }
  try {
    await scheduleNewLaunch(launch);
    return res.status(201).json(launch);
  } catch (error) {
    console.log(`Error is ${error}`);
  }
}

async function httpAbortLaunch(req, res) {
  const launchId = Number(req.params.id);

  const existLaunch = await existLaunchCheck(launchId);
  if (!existLaunch) {
    return res.status(404).json({ error: "Launch not exist" });
  }
  const aborted = await abortLaunchByID(launchId);

  if (!aborted) {
    return res.status(400).json({
      error: "Launch not aborted",
    });
  }

  return res.status(200).json({
    ok: true,
  });
}
module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
};

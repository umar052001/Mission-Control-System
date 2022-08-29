const request = require("supertest");
const app = require("../../app");
const { loadPlanets } = require("../../models/planets.model");
const { mongoConnect, mongoDisconnect } = require("../../services/mongo");

describe("Launches API", () => {
  beforeAll(async () => {
    await mongoConnect();
    await loadPlanets();
  });
  afterAll(async () => {
    await mongoDisconnect();
  });

  describe("Test GET /launches", () => {
    test("should respond with response 200", async () => {
      const response = await request(app)
        .get("/v1/launches")
        .expect("Content-Type", /json/)
        .expect(200);
    });
  });

  describe("Test POST /launch", () => {
    const completeLaunchData = {
      mission: "Test launch",
      target: "Kepler-452 b",
      rocket: "NCC 170",
      launchDate: "January 4, 2030",
    };
    const launchDateRemoved = {
      mission: "Test launch",
      target: "Kepler-452 b",
      rocket: "NCC 170",
    };
    const launchDataWithInvalidDate = {
      mission: "Test launch",
      target: "Kepler-452 b",
      rocket: "NCC 170",
      launchDate: "heloooo",
    };

    test("should respond with response 201 created", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(completeLaunchData)
        .expect("Content-Type", /json/)
        .expect(201);

      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();

      expect(responseDate).toBe(requestDate);
      expect(response.body).toMatchObject(launchDateRemoved);
    });

    test("should catch missing required properties", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDateRemoved)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "Missing launch data",
      });
    });

    test("should catch invalid date property", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDataWithInvalidDate)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({ error: "Invalid launch date" });
    });
  });
});

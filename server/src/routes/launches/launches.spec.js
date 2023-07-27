const request = require('supertest');
const app = require('../../app');
const { mongoConnect, mongoDisconnect } = require('../../services/mongo');
const { loadPlanetsData } = require('../../models/planets.model');

describe('Launches API', () => {
  beforeAll(async () => {
    await mongoConnect();
    await loadPlanetsData();
  });

  // afterAll(async () => {
  //   await mongoDisconnect();
  // });

  describe('GET /launches', () => {
    it('should respond with 200 success', async () => {
      const response = await request(app).get('/v1/launches');
      expect(response.status).toBe(200);
    });
  });

  describe('POST /launches', () => {
    const completeLaunchData = {
      mission: 'TEST MISSION',
      rocket: 'TEST ROCKET',
      target: 'Kepler-62 f',
      launchDate: 'January 1, 2030',
    };

    const launchDataWithoutDate = {
      mission: 'TEST MISSION',
      rocket: 'TEST ROCKET',
      target: 'Kepler-62 f',
    };

    const launchDataWithInvalidDate = {
      mission: 'TEST MISSION',
      rocket: 'TEST ROCKET',
      target: 'Kepler-62 f',
      launchDate: 'balls',
    };

    it('should respond with 201 created', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(completeLaunchData)
        .expect('Content-Type', /json/)
        .expect(201);

      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();
      expect(responseDate).toBe(requestDate);
      expect(response.body).toMatchObject(launchDataWithoutDate);
    });

    it('should catch missing required properties', async () => {
      const errorResponse = { error: 'Missing required launch property' };
      const response = await request(app)
        .post('/v1/launches')
        .send(launchDataWithoutDate)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toStrictEqual(errorResponse);
    });

    it('should catch invalid dates', async () => {
      const errorResponse = { error: 'Invalid launch Date' };
      const response = await request(app)
        .post('/v1/launches')
        .send(launchDataWithInvalidDate)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toStrictEqual(errorResponse);
    });
  });
});

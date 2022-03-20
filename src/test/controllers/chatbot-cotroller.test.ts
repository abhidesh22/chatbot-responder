import request = require('supertest');
import { app } from '../../app';

let userId!: string;

it('fails when a name does not exist in the request', async () => {
    await request(app)
      .post('/play-challenge')
      .send({
        email: 'test@test.com'
      })
      .expect(400);
  });

  it('fails when a name does not exist in the request', async () => {
    await request(app)
      .post('/play-challenge')
      .send({
        name: 'test'
      })
      .expect(400);
  });

  it('fails when a name or email does not exist in the request', async () => {
    await request(app)
      .post('/play-challenge')
      .send({
        name: 'test',
        em: 'test@test'
      })
      .expect(400);
  });

  it('check resp and message is correct when correct name and email is provided', async () => {
    const resp = await request(app)
      .post('/play-challenge')
      .send({
        name: 'test',
        email: 'test@test'
      });
      expect(resp.status).toBe(201);
      expect(resp.body.message).toBe('Thanks for playing the game and completing it!!!');
      userId = resp.body.userId;
  });

  it('check resp successful for retrieving challenge history', async () => {
    const resp = await request(app)
      .get(`/challenge-history/${userId}`);
      expect(resp.status).toBe(200);
      expect(resp.body[0].userId).toBe(userId);
  });
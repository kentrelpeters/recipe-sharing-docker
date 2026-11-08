const db = require('../database');

beforeAll(async () => {
  await db.ready;
});

afterAll(() => new Promise((resolve, reject) => {
  db.close(error => error ? reject(error) : resolve());
}));

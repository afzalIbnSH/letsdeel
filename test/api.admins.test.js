require('module-alias/register')
const request = require('supertest');

const app = require('src/app');

describe('GET /admins/best-profession', () => {
    it('raises 403 if authorized user isn\'t an admin', (done) => {
        request(app)
            .get('/admins/best-profession')
            .set('Accept', 'application/json')
            .set('profile_id', 3)
            .expect(403, done)
    })
})

describe('GET /admins/best-clients', () => {
    it('raises 403 if authorized user isn\'t an admin', (done) => {
        request(app)
            .get('/admins/best-clients')
            .set('Accept', 'application/json')
            .set('profile_id', 3)
            .expect(403, done)
    })
})
require('module-alias/register')

const chai = require('chai')
const request = require('supertest');

const app = require('src/app');

chai.should()

describe('GET /contracts/{id}', function () {
    it('returns with 404 if id is non existent', (done) => {
        request(app)
            .get('/contracts/10')
            .set('Accept', 'application/json')
            .set('profile_id', 4)
            .expect(404, done)
    });

    it('returns with 404 if contract exists but does not belong to authorized profile', (done) => {
        request(app)
            .get('/contracts/1')
            .set('Accept', 'application/json')
            .set('profile_id', 4)
            .expect(404, done)
    });

    it('returns with 200 if contract exists and belongs to authorized profile', (done) => {
        request(app)
            .get('/contracts/1')
            .set('Accept', 'application/json')
            .set('profile_id', 5)
            .expect(200)
            .then(res => {
                res.body.should.include.key('createdAt')
                res.body.should.include.key('updatedAt')
                delete res.body.createdAt
                delete res.body.updatedAt
                res.body.should.deep.equal({
                    id: 1,
                    terms: 'bla bla bla',
                    status: 'terminated',
                    ContractorId: 5,
                    ClientId: 1
                })
                done()
            })
    });
});
require('module-alias/register')

const chai = require('chai')
const request = require('supertest');

const app = require('src/app');

chai.should()

describe('GET /contracts', function () {
    it('does not return terminated contracts', (done) => {
        request(app)
            .get('/contracts')
            .set('Accept', 'application/json')
            .set('profile_id', 5)
            .expect(200)
            .then(res => {
                res.body.should.deep.equal([])
                done()
            })
            .catch(done)
    })

    it('returns all non-terminated contracts of authorized contractor', (done) => {
        request(app)
            .get('/contracts')
            .set('Accept', 'application/json')
            .set('profile_id', 4)
            .expect(200)
            .then(res => {
                for (c of res.body) {
                    c.should.include.key('createdAt')
                    c.should.include.key('updatedAt')
                    delete c.createdAt
                    delete c.updatedAt
                }
                res.body.should.deep.equal([
                    {
                        id: 7,
                        terms: 'bla bla bla',
                        status: 'in_progress',
                        ClientId: 4,
                        ContractorId: 7
                    },
                    {
                        id: 8,
                        terms: 'bla bla bla',
                        status: 'in_progress',
                        ClientId: 4,
                        ContractorId: 6
                    },
                    {
                        id: 9,
                        terms: 'bla bla bla',
                        status: 'in_progress',
                        ClientId: 4,
                        ContractorId: 8
                    }
                ])
                done()
            })
            .catch(done)
    })

    it('returns all non-terminated contracts of authorized client', (done) => {
        request(app)
            .get('/contracts')
            .set('Accept', 'application/json')
            .set('profile_id', 6)
            .expect(200)
            .then(res => {
                for (c of res.body) {
                    c.should.include.key('createdAt')
                    c.should.include.key('updatedAt')
                    delete c.createdAt
                    delete c.updatedAt
                }
                res.body.should.deep.equal([
                    {
                        id: 2,
                        terms: 'bla bla bla',
                        status: 'in_progress',
                        ClientId: 1,
                        ContractorId: 6
                    },
                    {
                        id: 3,
                        terms: 'bla bla bla',
                        status: 'in_progress',
                        ClientId: 2,
                        ContractorId: 6
                    },
                    {
                        id: 8,
                        terms: 'bla bla bla',
                        status: 'in_progress',
                        ClientId: 4,
                        ContractorId: 6
                    }
                ])
                done()
            })
            .catch(done)
    })
})

describe('GET /contracts/{id}', function () {
    it('raises 404 if id is non existent', (done) => {
        request(app)
            .get('/contracts/10')
            .set('Accept', 'application/json')
            .set('profile_id', 5)
            .expect(404, done)
    });

    it('raises 404 if contract exists but does not belong to authorized profile', (done) => {
        request(app)
            .get('/contracts/1')
            .set('Accept', 'application/json')
            .set('profile_id', 4)
            .expect(404, done)
    });

    it('returns contract if it exists and belongs to authorized profile', (done) => {
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
            .catch(done)
    });
});
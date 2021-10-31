require('module-alias/register')

const chai = require('chai')
const request = require('supertest');

const app = require('src/app');

chai.should()

describe('GET /jobs/unpaid', function () {
    it('returns just the unpaid jobs of a client', (done) => {
        request(app)
            .get('/jobs/unpaid')
            .set('Accept', 'application/json')
            .set('profile_id', 4)
            .expect(200)
            .then(res => {
                res.body[0].should.include.key('createdAt')
                res.body[0].should.include.key('updatedAt')
                delete res.body[0].createdAt
                delete res.body[0].updatedAt
                res.body.should.deep.equal([
                    {
                        id: 5,
                        description: 'work',
                        price: 200,
                        paid: null,
                        paymentDate: null,
                        ContractId: 7,
                        Contract: { ContractorId: 7, ClientId: 4 }
                    }
                ])
                done()
            })
            .catch(done)
    })

    it('returns just the unpaid jobs of a contractor', (done) => {
        request(app)
            .get('/jobs/unpaid')
            .set('Accept', 'application/json')
            .set('profile_id', 7)
            .expect(200)
            .then(res => {
                for (j of res.body) {
                    j.should.include.key('createdAt')
                    j.should.include.key('updatedAt')
                    delete j.createdAt
                    delete j.updatedAt
                }
                res.body.should.deep.equal([
                    {
                        id: 4,
                        description: 'work',
                        price: 200,
                        paid: null,
                        paymentDate: null,
                        ContractId: 4,
                        Contract: { ContractorId: 7, ClientId: 2 }
                    },
                    {
                        id: 5,
                        description: 'work',
                        price: 200,
                        paid: null,
                        paymentDate: null,
                        ContractId: 7,
                        Contract: { ContractorId: 7, ClientId: 4 }
                    }
                ])
                done()
            })
            .catch(done)
    })
})
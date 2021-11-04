require('module-alias/register')
const request = require('supertest');

const app = require('src/app');
const { Job, Contract } = require('src/model')

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

describe('POST /jobs/{id}/pay', function () {
    it('raises 404 if the API is called by not the right client', (done) => {
        request(app)
            .post('/jobs/5/pay')
            .set('Accept', 'application/json')
            .set('profile_id', 3)
            .expect(404, done)
    })

    it('raises 400 if the client has insufficient balance', (done) => {
        request(app)
            .post('/jobs/5/pay')
            .set('Accept', 'application/json')
            .set('profile_id', 4)
            .expect(400)
            .then(res => {
                res.body.should.deep.equal({ message: 'Insufficient balance' })
                done()
            })
            .catch(e => done(e))
    })

    it('updates job as paid and update balances on success', (done) => {
        const jobId = 2;
        let job;
        Job.findOne({
            where: {
                id: jobId
            },
            attributes: ['paid'],
            include: [{
                model: Contract,
                attributes: ['ClientId', 'ContractorId'],
                required: true,
                include: ['Contractor', 'Client']
            }]
        })
            .then(res => {
                job = res;
                (job.paid === null).should.equal(true)
                return request(app)
                    .post(`/jobs/${jobId}/pay`)
                    .set('Accept', 'application/json')
                    .set('profile_id', 1)
                    .expect(201)
            })
            .then(res =>
                Job.findOne({
                    where: {
                        id: jobId
                    },
                    attributes: ['paid'],
                    include: [{
                        model: Contract,
                        attributes: ['ClientId', 'ContractorId'],
                        required: true,
                        include: ['Contractor', 'Client']
                    }]
                })
            )
            .then(updatedJob => {
                updatedJob.paid.should.equal(true);
                (updatedJob.Contract.Contractor.balance - job.Contract.Contractor.balance).should.equal(201);
                (updatedJob.Contract.Client.balance - job.Contract.Client.balance).should.equal(-201)
                done()
            })
            .catch(e => done(e))
    })
})
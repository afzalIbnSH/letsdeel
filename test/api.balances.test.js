require('module-alias/register')
const request = require('supertest');

const app = require('src/app');
const { Profile } = require('src/model')

describe('POST /balances/deposit/{userId}', () => {
    it('raises 404 if the API is not called by the right client', (done) => {
        request(app)
            .post('/balances/deposit/4')
            .set('Accept', 'application/json')
            .set('profile_id', 3)
            .expect(404, done)
    })

    it('raises 400 if the req body is missing the amount param', (done) => {
        request(app)
            .post('/balances/deposit/3')
            .set('Accept', 'application/json')
            .set('profile_id', 3)
            .expect(400)
            .then(res => {
                res.body.should.deep.equal({ message: 'Missing required body parameter: "amount"' })
                done()
            })
            .catch(e => done(e))
    })

    it('raises 400 if the amount param is not a number', (done) => {
        request(app)
            .post('/balances/deposit/3')
            .set('Accept', 'application/json')
            .set('profile_id', 3)
            .send({ amount: 'NaN' })
            .expect(400)
            .then(res => {
                res.body.should.deep.equal({ message: 'Amount should be a number' })
                done()
            })
            .catch(e => done(e))
    })

    it('raises 400 if the amount greater than 25% of the client\'s total debt', (done) => {
        request(app)
            .post('/balances/deposit/1')
            .set('Accept', 'application/json')
            .set('profile_id', 1)
            .send({ amount: 101 })
            .expect(400)
            .then(res => {
                res.body.should.deep.equal({ message: 'Amount can\'t be greater than 25% of your total debt' })
                done()
            })
            .catch(e => done(e))
    })

    it('updates client\'s balance on success', (done) => {
        const clientId = 1
        let oldBal;
        Profile.findOne({
            where: {
                id: clientId
            },
            attributes: ['balance']
        })
            .then(profile => {
                oldBal = profile.balance;
                return request(app)
                    .post(`/balances/deposit/${clientId}`)
                    .set('Accept', 'application/json')
                    .set('profile_id', clientId)
                    .send({ amount: 100 })
                    .expect(201)
            })
            .then(res =>
                Profile.findOne({
                    where: {
                        id: clientId
                    },
                    attributes: ['balance']
                })
            )
            .then(profile => {
                (profile.balance - oldBal).should.equal(100)
                done()
            }).catch(e => done(e))
    })
})
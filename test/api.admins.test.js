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

    it('raises 400 if the one or both of start and end dates are missing', (done) => {
        request(app)
            .get('/admins/best-profession')
            .set('Accept', 'application/json')
            .set('profile_id', 9)
            .expect(400)
            .then(res => {
                res.body.should.deep.equal({ message: 'Missing one or both of required query params: "start", "end"' })
                done()
            })
            .catch(e => done(e))
    })

    it('raises 400 if the one or both of start and end dates are invalid', (done) => {
        request(app)
            .get('/admins/best-profession?start=2020-08-16&end=invalid')
            .set('Accept', 'application/json')
            .set('profile_id', 9)
            .expect(400)
            .then(res => {
                res.body.should.deep.equal({ message: 'One or both of start and end dates are invalid' })
                done()
            })
            .catch(e => done(e))
    })

    it('on success, returns the profession that earned the most money in a given time range', (done) => {
        request(app)
            .get('/admins/best-profession?start=2020-08-15&end=2020-08-16')
            .set('Accept', 'application/json')
            .set('profile_id', 9)
            .expect(200)
            .then(res => {
                res.body.should.deep.equal({ ContractId: 2, MoneyEarned: 2221 })
                done()
            })
            .catch(e => done(e))
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

    it('raises 400 if the one or both of start and end dates are missing', (done) => {
        request(app)
            .get('/admins/best-clients')
            .set('Accept', 'application/json')
            .set('profile_id', 9)
            .expect(400)
            .then(res => {
                res.body.should.deep.equal({ message: 'Missing one or both of required query params: "start", "end"' })
                done()
            })
            .catch(e => done(e))
    })

    it('raises 400 if the one or both of start and end dates are invalid', (done) => {
        request(app)
            .get('/admins/best-clients?start=2020-08-16&end=invalid')
            .set('Accept', 'application/json')
            .set('profile_id', 9)
            .expect(400)
            .then(res => {
                res.body.should.deep.equal({ message: 'One or both of start and end dates are invalid' })
                done()
            })
            .catch(e => done(e))
    })

    it('on success, returns the list of clients that paid the most for jobs in a given time range, '
        + 'sorted in desc order',
        (done) => {
            request(app)
                .get('/admins/best-clients?start=2020-08-15&end=2020-08-16')
                .set('Accept', 'application/json')
                .set('profile_id', 9)
                .expect(200)
                .then(res => {
                    res.body.should.deep.equal([
                        { MoneyPaid: 2221, Contract: { ClientId: 1 } },
                        { MoneyPaid: 2020, Contract: { ClientId: 4 } },
                        { MoneyPaid: 121, Contract: { ClientId: 2 } }
                    ])
                    done()
                })
                .catch(e => done(e))
        })
})
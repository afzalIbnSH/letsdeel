const express = require('express')

const { sequelize } = require('src/model')
const { getProfile } = require('src/middleware/getProfile')

const contracts = require('src/app/api/contracts')
const jobs = require('src/app/api/jobs')

const app = express();
app.use(express.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

app.use(getProfile)
app.use('/contracts', contracts)
app.use('/jobs', jobs)

module.exports = app

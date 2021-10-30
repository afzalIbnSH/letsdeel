const express = require('express');
const bodyParser = require('body-parser');

const { sequelize } = require('src/model')
const { getProfile } = require('src/middleware/getProfile')

const contracts = require('src/app/api/contracts')

const app = express();
app.use(express.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

app.use(getProfile)
app.use('/contracts', contracts);

module.exports = app;

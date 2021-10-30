const express = require('express');
const bodyParser = require('body-parser');

const { sequelize } = require('src/model')
const { getProfile } = require('src/middleware/getProfile')

const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

/**
 * @returns contract by id
 */
app.get('/contracts/:id', getProfile, async (req, res) => {
    const { Contract } = req.app.get('models')
    const { id } = req.params

    const contract = await Contract.findOne({
        where: {
            id,
            ContractorId: req.profile.id
        }
    })
    if (!contract) return res.status(404).end()

    res.json(contract)
})
module.exports = app;

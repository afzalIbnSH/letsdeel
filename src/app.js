const express = require('express');
const bodyParser = require('body-parser');
const { Op } = require("sequelize");

const { sequelize } = require('src/model')
const { getProfile } = require('src/middleware/getProfile')

const app = express();
app.use(express.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)


/**
 * @returns all non-terminated contracts of a user
 */
app.get('/contracts', getProfile, async (req, res) => {
    const { Contract } = req.app.get('models')

    const contracts = await Contract.findAll({
        where: {
            [Op.or]: [
                { ContractorId: req.profile.id },
                { ClientId: req.profile.id }
            ],
            status: {
                [Op.ne]: 'terminated'
            }
        }
    })
    res.json(contracts)
})


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

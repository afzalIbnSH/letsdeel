const express = require('express')
const { Op } = require("sequelize");

const router = express.Router()

/**
 * @returns all non-terminated contracts of a user
 */
router.get('/', async (req, res) => {
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
router.get('/:id', async (req, res) => {
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

module.exports = router;
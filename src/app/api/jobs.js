const express = require('express')
const { Op } = require("sequelize");

const router = express.Router()

/**
 * @returns all unpaid jobs of a user
 */
router.get('/unpaid', async (req, res) => {
    const { Contract, Job } = req.app.get('models')

    const unpaidJobs = await Job.findAll({
        where: {
            [Op.or]: [
                { '$Contract.ContractorId$': req.profile.id },
                { '$Contract.ClientId$': req.profile.id }
            ],
            // sqlite stores the paid flag as null by default
            paid: {
                [Op.or]: [false, null]
            }
        },
        include: [{
            model: Contract,
            attributes: ['ContractorId', 'ClientId'],
            required: true
        }]
    })
    res.json(unpaidJobs)
})

module.exports = router;
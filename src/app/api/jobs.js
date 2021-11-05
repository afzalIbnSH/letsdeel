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

/**
 * Pay for a job
 */
router.post('/:id/pay', async (req, res) => {
    const sequelize = req.app.get('sequelize')
    const { Contract, Job, Profile } = req.app.get('models')
    const { id } = req.params

    const job = await Job.findOne({
        where: {
            id,
            // Ensure the API is called by the corresponding client
            '$Contract.ClientId$': req.profile.id
        },
        include: [{
            model: Contract,
            attributes: ['ClientId', 'ContractorId'],
            required: true,
            include: ['Contractor', 'Client']
        }]
    })

    if (!job) return res.status(404).end()

    if (job.price > job.Contract.Client.balance) return res.status(400).json({
        message: 'Insufficient balance'
    })

    try {
        let transaction = await sequelize.transaction();
        await Profile.update(
            { balance: job.Contract.Client.balance - job.price },
            { where: { id: job.Contract.Client.id } },
            { transaction }
        )
        await Profile.update(
            { balance: job.Contract.Contractor.balance + job.price },
            { where: { id: job.Contract.Contractor.id } },
            { transaction }
        )
        await Job.update(
            { paid: true, paymentDate: new Date().toISOString() },
            { where: { id: job.id } },
            { transaction }
        )
        await transaction.commit();
    } catch (err) {
        if (transaction) await transaction.rollback();
    }

    res.status(201).end()
})

module.exports = router;
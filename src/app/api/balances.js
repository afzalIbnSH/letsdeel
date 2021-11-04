const { expect } = require('chai');
const express = require('express')
const { Op } = require("sequelize");

const router = express.Router()

/**
 * Deposit money into the balance of a client
 */
router.post('/deposit/:userId', async (req, res) => {
    const { profile } = req
    const { userId } = req.params
    const { Contract, Job } = req.app.get('models')
    let { amount } = req.body

    if (profile.id !== Number(userId)) {
        return res.status(404).end()
    }

    // Room to improve: Plug-in a generic validator
    if (!amount) {
        return res.status(400).json({
            message: 'Missing required body parameter: "amount"'
        })
    }
    if (isNaN(amount)) {
        return res.status(400).json({
            message: 'Amount should be a number'
        })
    }
    // Forgive if the amount is passed as a string
    amount = Number(amount)

    const jobsToPay = await Job.findAll({
        where: {
            // sqlite stores the paid flag as null by default
            paid: {
                [Op.or]: [false, null]
            },
            '$Contract.ClientId$': profile.id
        },
        include: [{
            model: Contract,
            required: true,
            attributes: ['ClientId']
        }]
        ,
        attributes: ['paid', 'price']
    })
    const debt = jobsToPay.reduce((partial_sum, job) => partial_sum + job.price, 0)

    if (amount > (debt / 4)) {
        return res.status(400).json({
            message: 'Amount can\'t be greater than 25% of your total debt'
        })
    }

    await profile.update({ balance: profile.balance + amount })
    res.status(201).end()
})

module.exports = router
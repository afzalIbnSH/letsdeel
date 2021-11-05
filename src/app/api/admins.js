const { expect } = require('chai');
const express = require('express')
const { Op } = require("sequelize");

const router = express.Router()

// Ref: https://stackoverflow.com/a/12372720/4672736
Date.prototype.isValid = function () {
    // An invalid date object returns NaN for getTime() and NaN is the only
    // object not strictly equal to itself.
    return this.getTime() === this.getTime();
};

router.use(async (req, res, next) => {
    if (req.profile.type !== 'admin') return res.status(403).end()
    next()
})

function validateTimeRange(start, end) {
    if (!start || !end) {
        throw 'Missing one or both of required query params: "start", "end"'
    }
    start = new Date(start)
    end = new Date(end)
    if (!start.isValid() || !end.isValid()) {
        throw 'One or both of start and end dates are invalid'
    }
    return [start, end]
}

/**
 * Returns the profession that earned the most money (sum of jobs paid)
 * for any contractor in a given time range.
 */
router.get('/best-profession', async (req, res) => {
    let { start, end } = req.query
    const { Job } = req.app.get('models')
    const sequelize = req.app.get('sequelize')

    try {
        [start, end] = validateTimeRange(start, end)
    }
    catch (errMsg) {
        return res.status(400).json({ message: errMsg })
    }

    const respectiveContractsSortedByMoneyEarned = await Job.findAll({
        where: {
            paymentDate: {
                [Op.between]: [start, end]
            }
        },
        attributes: [
            'ContractId',
            [sequelize.fn('sum', sequelize.col('price')), 'MoneyEarned']
        ],
        group: ['ContractId'],
        order: [
            [sequelize.fn('sum', sequelize.col('price')), 'DESC']
        ]
    })
    res.json(respectiveContractsSortedByMoneyEarned[0])
})

/**
 * Returns a specified number of clients that paid the most for jobs in a given time range.
 * Default limit is 2.
 */
router.get('/best-clients', async (req, res) => {
    let { start, end } = req.query
    const { Job, Contract } = req.app.get('models')
    const sequelize = req.app.get('sequelize')

    try {
        [start, end] = validateTimeRange(start, end)
    }
    catch (errMsg) {
        return res.status(400).json({ message: errMsg })
    }

    return res.json(await Job.findAll({
        where: {
            paymentDate: {
                [Op.between]: [start, end]
            }
        },
        include: [{
            model: Contract,
            required: true,
            attributes: ['ClientId']
        }],
        attributes: [
            [sequelize.fn('sum', sequelize.col('price')), 'MoneyPaid']
        ],
        group: ['Contract.ClientId'],
        order: [
            [sequelize.fn('sum', sequelize.col('price')), 'DESC']
        ]
    }))
})

module.exports = router
const express = require('express')

const router = express.Router()

router.use(async (req, res, next) => {
    if (req.profile.type !== 'admin') return res.status(403).end()
    next()
})

/**
 * Returns the profession that earned the most money (sum of jobs paid)
 * for any contractor in a given time range.
 */
router.get('/best-profession', async (req, res) => {
})

/**
 * Returns a specified number of clients that paid the most for jobs in a given time range.
 * Default limit is 2.
 */
router.get('/best-clients', async (req, res) => {
})

module.exports = router
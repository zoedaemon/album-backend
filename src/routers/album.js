const express = require('express')
const router = express.Router()

router.get('/health', async (req, res) => {
    // Create a new user
    try {
        res.status(200).send("OK")
    } catch (error) {
        res.status(400).send(error)
    }
})


module.exports = router
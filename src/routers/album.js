const express = require('express')
const router = express.Router()

var osutils = require('node-os-utils');
var limit = 50 //in percent

//TODO : 503 for WARN, e.g. high CPU, high memory usage
//TODO : 500 for FAIL, i.e database not connected
router.get('/health', async (req, res) => {
    // Create a new user    
    try {
        //TODO: mock high CPU usage
        osutils.cpu.usage()
        .then(info => {
            console.log( 'CPU Usage (%): ' + info );
            if (info  > limit){
                console.log("CPU Usage Over 20%!")
                res.status(503).send("WARN")
            }else {
                res.status(200).send("OK")
            }
        })
    } catch (error) {
        res.status(400).send(error)
    } 
})


module.exports = router
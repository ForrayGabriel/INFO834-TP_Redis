//Access the router on Express 
const router = require('express').Router();

//Access the controllers
const controller = require('../controllers/data');

//READ
router.get("/data", (req, res) => {
    
    controller.read(req, res);

});

//CREATE
router.post("/data", (req, res) => {

    controller.create(req, res);

});

module.exports = router;
function createData(req, res) {
    let Data = require('../models/data');
    let newData = Data ({
        data: req.body.data
    });
  
    newData.save()
    .then((savedData) => {

        //send back the created Data
        res.json(savedData);
            
    }, (err) => {
        res.status(400).json(err)
    });

}

function readData(req, res) {

    let Data = require("../models/data");

    Data.find({})
    .then((Datas) => {
        res.status(200).json(Datas);
    }, (err) => {
        res.status(500).json(err);
    });
 }



module.exports.read = readData;
module.exports.create = createData;
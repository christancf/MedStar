var express = require('express');
const corpseModel = require('../models/mortuary');
var router = express.Router();
const auth = require("../middleware/auth");


//add corpse initially
router.post('/add', function (req, res, next) {

  const corpse = new corpseModel({
    NIC: req.body.NIC,
    name: req.body.name,
    sex: req.body.sex,
    address: req.body.address,
    date_of_birth: req.body.date_of_birth,
    date_time_of_death: req.body.date_time_of_death,
    cause_of_death: req.body.cause_of_death,
    specifics_of_death: req.body.specifics_of_death,
    // cabinet_number: req.body.cabinet_number,
    cabinet_number: 'A1',
    status: false,
    receiver_name: null,
    receiver_type: null,
    date_of_release: null
  });

  try {

    corpse.save();
    res.status(200).json(
      {
        success: true,
        message: 'Insertion Successful'
      }
    );

  }
  catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }

});

// READ to info page
router.get('/info', async function (req, res, next) {

  try {
    let corpseDetails = await corpseModel.find({}, { NIC: 1, name: 1, cause_of_death: 1, date_time_of_death: 1, date_of_release: 1, cabinet_number: 1, status: 1})
    // corpseDetails = JSON.stringify(corpseDetails)  //convert to json string
    // corpseDetails = JSON.parse(corpseDetails)  //convert to json
    console.log(corpseDetails)
    res.status(200).json({
      success: true,
      details: corpseDetails
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    })
  }

})

module.exports = router;

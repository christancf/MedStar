var express = require('express');
const wardModel = require('../models/ward')
const staffModel = require('../models/staff')
const assignNurseModel = require('../models/assigned-nurses')
const attendanceModel = require('../models/attendance')
const wardCategoryModel = require('../models/ward-category')
var router = express.Router();
const auth = require("../middleware/auth");

//testing
router.get('/', (req, res, next) => {
  res.send("IT works")
})

const setWardId = id => {
  const maxDigitLen = 3
  id += 1
  id = String(id)
  
  if(id.length === 1) return "00" + id
  if(id.length === 2) return "0" + id
  return id
}
//add ward details
router.post('/details/add', (req, res, next) => {
  //get previous ward id
  wardModel.findOne({category: req.body.category}, {_id:0, id:1}).sort({_id: -1})
  .then(prevId => {
    const abbr = req.body.abbreviation
    let wardId
    if(prevId?.id){
      prevId = prevId.id.substring(abbr.length)
      wardId = abbr + setWardId(Number(prevId))
    }else{ //first record
      wardId = abbr + "001"
    }
    res.json({wardId, "num": Number(prevId)})
    let newWard = new wardModel({
      id: wardId,
      category: req.body.category,
      capacity: req.body.capacity,
      roomCharge: req.body.roomCharge,
      status: req.body.status
    })
  
    newWard.save()
    .then(() => {
      res.json("Ward Added!")
    }).catch((e) => {
      console.log(`Error Add: ${e}`)
    })
  })
});

//read ward details
router.get('/details/read?:id', (req, res, next) => {
  wardModel.find({id:String(req.query.id)})
  .then((wardDetails) => {
    res.json(wardDetails)
  }).catch((e) =>{
    console.log(`Error Read: ${e}`)
  })
})
//update ward details
router.put('/details/update', (req, res, next) => {
  wardModel.updateOne({id: req.body.id},
    {$set: {"capacity": req.body.capacity, "status": req.body.status}})
    .then(() => {
      res.json(`Successfully Updated!`)
    }).catch((e) => {
      console.log(`Error Update: ${e}`)
    })
})

//retrieve ward categories
router.get('/category/names', (req, res, next) => {
  wardModel.aggregate([{$group: { _id: '$category'}}])
  .then((d) => res.json(d))
  .catch((e) => console.log(`Error retrieving categories: ${ e }`))
})

//retrieve ward ids according to the category
router.get('/category/ids?:category', (req, res, next) => {
  wardModel.find({category: req.query.category}, {_id:0, id:1})
  .then((d) => res.json(d))
  .catch((e) => console.log(`Error: ${ e }`))
})

//retrieve nurse details when id provided
router.get('/nurse/read?:id', (req, res, next) => {
  staffModel.findOne({staffID: req.query.id, designation: "nurse"})
  .then((data) => res.json(data))
  .catch((e) => console.log(`Error: ${ e }`))
})

//assign nurse
router.post('/nurse/assign', (req, res, next) => {
  if(req.body?.role){
    const assign = new assignNurseModel({
      nurseID: req.body.id,
      assignedDate: req.body.assignedDate,
      reassignDate: req.body.reassignDate,
      wardCategory: req.body.category,
      wardID: req.body.wardID,
      role: req.body.role
    })
    assign.save()
    .then((d) => res.json(d))
    .catch((e) => console.log(`Error: ${ e }`))
  }else{
    const assign = new assignNurseModel({
      nurseID: req.body.id,
      assignedDate: req.body.assignedDate,
      reassignDate: req.body.reassignDate,
      wardCategory: req.body.category,
      wardID: req.body.wardID
    })
    assign.save()
    .then((d) => res.json(d))
    .catch((e) => console.log(`Error: ${ e }`))
  }
  
})

//read all assigned nurses
router.get('/nurse/details', (req, res, next) => {
  assignNurseModel.aggregate([{
    $lookup: {
      from: "staffs",
      localField: "nurseID",
      foreignField: "staffID",
      as: 'details'
    }
  }])
  .then((resp) => res.json(resp))
  .catch((e) => res.json(e))
})

//check whether a nurse assigned
router.get('/nurse/assign/check?:id', (req, res, next) => {
  assignNurseModel.findOne({nurseID: Number(req.query.id)})
  .then(data => {
    res.json(data)
  }).catch(e => res.json(e))
})

//check status
router.get('/nurse/status?:id', (req, res, next) => {
    const data = attendanceModel.findOne({staffID: req.query.id})
    data.sort({staffID: -1})
    data.then(data => res.json(data.checkOut))
        .catch(e => res.json(e))
  
})

//unassign a nurse
router.delete('/nurse/unassign?:id', (req, res, next) => {
  assignNurseModel.findOneAndRemove({nurseID: req.query.id})
  .then(() => res.json('Nurse Unassigned!'))
  .catch(e => res.json(e))
})


//add ward category
router.post('/category/add', (req, res, next) => {

  let newCategory = new wardCategoryModel({
    category: req.body.category,
    abbreviation: req.body.abbreviation
  })

  newCategory.save()
  .then(() => {
    res.json({message:"Category Added!"})
  }).catch((e) => {
    console.log(`Error Add: ${e}`)
  })
})

//read all ward category
router.get('/category/read/all', (req, res, next) => {
  wardCategoryModel.find()
  .then(data => res.json(data))
  .catch(e => console.log(`Error Add: ${e}`))
})





module.exports = router;

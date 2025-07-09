


const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationcontroller');


router.get('/due-dates-timeline', notificationController.getDueDatesTimeline);



module.exports = router;



const express = require('express');
const router = express.Router();
const {
  createRole,
  getRoles,
  updateRole,
  deleteRole,

} = require('../controllers/rolecontroller');

router.post('/', createRole);
router.get('/', getRoles);  
router.put('/:id', updateRole); 
router.delete('/:id', deleteRole);



module.exports = router;
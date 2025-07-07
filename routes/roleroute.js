const express = require('express');
const router = express.Router();
const {
  createRole,
  getRoles,
  updateRole,
  deleteRole,
  createUserRole
} = require('../controllers/rolecontroller');

router.post('/', createRole);
router.get('/', getRoles);  
router.put('/:id', updateRole); 
router.delete('/:id', deleteRole);
router.post('/user_role', createUserRole); 


module.exports = router;
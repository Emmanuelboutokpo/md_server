const express = require('express');
const { createCategory, getAllCategory, getCategory, updateCategory, deleteCategory } = require('../controllers/genderController');
 
const router = express.Router();
 
router.post('/addCat',createCategory);
router.get("/getAllCategory", getAllCategory);
router.get('/getCategory/:id',getCategory);
router.put("/putCategory/:id", updateCategory); 
router.delete("/deleteCategory/:id",deleteCategory); 

module.exports = router;
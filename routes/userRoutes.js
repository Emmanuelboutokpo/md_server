 const express = require('express');
const router = express.Router();

const { signup, signin, getAllUser, makeAnAdmin} = require('../controllers/userCntroller');

router.post('/signup',  signup);
router.post('/signin',signin);
router.get('/getAllUser',getAllUser);
router.put('/admin/:id',makeAnAdmin);


module.exports = router;

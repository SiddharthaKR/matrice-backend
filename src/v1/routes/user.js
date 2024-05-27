const router = require('express').Router()
const tokenHandler = require('../handlers/tokenHandler')
const userController = require('../controllers/user')




router.get(
  '/getallusers',
  tokenHandler.verifyToken,
  userController.getAllUsers
);


module.exports = router
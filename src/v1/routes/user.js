const router = require('express').Router()
const tokenHandler = require('../handlers/tokenHandler')
const userController = require('../controllers/user')




router.get(
  '/getallusers',
  tokenHandler.verifyToken,
  userController.getAllUsers
);

router.get(
  '/getdashboard',
  tokenHandler.verifyToken,
  userController.getDashboard
);


module.exports = router
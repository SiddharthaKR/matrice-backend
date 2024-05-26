const router = require('express').Router()
const { param } = require('express-validator')
const validation = require('../handlers/validation')
const tokenHandler = require('../handlers/tokenHandler')
const boardController = require('../controllers/board')
const userController = require('../controllers/user')
const checkPermission = require('../handlers/permissionHandler')

router.post(
  '/',
  tokenHandler.verifyToken,
  boardController.create
)

router.get(
  '/',
  tokenHandler.verifyToken,
  boardController.getAll
)

router.put(
  '/',
  tokenHandler.verifyToken,
  boardController.updatePosition
)

router.get(
  '/favourites',
  tokenHandler.verifyToken,
  boardController.getFavourites
)

router.put(
  '/favourites',
  tokenHandler.verifyToken,
  boardController.updateFavouritePosition
)

router.get(
  '/:boardId',
  param('boardId').custom(value => {
    if (!validation.isObjectId(value)) {
      return Promise.reject('invalid id')
    } else return Promise.resolve()
  }),
  validation.validate,
  tokenHandler.verifyToken,
  checkPermission('read'), // Ensure only users with read permissions get board data
  boardController.getOne
)

router.put(
  '/:boardId',
  param('boardId').custom(value => {
    if (!validation.isObjectId(value)) {
      return Promise.reject('invalid id')
    } else return Promise.resolve()
  }),
  validation.validate,
  tokenHandler.verifyToken,
  checkPermission('update'), // Ensure only users with update permissions can update
  boardController.update
)

router.delete(
  '/:boardId',
  param('boardId').custom(value => {
    if (!validation.isObjectId(value)) {
      return Promise.reject('invalid id')
    } else return Promise.resolve()
  }),
  validation.validate,
  tokenHandler.verifyToken,
  checkPermission('delete'), // Ensure only users with delete permissions can delete
  boardController.delete
)

// Route to add members to a board
router.post(
  '/:boardId/members',
  param('boardId').custom(value => {
    if (!validation.isObjectId(value)) {
      return Promise.reject('invalid id');
    } else return Promise.resolve();
  }),
  validation.validate,
  tokenHandler.verifyToken,
  checkPermission('update'), // Ensure only users with update permissions can add members
  boardController.addMember
);

router.get(
  '/getallusers',
  tokenHandler.verifyToken,
  userController.getAllUsers
);

router.get(
  '/members/:boardId',
  param('boardId').custom(value => {
    if (!validation.isObjectId(value)) {
      return Promise.reject('invalid board id');
    } else return Promise.resolve();
  }),
  validation.validate,
  tokenHandler.verifyToken,
  checkPermission('update'), // Ensure only admin can access
  boardController.getBoardMembers
);

module.exports = router
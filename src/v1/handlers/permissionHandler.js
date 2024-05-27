const Board = require('../models/board');
const roles = require('../utils/roles');

const checkPermission = (action) => {
  return async (req, res, next) => {
    const { boardId } = req.params;
    const userId = req.user._id;
    const board = await Board.findById(boardId).populate('members.user');
    if (!board) {
      return res.status(404).json({ message: 'Board not found.' });
    }
    const member = board.members.find(m => m.user._id.toString() === userId.toString());
    if (!member) {
      return res.status(403).json({ message: 'User is not a member of this board.' });
    }

    const rolePermissions = roles[member.role];
    if (!rolePermissions.includes(action)) {
      return res.status(403).json({ message: 'User does not have permission to perform this action.' });
    }

    next();
  };
};

module.exports = checkPermission;

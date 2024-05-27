const Board = require('../models/board')
const Section = require('../models/section')
const Task = require('../models/task')
const User = require('../models/user')

exports.create = async (req, res) => {
  try {
    const boardsCount = await Board.find().count()
    const board = await Board.create({
      user: req.user._id,
      members: [
        {
          user: req.user._id,
          role: 'Admin'
        }
      ],
      position: boardsCount > 0 ? boardsCount : 0
    })
    res.status(201).json(board)
  } catch (err) {
    res.status(500).json(err)
  }
}

exports.getAll = async (req, res) => {
  try {
    // Find boards where the user is either the owner or a member
    const boards = await Board.find({
      $or: [
        { user: req.user._id },
        { 'members.user': req.user._id }
      ]
    }).sort('-position')
    res.status(200).json(boards)
  } catch (err) {
    res.status(500).json(err)
  }
}

exports.updatePosition = async (req, res) => {
  const { boards } = req.body
  try {
    for (const key in boards.reverse()) {
      const board = boards[key]
      await Board.findByIdAndUpdate(
        board.id,
        { $set: { position: key } }
      )
    }
    res.status(200).json('updated')
  } catch (err) {
    res.status(500).json(err)
  }
}

exports.getOne = async (req, res) => {
  const { boardId } = req.params
  try {
    // Find the board where the user is either the owner or a member
    const board = await Board.findOne({
      _id: boardId,
      $or: [
        { user: req.user._id },
        { 'members.user': req.user._id }
      ]
    });
    if (!board) return res.status(404).json('Board not found')
       // Check if the user is an admin
    const isAdmin = board.members.some(member => member.user.toString() === req.user._id.toString() && member.role === 'Admin')
    const sections = await Section.find({ board: boardId })
    for (const section of sections) {
      const tasks = await Task.find({ section: section.id }).populate('section').populate('assignedTo', 'username email').sort('-position')
      section._doc.tasks = tasks
    }
    board._doc.sections = sections
    board._doc.isAdmin = isAdmin
    res.status(200).json(board)
  } catch (err) {
    res.status(500).json(err)
  }
}

exports.update = async (req, res) => {
  const { boardId } = req.params
  const { title, description, favourite } = req.body
  try {
    if (title === '') req.body.title = 'Untitled'
    if (description === '') req.body.description = 'Add description here'
    const currentBoard = await Board.findById(boardId)
    if (!currentBoard) return res.status(404).json('Board not found')

    if (favourite !== undefined && currentBoard.favourite !== favourite) {
      const favourites = await Board.find({
        user: currentBoard.user,
        favourite: true,
        _id: { $ne: boardId }
      }).sort('favouritePosition')
      if (favourite) {
        req.body.favouritePosition = favourites.length > 0 ? favourites.length : 0
      } else {
        for (const key in favourites) {
          const element = favourites[key]
          await Board.findByIdAndUpdate(
            element.id,
            { $set: { favouritePosition: key } }
          )
        }
      }
    }

    const board = await Board.findByIdAndUpdate(
      boardId,
      { $set: req.body }
    )
    res.status(200).json(board)
  } catch (err) {
    res.status(500).json(err)
  }
}

exports.getFavourites = async (req, res) => {
  try {
    const favourites = await Board.find({
      user: req.user._id,
      favourite: true
    }).sort('-favouritePosition')
    res.status(200).json(favourites)
  } catch (err) {
    res.status(500).json(err)
  }
}

exports.updateFavouritePosition = async (req, res) => {
  const { boards } = req.body
  try {
    for (const key in boards.reverse()) {
      const board = boards[key]
      await Board.findByIdAndUpdate(
        board.id,
        { $set: { favouritePosition: key } }
      )
    }
    res.status(200).json('updated')
  } catch (err) {
    res.status(500).json(err)
  }
}

exports.delete = async (req, res) => {
  const { boardId } = req.params
  try {
    const sections = await Section.find({ board: boardId })
    for (const section of sections) {
      await Task.deleteMany({ section: section.id })
    }
    await Section.deleteMany({ board: boardId })

    const currentBoard = await Board.findById(boardId)

    if (currentBoard.favourite) {
      const favourites = await Board.find({
        user: currentBoard.user,
        favourite: true,
        _id: { $ne: boardId }
      }).sort('favouritePosition')

      for (const key in favourites) {
        const element = favourites[key]
        await Board.findByIdAndUpdate(
          element.id,
          { $set: { favouritePosition: key } }
        )
      }
    }

    await Board.deleteOne({ _id: boardId })

    const boards = await Board.find().sort('position')
    for (const key in boards) {
      const board = boards[key]
      await Board.findByIdAndUpdate(
        board.id,
        { $set: { position: key } }
      )
    }

    res.status(200).json('deleted')
  } catch (err) {
    res.status(500).json(err)
  }
}


exports.addMember = async (req, res) => {
  const { boardId } = req.params;
  const { userId, role } = req.body;
  try {
    console.log('addmember api called')
    console.log(boardId)
    // Validate role
    const validRoles = ['Admin', 'Member', 'Viewer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }
    // Find the board and check if the user is already a member
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found.' });
    }
    const isMember = board.members.some(member => member.user.toString() === userId);
    if (isMember) {
      return res.status(400).json({ message: 'User is already a member of this board.' });
    }
    // Add the new member
    board.members.push({ user: userId, role });
    await board.save();
    res.status(200).json({ message: 'Member added successfully.' });
  } catch (err) {
    res.status(500).json(err);
  }
};


exports.getBoardMembers = async (req, res) => {
  const { boardId } = req.params;
  try {
    const board = await Board.findById(boardId).populate('members.user', 'username'); // Populate members with user details
    if (!board) {
      return res.status(404).json({ message: 'Board not found.' });
    }
    // Extract user details from members
    const members = board.members.map(member => ({
      userId: member.user._id,
      username: member.user.username,
      role: member.role
    }));
    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.', error });
  }
};


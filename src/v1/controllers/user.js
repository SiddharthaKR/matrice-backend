const User = require('../models/user')
const CryptoJS = require('crypto-js')
const jsonwebtoken = require('jsonwebtoken')
const Board = require('../models/board')
const Task = require('../models/task')

exports.register = async (req, res) => {
  const { password } = req.body
  try {
    req.body.password = CryptoJS.AES.encrypt(
      password,
      process.env.PASSWORD_SECRET_KEY
    )

    const user = await User.create(req.body)
    const token = jsonwebtoken.sign(
      { id: user._id },
      process.env.TOKEN_SECRET_KEY,
      { expiresIn: '24h' }
    )
    res.status(201).json({ user, token })
  } catch (err) {
    res.status(500).json(err)
  }
}

exports.login = async (req, res) => {
  const { username, password } = req.body
  try {
    const user = await User.findOne({ username }).select('password username')
    if (!user) {
      return res.status(401).json({
        errors: [
          {
            param: 'username',
            msg: 'Invalid username or password'
          }
        ]
      })
    }

    const decryptedPass = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASSWORD_SECRET_KEY
    ).toString(CryptoJS.enc.Utf8)

    if (decryptedPass !== password) {
      return res.status(401).json({
        errors: [
          {
            param: 'username',
            msg: 'Invalid username or password'
          }
        ]
      })
    }

    user.password = undefined

    const token = jsonwebtoken.sign(
      { id: user._id },
      process.env.TOKEN_SECRET_KEY,
      { expiresIn: '24h' }
    )

    res.status(200).json({ user, token })

  } catch (err) {
    res.status(500).json(err)
  }
}

exports.getAllUsers = async (req, res) => {
  try {
    console.log("tried")
    const users = await User.find({}); // Fetch only necessary fields
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getDashboard = async  (req, res) => {
  try {
    const userId = req.user._id;
    console.log(userId)
    // Fetch boards where the user is a member or owner
    const boards = await Board.find({
      $or: [{ user: userId }, { 'members.user': userId }],
    }).populate('members.user', 'username');
    const adminBoards = boards.filter(board => 
      board.user.toString() === userId.toString() || 
      board.members.some(member => member.user._id.toString() === userId.toString() && member.role === 'Admin')
    );

    const memberBoards = boards.filter(board => 
      board.members.some(member => member.user._id.toString() === userId.toString() && member.role === 'Member')
    );

    const tasksCount = await Task.countDocuments({ 'assignedTo': userId });

    const upcomingDeadlines = await Task.find({ deadline: { $gte: new Date() } })
      .sort('deadline')
      .limit(5)
      .populate('section', 'board')
      .populate('board', 'name');

    const deadlines = upcomingDeadlines.map(task => ({
      date: task.deadline,
      project: task.section.board.name,
      task: task.title,
    }));

    res.json({
      adminBoards: adminBoards.length,
      memberBoards: memberBoards.length,
      tasks: tasksCount,
      deadlines,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dashboard overview' });
  }
};

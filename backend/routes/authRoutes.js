const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { signup, login, getProfile, getUsers } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post(
  '/signup',
  [
    body('name').notEmpty().withMessage('Name required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
  ],
  signup
);
router.post('/login', login);
router.get('/me', protect, getProfile);
router.get('/users', protect, getUsers);

module.exports = router;
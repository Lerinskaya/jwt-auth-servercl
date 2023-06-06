const Router = require('express').Router;
const userController = require('../controllers/user-controller');
const router = new Router();
const {body} = require('express-validator');
const authMiddleware = require('../middleware/auth-middleware');

router.post('/registration', 
  body('email').isEmail(),
  userController.registration);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.get('/refresh', userController.refresh);
router.get('/users', authMiddleware, userController.getUsers);
router.delete('/users/:id', authMiddleware, userController.deleteUser);
router.put('/users/:id', authMiddleware, userController.blockUser);
router.put('/users/:id/unblock', authMiddleware, userController.unblockUser);

module.exports = router;




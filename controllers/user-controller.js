const userService = require('../service/user-service');
const {validationResult} = require('express-validator');
const ApiError = require('../errors/api-error');

class UserController {
  async registration(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
      }
      const cookieAge = 30*24*60*60*1000;
      const {email, password} = req.body;
      if (!email || !password) {
        throw new Error('Отсутствуют или некорректные данные в теле запроса');
      }
      const userData = await userService.registration(email, password);
      res.cookie('refreshToken', userData.refreshToken, {maxAge: cookieAge, httpOnly:true})
      return res.json(userData);
    } catch (e) {
      next(e)
    }
  }

  async login(req, res, next) {
    try {
      const cookieAge = 30*24*60*60*1000;
      const {email, password} = req.body;
      const user = await userService.findByEmail(email);

      if (user.status === 'Blocked') {
        throw new ApiError.UnauthorizedError('Вход заблокированного пользователя недоступен');
      }
      const userData = await userService.login(email, password);
      res.cookie('refreshToken', userData.refreshToken, {maxAge: cookieAge, httpOnly:true});
      return res.json(userData);
    } catch (e) {
      next(e)
    }
  }

  async logout(req, res, next) {
    try {
      const {refreshToken} = req.cookies;
      const token = await userService.logout(refreshToken);
      res.clearCookie('refreshToken');
      return res.json(token);
    } catch (e) {
      next(e)
    }
  }

  async refresh(req, res, next) {
    try {
      const {refreshToken} = req.cookies;
      const cookieAge = 30*24*60*60*1000;
      const userData = await userService.refresh(refreshToken);
      res.cookie('refreshToken', userData.refreshToken, {maxAge: cookieAge, httpOnly:true});
      return res.json(userData);
      
    } catch (e) {
      next(e);
    }
  }

  async getUsers(req, res, next) {
    try {
      const users = await userService.getAllUsers();
      return res.json(users)
    } catch (e) {
      next(e)
    }
  }

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      await userService.deleteUser(id);
      return res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  }

  async blockUser(req, res, next) {
    try {
      const { id } = req.params;
      await userService.blockUser(id);
      return res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  }

  async unblockUser(req, res, next) {
    try {
      const { id } = req.params;
      await userService.unblockUser(id);
      return res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new UserController();

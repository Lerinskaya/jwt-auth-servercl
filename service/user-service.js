const UserModel = require('../models/user-model');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../errors/api-error');
const formatDate = require('../utils/utils');

class UserService {
  async registration(email, password) {
    const candidate = await UserModel.findOne({email})
    if (candidate) {
      throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`)
    }
    const hashPassword = await bcrypt.hash(password, 3);
    const activationLink = uuid.v4();
    const user = await UserModel.create({email, password: hashPassword, activationLink});

    const userDto = new UserDto(user);
    const tokens = tokenService.generateToken({...userDto});
    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    user.lastLoginDate = new Date();
    user.status = 'Active';
    await user.save();
    return { ...tokens, user: userDto }
  }

  async login(email, password) {
    const user = await UserModel.findOne({email})
    if (!user) {
      throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} не был найден`)
    }
    const isPassValid = await bcrypt.compare(password, user.password);
    if (!isPassValid) {
      throw ApiError.BadRequest(`Неверный пароль`)
    }

    user.lastLoginDate = formatDate(new Date());
    user.status = 'Active';
    await user.save();
    const userDto = new UserDto(user);
    const tokens = tokenService.generateToken({...userDto});
    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return { ...tokens, user: userDto }
  }

  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }
    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await tokenService.findToken(refreshToken);
    if (!userData || !tokenFromDb) {
        throw ApiError.UnauthorizedError();
    }
    const user = await UserModel.findById(userData.id);
    const userDto = new UserDto(user);
    const tokens = tokenService.generateToken({...userDto});

    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return {...tokens, user: userDto}
  }

  async getAllUsers() {
    const users = await UserModel.find();
    return users;
  }

  async deleteUser(_id) {
    const user = await UserModel.findById(_id);
    if (!user) {
      throw ApiError.NotFound();
    }
    await UserModel.deleteOne({ _id });
    return { message: `Пользователь с идентификатором ${_id} удален` };
  }

  async blockUser(_id) {
    const user = await UserModel.findById(_id);
    if (!user) {
      throw ApiError.NotFound();
    }
    user.status = 'Blocked';
    await user.save();
    return { message: `Пользователь с идентификатором ${_id} заблокирован` };
  }

  async unblockUser(_id) {
    const user = await UserModel.findById(_id);
    if (!user) {
      throw ApiError.NotFound();
    }
    user.status = 'Active';
    await user.save();
    return { message: `Пользователь с идентификатором ${_id} разблокирован` };
  }

  async findByEmail(email) {
    const user = await UserModel.findOne({ email });
    return user;
  }
}

module.exports = new UserService();
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(user: Partial<User>): Promise<UserDocument> {
    const createdUser = new this.userModel(user);
    return createdUser.save();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).select('+password +refreshToken').exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    const user = await this.userModel.findById(id).select('+password +refreshToken').exec();

    if (!user) {
      throw new NotFoundException(`Foydalanuvchi topilmadi: ID ${id}`);
    }
    return user;
  }

  async update(id: string, updateData: Partial<User>): Promise<UserDocument | null> {
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    const updatedUser = await this.userModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    if (!updatedUser) {
      throw new NotFoundException(`Foydalanuvchi topilmadi: ID ${id}`);
    }
    return updatedUser;
  }

  async updateRefreshToken(userId: string, refreshTokenId: string): Promise<UserDocument | null> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { refreshToken: refreshTokenId },
      { new: true, select: false }
    ).exec();
    if (!user) {
      throw new NotFoundException(`Foydalanuvchi topilmadi: ID ${userId}`);
    }
    return user;
  }

  async remove(id: string): Promise<UserDocument | null> {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    if (!deletedUser) {
      throw new NotFoundException(`Foydalanuvchi topilmadi: ID ${id}`);
    }
    return deletedUser;
  }
}
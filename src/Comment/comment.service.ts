import { Injectable, NotFoundException, ConflictException, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ProductService } from '../Product/product.service';
import { User, UserDocument } from '../User/schemas/user.schema';

@Injectable()
export class CommentService {
  private readonly logger = new Logger(CommentService.name);

  constructor(
    @InjectModel(Comment.name) private readonly commentModel: Model<CommentDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly productService: ProductService,
  ) {}

  async create(userId: string, createCommentDto: CreateCommentDto): Promise<Comment> {
    this.logger.log(`[CreateComment] Attempting to create comment. User: ${userId}, Product: ${createCommentDto.product}`);

    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(createCommentDto.product)) {
      throw new BadRequestException('Foydalanuvchi yoki mahsulot IDsi noto\'g\'ri formatda.');
    }

    const userObjectId = new Types.ObjectId(userId);
    const productObjectId = new Types.ObjectId(createCommentDto.product);

    const productExists = await this.productService.findOne(createCommentDto.product);
    if (!productExists) {
      this.logger.warn(`[CreateComment] Product not found with ID: ${createCommentDto.product}`);
      throw new NotFoundException('Kommentariya qilinayotgan mahsulot topilmadi.');
    }

    try {
      const newComment = new this.commentModel({
        user: userObjectId,
        product: productObjectId,
        text: createCommentDto.text,
        rating: createCommentDto.rating,
      });
      const savedComment = await newComment.save();
      this.logger.log(`[CreateComment] Comment saved successfully: ${JSON.stringify(savedComment)}`);
      return savedComment;
    } catch (error) {
      this.logger.error(`[CreateComment] Error saving comment: ${error.message}`, error.stack);
      throw new BadRequestException('Kommentariya yaratishda xatolik yuz berdi.');
    }
  }

  async findAll(): Promise<Comment[]> {
    this.logger.log(`[FindAllComments] Fetching all comments.`);
    return this.commentModel.find()
      .populate('user', 'username email')
      .populate('product', 'name company productModel')
      .exec();
  }

  async findByProduct(productId: string): Promise<Comment[]> {
    this.logger.log(`[FindByProduct] Fetching comments for product ID: ${productId}`);
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException('Mahsulot IDsi noto\'g\'ri formatda.');
    }
    return this.commentModel.find({ product: new Types.ObjectId(productId) })
      .populate('user', 'username email')
      .populate('product', 'name')
      .exec();
  }

  async findByUser(userId: string): Promise<Comment[]> {
    this.logger.log(`[FindByUser] Fetching comments by user ID: ${userId}`);
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Foydalanuvchi IDsi noto\'g\'ri formatda.');
    }
    return this.commentModel.find({ user: new Types.ObjectId(userId) })
      .populate('user', 'username email')
      .populate('product', 'name')
      .exec();
  }

  async findOne(commentId: string): Promise<Comment> {
    this.logger.log(`[FindOneComment] Fetching comment with ID: ${commentId}`);
    if (!Types.ObjectId.isValid(commentId)) {
      throw new BadRequestException('Kommentariya IDsi noto\'g\'ri formatda.');
    }
    const comment = await this.commentModel.findById(commentId)
      .populate('user', 'username email')
      .populate('product', 'name company productModel')
      .exec();
    if (!comment) {
      throw new NotFoundException('Kommentariya topilmadi.');
    }
    return comment;
  }

  async update(commentId: string, userId: string, updateCommentDto: UpdateCommentDto): Promise<Comment> {
    this.logger.log(`[UpdateComment] Attempting to update comment. ID: ${commentId}, User: ${userId}`);
    if (!Types.ObjectId.isValid(commentId) || !Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Kommentariya yoki foydalanuvchi IDsi noto\'g\'ri formatda.');
    }

    const comment = await this.commentModel.findOne({ _id: commentId, user: new Types.ObjectId(userId) }).exec();
    if (!comment) {
      throw new NotFoundException('Kommentariya topilmadi yoki uni yangilashga ruxsat yo\'q.');
    }

    if (updateCommentDto.text !== undefined) {
      comment.text = updateCommentDto.text;
    }
    if (updateCommentDto.rating !== undefined) {
      comment.rating = updateCommentDto.rating;
    }

    const updatedComment = await comment.save();
    this.logger.log(`[UpdateComment] Comment updated successfully: ${JSON.stringify(updatedComment)}`);
    return updatedComment;
  }

  async remove(commentId: string, userId: string, isAdmin: boolean = false): Promise<void> {
    this.logger.log(`[RemoveComment] Attempting to remove comment. ID: ${commentId}, User: ${userId}, IsAdmin: ${isAdmin}`);
    if (!Types.ObjectId.isValid(commentId) || !Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Kommentariya yoki foydalanuvchi IDsi noto\'g\'ri formatda.');
    }

    let query: any = { _id: commentId };
    if (!isAdmin) {
      query.user = new Types.ObjectId(userId);
    }

    const result = await this.commentModel.deleteOne(query).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Kommentariya topilmadi yoki uni o\'chirishga ruxsat yo\'q.');
    }
    this.logger.log(`[RemoveComment] Comment ${commentId} successfully removed.`);
  }
}
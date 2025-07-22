import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose'; 
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryDocument> {
    this.logger.log(`Attempting to create category: ${createCategoryDto.name}`);
    
    const existingCategory = await this.categoryModel.findOne({ name: createCategoryDto.name }).exec();
    if (existingCategory) {
      this.logger.warn(`Category name already taken: ${createCategoryDto.name}`);
      throw new ConflictException('A category with this name already exists.');
    }

    const createdCategory = new this.categoryModel(createCategoryDto);
    try {
      const savedCategory = await createdCategory.save();
      this.logger.log(`Category created successfully: ${savedCategory.name}`);
      return savedCategory;
    } catch (error) {
      this.logger.error(`Error creating category: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(): Promise<CategoryDocument[]> {
    this.logger.debug('Fetching all categories...');
    return this.categoryModel.find().exec();
  }

  async findOne(id: string): Promise<CategoryDocument> {
    this.logger.debug(`Searching for category with ID: ${id}`);
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      this.logger.warn(`Category not found for ID: ${id}`);
      throw new NotFoundException(`Category with ID ${id} not found.`);
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryDocument> {
    this.logger.log(`Updating category with ID: ${id}`);
    const existingCategory = await this.categoryModel.findById(id).exec();
    if (!existingCategory) {
      this.logger.warn(`Category not found for update: ${id}`);
      throw new NotFoundException(`Category with ID ${id} not found.`);
    }

    if (updateCategoryDto.name && updateCategoryDto.name !== existingCategory.name) {
      const categoryWithName = await this.categoryModel.findOne({ name: updateCategoryDto.name }).exec();
      if (categoryWithName && (categoryWithName._id as Types.ObjectId).toString() !== id) {
        this.logger.warn(`Update failed: Category name '${updateCategoryDto.name}' is already taken by another category.`);
        throw new ConflictException('A category with this name already exists.');
      }
    }

    const updatedCategory = await this.categoryModel.findByIdAndUpdate(id, updateCategoryDto, { new: true }).exec();
    if (!updatedCategory) {

      this.logger.error(`Category update failed unexpectedly for ID: ${id}`);
      throw new NotFoundException(`Category with ID ${id} not found after update attempt.`);
    }

    try {
      this.logger.log(`Category updated successfully: ID ${id}`);
      return updatedCategory;
    } catch (error) {
      this.logger.error(`Error updating category: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Attempting to delete category with ID: ${id}`);
    const result = await this.categoryModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      this.logger.warn(`Deletion failed: Category not found for ID: ${id}`);
      throw new NotFoundException(`Category with ID ${id} not found.`);
    }
    this.logger.log(`Category deleted successfully: ID ${id}`);
  }
}
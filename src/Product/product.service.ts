import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CategoryService } from '../Category/category.service';
import { UserService } from '../User/user.service';
import { UserDocument } from '../User/schemas/user.schema';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private readonly categoryService: CategoryService,
    private readonly userService: UserService,
  ) {}

  async create(createProductDto: CreateProductDto, userId: string): Promise<ProductDocument> {
    this.logger.log(`Attempting to create product: ${createProductDto.name} by user ID: ${userId}`);

    const category = await this.categoryService.findOne(createProductDto.category);
    if (!category) {
      this.logger.warn(`Category with ID ${createProductDto.category} not found.`);
      throw new NotFoundException(`Category with ID ${createProductDto.category} not found.`);
    }

    const user: UserDocument | null = await this.userService.findById(userId);
    if (!user) {
      this.logger.error(`User with ID ${userId} not found, but trying to create product.`);
      throw new BadRequestException('Creator user not found or invalid ID.');
    }

    const variantsWithInitialSoldQuantity = createProductDto.variants.map((variant) => ({
      ...variant,
      soldQuantity: variant.soldQuantity || 0,
    }));

    const createdProduct = new this.productModel({
      ...createProductDto,
      category: new Types.ObjectId(createProductDto.category),
      created_by: new Types.ObjectId(userId),
      variants: variantsWithInitialSoldQuantity,
      technical_specs: createProductDto.technical_specs || {}, 
    });

    try {
      const savedProduct = await createdProduct.save();
      this.logger.log(`Product created successfully: ${savedProduct.name}, ID: ${savedProduct._id}`);
      return savedProduct.populate(['category', 'created_by']);
    } catch (error) {
      this.logger.error(`Error creating product: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(search?: string, categoryId?: string, minPrice?: number, maxPrice?: number): Promise<ProductDocument[]> {
    this.logger.debug('Fetching all products...');
    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { productModel: { $regex: search, $options: 'i' } },
      ];
      this.logger.debug(`Applying search filter: ${search}`);
    }

    if (categoryId) {
      if (!Types.ObjectId.isValid(categoryId)) {
        throw new BadRequestException('Invalid category ID format.');
      }
      query.category = new Types.ObjectId(categoryId);
      this.logger.debug(`Applying category filter: ${categoryId}`);
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.basePrice = {};
      if (minPrice !== undefined) {
        query.basePrice.$gte = minPrice;
      }
      if (maxPrice !== undefined) {
        query.basePrice.$lte = maxPrice;
      }
    }

    query.isActive = true;

    const products = await this.productModel
      .find(query)
      .populate('category')
      .populate('created_by')
      .populate('likesCount')
      .populate('commentsCount')
      .exec();

    this.logger.debug(`Found ${products.length} products.`);
    return products;
  }

  async findOne(id: string): Promise<ProductDocument> {
    this.logger.debug(`Searching for product with ID: ${id}`);
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID format.');
    }
    const product = await this.productModel
      .findById(id)
      .populate('category')
      .populate('created_by')
      .populate('likesCount')
      .populate('commentsCount')
      .exec();
    if (!product) {
      this.logger.warn(`Product not found for ID: ${id}`);
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<ProductDocument> {
    this.logger.log(`Updating product with ID: ${id}`);
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID format.');
    }

    const existingProduct = await this.productModel.findById(id).exec();
    if (!existingProduct) {
      this.logger.warn(`Product not found for update: ${id}`);
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }

    if (updateProductDto.category && updateProductDto.category.toString() !== existingProduct.category.toString()) {
      const category = await this.categoryService.findOne(updateProductDto.category);
      if (!category) {
        this.logger.warn(`Update failed: Category with ID ${updateProductDto.category} not found.`);
        throw new NotFoundException(`Category with ID ${updateProductDto.category} not found.`);
      }
    }

    if (updateProductDto.variants) {
        const updatedVariants = [...existingProduct.variants];
        updateProductDto.variants.forEach(incomingVariant => {
            const existingVariantIndex = updatedVariants.findIndex(
                v => v.name === incomingVariant.name && v.color === incomingVariant.color && (v.size || '') === (incomingVariant.size || '')
            );
            if (existingVariantIndex > -1) {
                updatedVariants[existingVariantIndex] = {
                    ...updatedVariants[existingVariantIndex],
                    ...incomingVariant,
                    soldQuantity: updatedVariants[existingVariantIndex].soldQuantity || 0 
                };
            } else {
                updatedVariants.push({ ...incomingVariant, soldQuantity: incomingVariant.soldQuantity || 0 });
            }
        });
        (updateProductDto as any).variants = updatedVariants;
    }

    try {
      const updatedProduct = await this.productModel
        .findByIdAndUpdate(id, updateProductDto, { new: true, runValidators: true })
        .populate('category')
        .populate('created_by')
        .populate('likesCount')
        .populate('commentsCount')
        .exec();

      if (!updatedProduct) {
        this.logger.error(`Product update failed unexpectedly for ID: ${id}`);
        throw new NotFoundException(`Product with ID ${id} not found after update attempt.`);
      }

      this.logger.log(`Product updated successfully: ID ${id}`);
      return updatedProduct;
    } catch (error) {
      this.logger.error(`Error updating product: ${error.message}`, error.stack);
      if (error.name === 'ValidationError') {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Attempting to delete product with ID: ${id}`);
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID format.');
    }
    const result = await this.productModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      this.logger.warn(`Deletion failed: Product not found for ID: ${id}`);
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }
    this.logger.log(`Product deleted successfully: ID ${id}`);
  }

  async updateProductVariantStock(productId: string, variantName: string, quantityChange: number): Promise<void> {
    this.logger.log(`Updating stock for product ID: ${productId}, variant: ${variantName}, change: ${quantityChange}`);
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException('Invalid product ID format.');
    }

    const product = await this.productModel.findById(productId).exec();
    if (!product) {
      this.logger.warn(`Product not found for stock update: ${productId}`);
      throw new NotFoundException(`Product with ID ${productId} not found.`);
    }

    const variant = product.variants.find((v) => v.name === variantName);
    if (!variant) {
      this.logger.warn(`Variant '${variantName}' not found for product ID: ${productId}`);
      throw new NotFoundException(`Variant '${variantName}' not found for product ID ${productId}.`);
    }

    if (variant.quantity + quantityChange < 0) {
      this.logger.warn(`Insufficient stock for variant '${variantName}' of product ID: ${productId}. Current: ${variant.quantity}, Change: ${quantityChange}`);
      throw new BadRequestException(`Insufficient stock for variant '${variantName}'. Available: ${variant.quantity}`);
    }

    variant.quantity += quantityChange;
   
    variant.soldQuantity -= quantityChange; 

    try {
      await product.save();
      this.logger.log(`Stock updated successfully for variant '${variantName}' of product ID: ${productId}. New quantity: ${variant.quantity}, New sold: ${variant.soldQuantity}`);
    } catch (error) {
      this.logger.error(`Error updating stock for product ID: ${productId}, variant: ${variantName}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getNewArrivals(limit = 10): Promise<ProductDocument[]> {
    this.logger.log(`Fetching ${limit} new arrival products.`);
    return this.productModel.find({ isActive: true, isNewArrival: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('category')
      .populate('created_by')
      .populate('likesCount')
      .populate('commentsCount')
      .exec();
  }

  async getBestSellers(limit = 10): Promise<ProductDocument[]> {
    this.logger.log(`Fetching ${limit} best seller products.`);
    
    return this.productModel.find({ isActive: true, isBestSeller: true })
      .sort({ soldCount: -1 }) 
      .limit(limit)
      .populate('category')
      .populate('created_by')
      .populate('likesCount')
      .populate('commentsCount')
      .exec();
  }

  async getFeaturedProducts(limit = 10): Promise<ProductDocument[]> {
    this.logger.log(`Fetching ${limit} featured products.`);
    return this.productModel.find({ isActive: true, isFeatured: true })
      .limit(limit)
      .populate('category')
      .populate('created_by')
      .populate('likesCount')
      .populate('commentsCount')
      .exec();
  }
}
import { Injectable, NotFoundException, BadRequestException, Logger, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { User, UserDocument } from '../User/schemas/user.schema';
import { Product, ProductDocument } from '../Product/schemas/product.schema';
import { ProductService } from '../Product/product.service';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    private readonly productService: ProductService,
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    this.logger.log(`[CreateOrder] Attempting to create order for user: ${userId}`);

    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Foydalanuvchi IDsi noto\'g\'ri formatda.');
    }

    for (const item of createOrderDto.orderItems) {
      if (!Types.ObjectId.isValid(item.product)) {
        throw new BadRequestException(`Buyurtma elementidagi mahsulot IDsi "${item.product}" noto'g'ri formatda.`);
      }

      const product = await this.productModel.findById(item.product).exec();
      if (!product) {
        this.logger.warn(`[CreateOrder] Product not found with ID: ${item.product} for item: ${item.name}`);
        throw new NotFoundException(`Mahsulot topilmadi: ${item.name} (${item.product})`);
      }

      const selectedVariant = product.variants.find(v =>
        v.name === item.selectedVariant.name &&
        v.color === item.selectedVariant.color &&
        (item.selectedVariant.size ? v.size === item.selectedVariant.size : true) &&
        (item.selectedVariant.material ? v.material === item.selectedVariant.material : true)
      );

      if (!selectedVariant) {
        throw new BadRequestException(`Mahsulot "${item.name}" uchun tanlangan variant topilmadi.`);
      }
      if (selectedVariant.quantity < item.quantity) {
        throw new BadRequestException(`Mahsulot "${item.name}" ning "${selectedVariant.name}" variantida yetarli miqdor mavjud emas. Mavjud: ${selectedVariant.quantity}, So'ralgan: ${item.quantity}`);
      }
    }

    try {
      const newOrder = new this.orderModel({
        user: new Types.ObjectId(userId),
        orderItems: createOrderDto.orderItems.map(item => ({
          ...item,
          product: new Types.ObjectId(item.product),
        })),
        shippingAddress: createOrderDto.shippingAddress,
        paymentInfo: createOrderDto.paymentInfo,
        itemsPrice: createOrderDto.itemsPrice,
        shippingPrice: createOrderDto.shippingPrice,
        taxPrice: createOrderDto.taxPrice,
        totalPrice: createOrderDto.totalPrice,
        status: createOrderDto.status || 'pending',
        deliveredAt: createOrderDto.deliveredAt,
      });

      const savedOrder = await newOrder.save();

      for (const item of createOrderDto.orderItems) {
        const product = await this.productModel.findById(item.product).exec();
        if (product) {
            const selectedVariant = product.variants.find(v =>
                v.name === item.selectedVariant.name &&
                v.color === item.selectedVariant.color &&
                (item.selectedVariant.size ? v.size === item.selectedVariant.size : true) &&
                (item.selectedVariant.material ? v.material === item.selectedVariant.material : true)
            );

            if (selectedVariant) {
                selectedVariant.quantity -= item.quantity;
                selectedVariant.soldQuantity += item.quantity;
                await product.save();
                this.logger.debug(`[CreateOrder] Updated stock for product ${product.name}, variant ${selectedVariant.name}. New quantity: ${selectedVariant.quantity}, Sold: ${selectedVariant.soldQuantity}`);
            } else {
                this.logger.warn(`[CreateOrder] Could not find selected variant for product ${item.name} (${item.product}) during stock update.`);
            }
        } else {
            this.logger.error(`[CreateOrder] Product ${item.product} not found during stock update, despite initial check.`);
        }
      }

      this.logger.log(`[CreateOrder] Order created successfully: ${savedOrder._id}`);
      return savedOrder;
    } catch (error) {
      this.logger.error(`[CreateOrder] Error creating order: ${error.message}`, error.stack);
      throw new BadRequestException('Buyurtma yaratishda xatolik yuz berdi: ' + error.message);
    }
  }

  async findAll(): Promise<Order[]> {
    this.logger.log('[FindAllOrders] Fetching all orders.');
    return this.orderModel.find()
      .populate('user', 'username email')
      .populate({
        path: 'orderItems.product',
        select: 'name company productModel images',
      })
      .exec();
  }

  async findMyOrders(userId: string): Promise<Order[]> {
    this.logger.log(`[FindMyOrders] Fetching orders for user ID: ${userId}`);
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Foydalanuvchi IDsi noto\'g\'ri formatda.');
    }
    return this.orderModel.find({ user: new Types.ObjectId(userId) })
      .populate({
        path: 'orderItems.product',
        select: 'name company productModel images',
      })
      .exec();
  }

  async findOne(orderId: string, userId?: string, isAdmin: boolean = false): Promise<Order> {
    this.logger.log(`[FindOneOrder] Fetching order with ID: ${orderId}. User: ${userId}, IsAdmin: ${isAdmin}`);
    if (!Types.ObjectId.isValid(orderId)) {
      throw new BadRequestException('Buyurtma IDsi noto\'g\'ri formatda.');
    }

    let query: any = { _id: orderId };
    if (!isAdmin && userId) {
      query.user = new Types.ObjectId(userId);
    }

    const order = await this.orderModel.findOne(query)
      .populate('user', 'username email')
      .populate({
        path: 'orderItems.product',
        select: 'name company productModel images',
      })
      .exec();

    if (!order) {
      throw new NotFoundException('Buyurtma topilmadi.');
    }
    return order;
  }

  async updateStatus(orderId: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    this.logger.log(`[UpdateOrderStatus] Attempting to update status for order: ${orderId}`);
    if (!Types.ObjectId.isValid(orderId)) {
      throw new BadRequestException('Buyurtma IDsi noto\'g\'ri formatda.');
    }

    const order = await this.orderModel.findById(orderId).exec();
    if (!order) {
      throw new NotFoundException('Buyurtma topilmadi.');
    }

    if (updateOrderDto.status) {
      order.status = updateOrderDto.status;
    }

    if (updateOrderDto.deliveredAt) {
        order.deliveredAt = updateOrderDto.deliveredAt;
    }

    if (updateOrderDto['paymentInfo.isPaid'] !== undefined) {
      if (!order.paymentInfo) {
          order.paymentInfo = { method: 'unknown', isPaid: updateOrderDto['paymentInfo.isPaid'] };
      } else {
          order.paymentInfo.isPaid = updateOrderDto['paymentInfo.isPaid'];
      }
    }

    const updatedOrder = await order.save();
    this.logger.log(`[UpdateOrderStatus] Order ${orderId} status updated to: ${updatedOrder.status}`);
    return updatedOrder;
  }

  async remove(orderId: string): Promise<void> {
    this.logger.log(`[RemoveOrder] Attempting to remove order: ${orderId}`);
    if (!Types.ObjectId.isValid(orderId)) {
      throw new BadRequestException('Buyurtma IDsi noto\'g\'ri formatda.');
    }

    const result = await this.orderModel.deleteOne({ _id: orderId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Buyurtma topilmadi.');
    }
    this.logger.log(`[RemoveOrder] Order ${orderId} successfully removed.`);
  }
}
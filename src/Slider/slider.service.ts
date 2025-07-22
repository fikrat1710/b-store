import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Slider, SliderDocument } from './schemas/slider.schema';
import { CreateSliderDto } from './dto/create-slider.dto';
import { UpdateSliderDto } from './dto/update-slider.dto';
import { Product, ProductDocument } from '../Product/schemas/product.schema';

@Injectable()
export class SliderService {
  private readonly logger = new Logger(SliderService.name);

  constructor(
    @InjectModel(Slider.name) private readonly sliderModel: Model<SliderDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
  ) {}

  async create(createSliderDto: CreateSliderDto): Promise<Slider> {
    this.logger.log(`[CreateSlider] Attempting to create slider with image: ${createSliderDto.image}`);

    if (createSliderDto.product && !Types.ObjectId.isValid(createSliderDto.product)) {
      throw new BadRequestException('Mahsulot IDsi noto\'g\'ri formatda.');
    }
    if (createSliderDto.product) {
      const productExists = await this.productModel.findById(createSliderDto.product).exec();
      if (!productExists) {
        throw new NotFoundException(`Mahsulot IDsi "${createSliderDto.product}" topilmadi.`);
      }
    }

    const newSlider = new this.sliderModel({
      ...createSliderDto,
      product: createSliderDto.product ? new Types.ObjectId(createSliderDto.product) : null,
    });
    const savedSlider = await newSlider.save();
    this.logger.log(`[CreateSlider] Slider created successfully with ID: ${savedSlider._id}`);
    return savedSlider;
  }

  async findAll(): Promise<Slider[]> {
    this.logger.log('[FindAllSliders] Fetching all sliders.');
    return this.sliderModel.find().populate('product', 'name images basePrice').sort({ order: 1 }).exec();
  }

  async findActive(): Promise<Slider[]> {
    this.logger.log('[FindActiveSliders] Fetching active sliders.');
    return this.sliderModel.find({ isActive: true }).populate('product', 'name images basePrice').sort({ order: 1 }).exec();
  }

  async findOne(id: string): Promise<Slider> {
    this.logger.log(`[FindOneSlider] Fetching slider with ID: ${id}`);
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Slayder IDsi noto\'g\'ri formatda.');
    }
    const slider = await this.sliderModel.findById(id).populate('product', 'name images basePrice').exec();
    if (!slider) {
      throw new NotFoundException('Slayder topilmadi.');
    }
    return slider;
  }

  async update(id: string, updateSliderDto: UpdateSliderDto): Promise<Slider> {
    this.logger.log(`[UpdateSlider] Attempting to update slider with ID: ${id}`);
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Slayder IDsi noto\'g\'ri formatda.');
    }

    if (updateSliderDto.product) {
      if (!Types.ObjectId.isValid(updateSliderDto.product)) {
        throw new BadRequestException('Mahsulot IDsi noto\'g\'ri formatda.');
      }
      const productExists = await this.productModel.findById(updateSliderDto.product).exec();
      if (!productExists) {
        throw new NotFoundException(`Mahsulot IDsi "${updateSliderDto.product}" topilmadi.`);
      }
    } else if (updateSliderDto.product === null) {
      updateSliderDto.product = null;
    }


    const updatedSlider = await this.sliderModel.findByIdAndUpdate(
      id,
      {
        ...updateSliderDto,
        product: updateSliderDto.product === undefined ? undefined : updateSliderDto.product === null ? null : new Types.ObjectId(updateSliderDto.product),
      },
      { new: true }
    ).populate('product', 'name images basePrice').exec();

    if (!updatedSlider) {
      throw new NotFoundException('Slayder topilmadi.');
    }
    this.logger.log(`[UpdateSlider] Slider updated successfully: ${updatedSlider._id}`);
    return updatedSlider;
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`[RemoveSlider] Attempting to remove slider with ID: ${id}`);
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Slayder IDsi noto\'g\'ri formatda.');
    }
    const result = await this.sliderModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Slayder topilmadi.');
    }
    this.logger.log(`[RemoveSlider] Slider ${id} successfully removed.`);
  }
}
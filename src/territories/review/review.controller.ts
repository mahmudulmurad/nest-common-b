import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewDto } from 'src/dto/review.dto';
import { AuthGuard } from 'src/auth';
import { ResponseService } from 'src/service/response.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CustomRequest } from 'src/interface/customRequest.interface';

@ApiTags('PRODUCT-REVIEW')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('review')
export class ReviewController {
  constructor(
    private readonly reviewService: ReviewService,
    private readonly responseService: ResponseService,
  ) {}

  @Get('/:productId')
  async getHello(@Param('productId') productId: string) {
    const reviews = await this.reviewService.allReviews(productId);

    return this.responseService.toDtosResponse(
      HttpStatus.OK,
      'List of all reviews of product',
      reviews,
    );
  }

  @Post('/create-review/:productId')
  async signUp(
    @Req() request: CustomRequest,
    @Param('productId') productId: string,
    @Body() reviewDto: ReviewDto,
  ) {
    const userId = request.user?.id;
    const review = await this.reviewService.createReview(
      userId,
      productId,
      reviewDto,
    );

    return this.responseService.toDtoResponse(
      HttpStatus.CREATED,
      'Review Creation successful',
      review,
    );
  }
}

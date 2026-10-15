import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Product, ProductReview, User } from '../../entities';
import { ReviewService } from './review.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ReviewController } from './review.controller';
import { ResponseService } from 'src/service/response.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'LOGGER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 3110,
        },
      },
    ]),
    TypeOrmModule.forFeature([ProductReview, Product, User]),
    JwtModule.register({
      secret: process.env.JWS_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [ReviewController],
  providers: [ReviewService, ResponseService],
})
export class ReviewModule {}

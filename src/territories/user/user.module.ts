import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Notification, User } from '../../entities';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { S3Module } from 'src/custom-interceptor/s3Module';

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
    TypeOrmModule.forFeature([User, Notification]),
    JwtModule.register({
      secret: process.env.JWS_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    S3Module,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}

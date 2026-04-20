import {
  Controller,
  Post,
  Body,
  Patch,
  UploadedFile,
  Req,
  UseGuards,
  Get,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { SignUpDto } from '../../dto/singup.dto';
import { LoginDto } from '../../dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UserUpdateDto } from 'src/dto/user-update.dto';
import { UploadFileInterceptorS3 } from 'src/custom-interceptor/fileUpload.interceptor';
import { CustomRequest } from 'src/interface/customRequest.interface';
import { AuthGuard } from 'src/auth';
import * as fs from 'fs';
import * as path from 'path';
import { Request, Response } from 'express';
import { CustomFileTypeForS3 } from 'src/interface/customFileTypeForS3';

@ApiTags('USER')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('/signup')
  async signUp(@Body() signUpDto: SignUpDto) {
    const user = await this.userService.signUp(signUpDto);
    const accessToken = await this.jwtService.signAsync(
      {
        id: user.id,
        username: user.username,
      },
      {
        expiresIn: '1d',
      },
    );
    return { user, accessToken };
  }

  @Post('/login')
  async login(@Body() loginDto: LoginDto) {
    try {
      return this.userService.login(loginDto);
    } catch (error) {
      console.error('Error sending message to loggerService:', error);
    }
  }

  //for storing file in running server
  // @Patch('/update')
  // @ApiConsumes('multipart/form-data')
  // @ApiBody({ type: UserUpdateDto })
  // @UploadFileInterceptorMemory('profile_picture')
  // @ApiBearerAuth()
  // @UseGuards(AuthGuard)
  // async updateProfile(
  //   @Body() dto: UserUpdateDto,
  //   @UploadedFile()
  //   profile_picture: Express.Multer.File,
  //   @Req() request: CustomRequest,
  // ) {
  //   try {
  //     const userId = request.user?.id;
  //     return this.userService.update(profile_picture, dto, userId);
  //   } catch (error) {
  //     console.error('Error sending message to loggerService:', error);
  //   }
  // }

  //for storing file in aws-s3
  @Patch('/update')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UserUpdateDto })
  @UploadFileInterceptorS3('profile_picture', 'users')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async updateProfile(
    @Body() dto: UserUpdateDto,
    @UploadedFile()
    profile_picture: CustomFileTypeForS3,
    @Req() request: CustomRequest,
  ) {
    try {
      const userId = request.user?.id;
      return this.userService.update(profile_picture, dto, userId);
    } catch (error) {
      console.error('Error sending message to loggerService:', error);
    }
  }

  @Get('/watch')
  watch(@Req() req: Request, @Res() res: Response) {
    const videoPath = path.join(__dirname, '..', '..', '..', 'file.mp4');

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;

    const range = req.headers.range;

    if (!range) {
      // First request – browser expects range
      res.status(416).send('Range header required');
      return;
    }

    const chunkSize = 1 * 1e6; // 1MB
    const start = Number(range.replace(/\D/g, ''));
    const end = Math.min(start + chunkSize, fileSize - 1);

    const contentLength = end - start + 1;

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': contentLength,
      'Content-Type': 'video/mp4',
    });

    const stream = fs.createReadStream(videoPath, { start, end });
    stream.pipe(res);
  }
}

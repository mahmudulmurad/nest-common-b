import {
  Controller,
  Post,
  Body,
  Patch,
  UseInterceptors,
  UploadedFile,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { SignUpDto } from '../../dto/singup.dto';
import { LoginDto } from '../../dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UserUpdateDto } from 'src/dto/user-update.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadFileInterceptorMemory } from 'src/custom-interceptor/fileUpload.interceptor';
import { CustomRequest } from 'src/interface/customRequest.interface';
import { AuthGuard } from 'src/auth';

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

  @Patch('/update')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UserUpdateDto })
  @UploadFileInterceptorMemory('profile_picture')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async updateProfile(
    @Body() dto: UserUpdateDto,
    @UploadedFile()
    profile_picture: Express.Multer.File,
    @Req() request: CustomRequest,
  ) {
    try {
      const userId = request.user?.id;
      return this.userService.update(profile_picture, dto, userId);
    } catch (error) {
      console.error('Error sending message to loggerService:', error);
    }
  }
}

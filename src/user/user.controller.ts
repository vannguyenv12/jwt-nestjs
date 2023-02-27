import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { User } from './user.entity';
import { UserService } from './user.service';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dtos/login-user.dto';
import { CurrentUser } from 'src/decorators/current-user.decorator';

interface RequestUser extends Request {
  currentUser?: User;
}

@Controller('auth')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/register')
  async register(
    @Body() body: CreateUserDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const password = await bcrypt.hash(body.password, 8);
    return this.userService.register(body.username, password, res);
  }

  @Post('/login')
  async login(
    @Body() body: LoginUserDto,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.userService.login(body.username, body.password, res);
  }

  @Get('/whoami')
  async whoAmI(@CurrentUser() user: User) {
    return user;
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('/:id')
  find(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch('/:id')
  update(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.userService.update(+id, body);
  }

  @Delete('/:id')
  delete(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Req,
  Res,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: number): Promise<User> {
    return this.usersRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async register(
    username: string,
    password: string,
    @Res({ passthrough: true }) res: Response
  ) {
    const user = this.usersRepository.create({ username, password });

    const jwt = this.jwtService.sign({ id: user.id });
    res.cookie('token', jwt);

    return this.usersRepository.save(user);
  }

  async login(
    username: string,
    password: string,
    @Res({ passthrough: true }) res: Response
  ) {
    const user = await this.usersRepository.findOne({ where: { username } });
    if (!user) throw new NotFoundException('Not found username');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new BadRequestException('Wrong password!');

    const jwt = this.jwtService.sign({ id: user.id });
    res.cookie('token', jwt);

    return user;
  }

  async who(@Req() request: Request) {
    const jwt = request.cookies['token'];

    const decoded = await this.jwtService.verifyAsync(jwt);
    const user = await this.findOne(decoded.id);

    return user;
  }

  async update(id: number, attrs: Partial<User>) {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) throw new NotFoundException('No user with that id');

    Object.assign(user, attrs);

    return this.usersRepository.save(user);
  }
}

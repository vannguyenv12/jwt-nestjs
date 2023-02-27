import { IsString, IsBoolean } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsBoolean()
  isAdmin: boolean;
}

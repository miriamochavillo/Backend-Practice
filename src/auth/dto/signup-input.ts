import { IsString, IsNotEmpty, IsEmail } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';
@InputType()
export class SignUpInput {
  @IsNotEmpty()
  @IsString()
  @Field()
  userName: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @Field()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Field()
  password: string;
}

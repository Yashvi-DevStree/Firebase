/* eslint-disable prettier/prettier */
import { IsEmail, IsString } from 'class-validator';

export class RoleDto {
    @IsEmail()
    email: string;

    @IsString()
    role: string;
}
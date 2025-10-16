/* eslint-disable prettier/prettier */
import { IsNumber, IsOptional, IsString, Min } from "class-validator";

export class IncrementViewsDto{
    @IsNumber()
    @Min(1)
    incrementBy: number;

    @IsOptional()
    @IsString()
    userId?: string;
}
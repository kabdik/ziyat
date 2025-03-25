import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl } from "class-validator";

export class CreateUniversityDto {
    @IsNotEmpty()
    @IsString()
    name: string

    @IsNotEmpty()
    @IsString()
    country: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsNumber()
    rating: number;

    @IsOptional()
    @IsUrl()
    @IsString()
    websiteUrl?: string;
}
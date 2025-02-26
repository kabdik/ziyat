import { IsNotEmpty, IsNumber, IsString } from "class-validator";

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
}
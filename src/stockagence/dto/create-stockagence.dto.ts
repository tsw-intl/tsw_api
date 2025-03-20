import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Schema as MongooseSchema } from 'mongoose';
export class CreateStockagenceDto {
    
    @ApiProperty({
        example: '5efvbe54edfgbknjlh45',
        description: 'The country id ',
    })
    @IsString()
    @IsNotEmpty()
    agenceId: string;

    @ApiProperty({
        example: '5efvbe54edfgjkhklh45',
        description: 'The product id',
    })
    @IsString()
    @IsNotEmpty()
    productId: string;

    @ApiProperty({
        example: '30000',
        description: 'The quantity product',
    })
    @IsNumber()
    @IsNotEmpty()
    quantity: number;

    @ApiProperty({
        example: '30000',
        description: 'The quantity product',
    })
    @IsNumber()
    quantitytotalenmagasin: number;
}

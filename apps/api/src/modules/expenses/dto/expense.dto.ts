import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateExpenseDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsString()
  payerId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  splitUserIds!: string[];

  @IsOptional()
  @IsString()
  @MaxLength(60)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @IsOptional()
  @IsDateString()
  expenseDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}

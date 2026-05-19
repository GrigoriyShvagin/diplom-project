import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class RecentMessageDto {
  @IsString()
  @MaxLength(40)
  author!: string;

  @IsString()
  @MaxLength(2000)
  text!: string;

  @IsOptional()
  @IsBoolean()
  isBot?: boolean;
}

export class AskGuideDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  question!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => RecentMessageDto)
  recentMessages?: RecentMessageDto[];
}

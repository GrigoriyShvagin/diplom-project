import { ArrayMinSize, IsArray, IsString, MaxLength, MinLength } from "class-validator";

export class CreateVoteDto {
  @IsString()
  @MinLength(1)
  @MaxLength(280)
  title!: string;

  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  options!: string[];
}

export class AnswerVoteDto {
  @IsString()
  optionId!: string;
}

import { IsDateString, IsInt, IsOptional, Min } from "class-validator";

export class CreateDayDto {
  @IsDateString()
  date!: string;

  @IsInt()
  @Min(1)
  dayNumber!: number;
}

export class UpdateDayDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  dayNumber?: number;
}

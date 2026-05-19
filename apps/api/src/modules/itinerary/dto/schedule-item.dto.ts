import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

const ITEM_TYPES = ["flight", "stay", "food", "walk", "drive", "place", "custom"] as const;

export class CreateScheduleItemDto {
  @IsIn(ITEM_TYPES as unknown as string[])
  type!: (typeof ITEM_TYPES)[number];

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  startTime?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  endTime?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateScheduleItemDto {
  @IsOptional()
  @IsIn(ITEM_TYPES as unknown as string[])
  type?: (typeof ITEM_TYPES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  startTime?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  endTime?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

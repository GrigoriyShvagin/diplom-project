import { PartialType } from "@nestjs/mapped-types";
import { CreateTripDto } from "./create-trip.dto";
import { IsIn, IsOptional, IsString } from "class-validator";

export class UpdateTripDto extends PartialType(CreateTripDto) {
  @IsOptional()
  @IsString()
  @IsIn(["draft", "planning", "active", "done"])
  status?: string;
}

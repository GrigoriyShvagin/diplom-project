import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser, type AuthUser } from "../../common/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateDayDto, UpdateDayDto } from "./dto/day.dto";
import {
  CreateScheduleItemDto,
  UpdateScheduleItemDto,
} from "./dto/schedule-item.dto";
import { ItineraryService } from "./itinerary.service";

@Controller("trips/:tripId")
@UseGuards(JwtAuthGuard)
export class ItineraryController {
  constructor(private readonly itinerary: ItineraryService) {}

  @Get("days")
  listDays(@Param("tripId") tripId: string, @CurrentUser() user: AuthUser) {
    return this.itinerary.listDays(tripId, user.id);
  }

  @Post("days")
  createDay(
    @Param("tripId") tripId: string,
    @Body() dto: CreateDayDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.itinerary.createDay(tripId, user.id, dto);
  }

  @Patch("days/:dayId")
  updateDay(
    @Param("tripId") tripId: string,
    @Param("dayId") dayId: string,
    @Body() dto: UpdateDayDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.itinerary.updateDay(tripId, dayId, user.id, dto);
  }

  @Delete("days/:dayId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeDay(
    @Param("tripId") tripId: string,
    @Param("dayId") dayId: string,
    @CurrentUser() user: AuthUser,
  ) {
    await this.itinerary.removeDay(tripId, dayId, user.id);
  }

  @Post("days/:dayId/items")
  createItem(
    @Param("tripId") tripId: string,
    @Param("dayId") dayId: string,
    @Body() dto: CreateScheduleItemDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.itinerary.createItem(tripId, dayId, user.id, dto);
  }

  @Patch("days/:dayId/items/:itemId")
  updateItem(
    @Param("tripId") tripId: string,
    @Param("dayId") dayId: string,
    @Param("itemId") itemId: string,
    @Body() dto: UpdateScheduleItemDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.itinerary.updateItem(tripId, dayId, itemId, user.id, dto);
  }

  @Delete("days/:dayId/items/:itemId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeItem(
    @Param("tripId") tripId: string,
    @Param("dayId") dayId: string,
    @Param("itemId") itemId: string,
    @CurrentUser() user: AuthUser,
  ) {
    await this.itinerary.removeItem(tripId, dayId, itemId, user.id);
  }
}

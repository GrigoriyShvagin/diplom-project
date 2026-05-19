import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { TripsService } from "../trips/trips.service";
import { CreateDayDto, UpdateDayDto } from "./dto/day.dto";
import {
  CreateScheduleItemDto,
  UpdateScheduleItemDto,
} from "./dto/schedule-item.dto";

const itemSelect = {
  id: true,
  type: true,
  title: true,
  description: true,
  startTime: true,
  endTime: true,
  sortOrder: true,
  tripDayId: true,
  placeCacheId: true,
} as const;

const daySelect = {
  id: true,
  date: true,
  dayNumber: true,
  tripId: true,
  scheduleItems: {
    select: itemSelect,
    orderBy: [{ sortOrder: "asc" as const }, { startTime: "asc" as const }],
  },
};

@Injectable()
export class ItineraryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trips: TripsService,
  ) {}

  async listDays(tripId: string, userId: string) {
    await this.trips.assertMember(tripId, userId);
    return this.prisma.tripDay.findMany({
      where: { tripId },
      orderBy: { dayNumber: "asc" },
      select: daySelect,
    });
  }

  async createDay(tripId: string, userId: string, dto: CreateDayDto) {
    await this.trips.assertMember(tripId, userId);
    return this.prisma.tripDay.create({
      data: {
        tripId,
        date: new Date(dto.date),
        dayNumber: dto.dayNumber,
      },
      select: daySelect,
    });
  }

  async updateDay(tripId: string, dayId: string, userId: string, dto: UpdateDayDto) {
    await this.trips.assertMember(tripId, userId);
    const day = await this.prisma.tripDay.findUnique({ where: { id: dayId }, select: { tripId: true } });
    if (!day) throw new NotFoundException();
    if (day.tripId !== tripId) throw new ForbiddenException();
    return this.prisma.tripDay.update({
      where: { id: dayId },
      data: {
        date: dto.date ? new Date(dto.date) : undefined,
        dayNumber: dto.dayNumber,
      },
      select: daySelect,
    });
  }

  async removeDay(tripId: string, dayId: string, userId: string) {
    await this.trips.assertMember(tripId, userId);
    const day = await this.prisma.tripDay.findUnique({ where: { id: dayId }, select: { tripId: true } });
    if (!day) throw new NotFoundException();
    if (day.tripId !== tripId) throw new ForbiddenException();
    await this.prisma.tripDay.delete({ where: { id: dayId } });
  }

  async createItem(
    tripId: string,
    dayId: string,
    userId: string,
    dto: CreateScheduleItemDto,
  ) {
    await this.trips.assertMember(tripId, userId);
    const day = await this.prisma.tripDay.findUnique({ where: { id: dayId }, select: { tripId: true } });
    if (!day) throw new NotFoundException();
    if (day.tripId !== tripId) throw new ForbiddenException();

    const nextSort =
      dto.sortOrder ??
      (await this.prisma.scheduleItem.count({ where: { tripDayId: dayId } }));
    return this.prisma.scheduleItem.create({
      data: {
        tripDayId: dayId,
        type: dto.type,
        title: dto.title,
        description: dto.description,
        startTime: dto.startTime,
        endTime: dto.endTime,
        sortOrder: nextSort,
      },
      select: itemSelect,
    });
  }

  async updateItem(
    tripId: string,
    dayId: string,
    itemId: string,
    userId: string,
    dto: UpdateScheduleItemDto,
  ) {
    await this.trips.assertMember(tripId, userId);
    const item = await this.prisma.scheduleItem.findUnique({
      where: { id: itemId },
      select: { tripDayId: true, tripDay: { select: { tripId: true } } },
    });
    if (!item) throw new NotFoundException();
    if (item.tripDayId !== dayId || item.tripDay.tripId !== tripId)
      throw new ForbiddenException();

    return this.prisma.scheduleItem.update({
      where: { id: itemId },
      data: {
        type: dto.type,
        title: dto.title,
        description: dto.description,
        startTime: dto.startTime,
        endTime: dto.endTime,
        sortOrder: dto.sortOrder,
      },
      select: itemSelect,
    });
  }

  async removeItem(
    tripId: string,
    dayId: string,
    itemId: string,
    userId: string,
  ) {
    await this.trips.assertMember(tripId, userId);
    const item = await this.prisma.scheduleItem.findUnique({
      where: { id: itemId },
      select: { tripDayId: true, tripDay: { select: { tripId: true } } },
    });
    if (!item) throw new NotFoundException();
    if (item.tripDayId !== dayId || item.tripDay.tripId !== tripId)
      throw new ForbiddenException();
    await this.prisma.scheduleItem.delete({ where: { id: itemId } });
  }
}

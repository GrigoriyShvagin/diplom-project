import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateTripDto } from "./dto/create-trip.dto";
import { UpdateTripDto } from "./dto/update-trip.dto";

const tripSelect = {
  id: true,
  title: true,
  description: true,
  destinationLabel: true,
  startDate: true,
  endDate: true,
  status: true,
  createdAt: true,
  ownerId: true,
  members: {
    select: {
      id: true,
      role: true,
      joinedAt: true,
      user: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
  },
} as const;

@Injectable()
export class TripsService {
  constructor(private readonly prisma: PrismaService) {}

  listForUser(userId: string) {
    return this.prisma.trip.findMany({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
      orderBy: { createdAt: "desc" },
      select: tripSelect,
    });
  }

  async findByIdForUser(id: string, userId: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id },
      select: tripSelect,
    });
    if (!trip) throw new NotFoundException();
    if (!this.isMember(trip, userId)) throw new ForbiddenException();
    return trip;
  }

  async create(userId: string, dto: CreateTripDto) {
    const trip = await this.prisma.trip.create({
      data: {
        title: dto.title,
        description: dto.description,
        destinationLabel: dto.destinationLabel,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        ownerId: userId,
        members: {
          create: { userId, role: "owner" },
        },
      },
      select: tripSelect,
    });
    return trip;
  }

  async update(id: string, userId: string, dto: UpdateTripDto) {
    const existing = await this.prisma.trip.findUnique({
      where: { id },
      select: { ownerId: true },
    });
    if (!existing) throw new NotFoundException();
    if (existing.ownerId !== userId) throw new ForbiddenException();

    return this.prisma.trip.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        destinationLabel: dto.destinationLabel,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        status: dto.status,
      },
      select: tripSelect,
    });
  }

  async remove(id: string, userId: string) {
    const existing = await this.prisma.trip.findUnique({
      where: { id },
      select: { ownerId: true },
    });
    if (!existing) throw new NotFoundException();
    if (existing.ownerId !== userId) throw new ForbiddenException();
    await this.prisma.trip.delete({ where: { id } });
  }

  private isMember(trip: { ownerId: string; members: { user: { id: string } }[] }, userId: string) {
    if (trip.ownerId === userId) return true;
    return trip.members.some((m) => m.user.id === userId);
  }
}

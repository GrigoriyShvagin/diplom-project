import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { TripsService } from "../trips/trips.service";
import { CreateExpenseDto } from "./dto/expense.dto";

const expenseSelect = {
  id: true,
  title: true,
  amount: true,
  category: true,
  currency: true,
  expenseDate: true,
  note: true,
  createdAt: true,
  tripId: true,
  createdBy: {
    select: { id: true, name: true, email: true, avatarUrl: true },
  },
  splits: {
    select: {
      id: true,
      amount: true,
      status: true,
      user: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
  },
};

@Injectable()
export class ExpensesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trips: TripsService,
  ) {}

  async list(tripId: string, userId: string) {
    await this.trips.assertMember(tripId, userId);
    return this.prisma.expense.findMany({
      where: { tripId },
      orderBy: { createdAt: "desc" },
      select: expenseSelect,
    });
  }

  async create(tripId: string, userId: string, dto: CreateExpenseDto) {
    await this.trips.assertMember(tripId, userId);
    const memberIds = await this.tripMemberIds(tripId);
    if (!memberIds.has(dto.payerId)) {
      throw new BadRequestException("Плательщик не участник поездки");
    }
    for (const id of dto.splitUserIds) {
      if (!memberIds.has(id)) {
        throw new BadRequestException("В разделе расхода есть не-участник");
      }
    }

    const share = round2(dto.amount / dto.splitUserIds.length);
    return this.prisma.expense.create({
      data: {
        tripId,
        createdById: dto.payerId,
        title: dto.title,
        amount: dto.amount,
        category: dto.category ?? "other",
        currency: dto.currency ?? "RUB",
        expenseDate: dto.expenseDate ? new Date(dto.expenseDate) : null,
        note: dto.note,
        splits: {
          create: dto.splitUserIds.map((uid) => ({
            userId: uid,
            amount: share,
            status: "pending",
          })),
        },
      },
      select: expenseSelect,
    });
  }

  async remove(tripId: string, expenseId: string, userId: string) {
    await this.trips.assertMember(tripId, userId);
    const exp = await this.prisma.expense.findUnique({
      where: { id: expenseId },
      select: { tripId: true, createdById: true },
    });
    if (!exp) throw new NotFoundException();
    if (exp.tripId !== tripId) throw new ForbiddenException();
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      select: { ownerId: true },
    });
    if (!trip) throw new NotFoundException();
    if (exp.createdById !== userId && trip.ownerId !== userId) {
      throw new ForbiddenException();
    }
    await this.prisma.expense.delete({ where: { id: expenseId } });
  }

  private async tripMemberIds(tripId: string): Promise<Set<string>> {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      select: {
        ownerId: true,
        members: { select: { userId: true } },
      },
    });
    if (!trip) throw new NotFoundException();
    const ids = new Set<string>([trip.ownerId, ...trip.members.map((m) => m.userId)]);
    return ids;
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

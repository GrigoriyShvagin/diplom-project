import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { TripsService } from "../trips/trips.service";
import { AnswerVoteDto, CreateVoteDto } from "./dto/vote.dto";

@Injectable()
export class VotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trips: TripsService,
  ) {}

  async list(tripId: string, userId: string) {
    await this.trips.assertMember(tripId, userId);
    const raw = await this.prisma.vote.findMany({
      where: { tripId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        createdAt: true,
        resolvedAt: true,
        tripId: true,
        createdBy: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        options: {
          select: {
            id: true,
            label: true,
            _count: { select: { answers: true } },
            answers: {
              where: { userId },
              select: { id: true },
            },
          },
        },
      },
    });
    return raw.map((v) => this.mapVote(v));
  }

  async create(tripId: string, userId: string, dto: CreateVoteDto) {
    await this.trips.assertMember(tripId, userId);
    const vote = await this.prisma.vote.create({
      data: {
        tripId,
        createdById: userId,
        title: dto.title,
        type: "single",
        options: {
          create: dto.options.map((label) => ({ label })),
        },
      },
      select: { id: true },
    });
    return this.findOne(tripId, userId, vote.id);
  }

  async findOne(tripId: string, userId: string, voteId: string) {
    await this.trips.assertMember(tripId, userId);
    const raw = await this.prisma.vote.findUnique({
      where: { id: voteId },
      select: {
        id: true,
        title: true,
        createdAt: true,
        resolvedAt: true,
        tripId: true,
        createdBy: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        options: {
          select: {
            id: true,
            label: true,
            _count: { select: { answers: true } },
            answers: { where: { userId }, select: { id: true } },
          },
        },
      },
    });
    if (!raw) throw new NotFoundException();
    if (raw.tripId !== tripId) throw new ForbiddenException();
    return this.mapVote(raw);
  }

  async castAnswer(tripId: string, voteId: string, userId: string, dto: AnswerVoteDto) {
    await this.trips.assertMember(tripId, userId);
    const vote = await this.prisma.vote.findUnique({
      where: { id: voteId },
      select: {
        tripId: true,
        resolvedAt: true,
        options: { select: { id: true } },
      },
    });
    if (!vote) throw new NotFoundException();
    if (vote.tripId !== tripId) throw new ForbiddenException();
    if (vote.resolvedAt) throw new ForbiddenException("Голосование закрыто");
    if (!vote.options.some((o) => o.id === dto.optionId)) {
      throw new NotFoundException("Такого варианта нет");
    }

    const optionIds = vote.options.map((o) => o.id);
    const currentAnswers = await this.prisma.voteAnswer.findMany({
      where: { userId, optionId: { in: optionIds } },
      select: { id: true, optionId: true },
    });

    const sameOption = currentAnswers.find((a) => a.optionId === dto.optionId);
    await this.prisma.$transaction(async (tx) => {
      if (currentAnswers.length) {
        await tx.voteAnswer.deleteMany({
          where: { id: { in: currentAnswers.map((a) => a.id) } },
        });
      }
      if (!sameOption) {
        await tx.voteAnswer.create({
          data: { optionId: dto.optionId, userId },
        });
      }
    });

    return this.findOne(tripId, userId, voteId);
  }

  async clearAnswer(tripId: string, voteId: string, userId: string) {
    await this.trips.assertMember(tripId, userId);
    const vote = await this.prisma.vote.findUnique({
      where: { id: voteId },
      select: {
        tripId: true,
        options: { select: { id: true } },
      },
    });
    if (!vote) throw new NotFoundException();
    if (vote.tripId !== tripId) throw new ForbiddenException();
    const optionIds = vote.options.map((o) => o.id);
    await this.prisma.voteAnswer.deleteMany({
      where: { userId, optionId: { in: optionIds } },
    });
    return this.findOne(tripId, userId, voteId);
  }

  private mapVote(v: {
    id: string;
    title: string;
    createdAt: Date;
    resolvedAt: Date | null;
    tripId: string;
    createdBy: { id: string; name: string; email: string; avatarUrl: string | null };
    options: {
      id: string;
      label: string;
      _count: { answers: number };
      answers: { id: string }[];
    }[];
  }) {
    const options = v.options.map((o) => ({
      id: o.id,
      label: o.label,
      count: o._count.answers,
    }));
    const myAnswerOption = v.options.find((o) => o.answers.length > 0);
    const total = options.reduce((s, o) => s + o.count, 0);
    return {
      id: v.id,
      tripId: v.tripId,
      title: v.title,
      createdAt: v.createdAt,
      resolvedAt: v.resolvedAt,
      createdBy: v.createdBy,
      options,
      myAnswer: myAnswerOption?.id ?? null,
      total,
    };
  }
}

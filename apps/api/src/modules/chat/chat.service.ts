import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { TripsService } from "../trips/trips.service";
import { AiService } from "../ai/ai.service";
import { CreateMessageDto } from "./dto/message.dto";

const GUIDE_RE = /@гид(?![а-яА-ЯёЁ])/i;

const messageSelect = {
  id: true,
  text: true,
  isBot: true,
  createdAt: true,
  tripId: true,
  author: {
    select: { id: true, name: true, email: true, avatarUrl: true },
  },
} as const;

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly trips: TripsService,
    private readonly ai: AiService,
  ) {}

  async list(tripId: string, userId: string) {
    await this.trips.assertMember(tripId, userId);
    return this.prisma.tripMessage.findMany({
      where: { tripId },
      orderBy: { createdAt: "asc" },
      take: 200,
      select: messageSelect,
    });
  }

  async send(tripId: string, userId: string, dto: CreateMessageDto) {
    await this.trips.assertMember(tripId, userId);
    const userMessage = await this.prisma.tripMessage.create({
      data: {
        tripId,
        authorId: userId,
        text: dto.text,
        isBot: false,
      },
      select: messageSelect,
    });

    const messages: (typeof userMessage)[] = [userMessage];
    let aiError: string | undefined;

    if (GUIDE_RE.test(dto.text) && this.ai.isEnabled()) {
      try {
        const recent = await this.prisma.tripMessage.findMany({
          where: { tripId },
          orderBy: { createdAt: "desc" },
          take: 12,
          select: { isBot: true, text: true, author: { select: { name: true } } },
        });
        const reply = await this.ai.askGuide(tripId, userId, {
          question: dto.text,
          recentMessages: recent.reverse().map((m) => ({
            author: m.isBot ? "Гид" : (m.author?.name ?? "?"),
            text: m.text,
            isBot: m.isBot,
          })),
        });
        const botMessage = await this.prisma.tripMessage.create({
          data: { tripId, authorId: null, text: reply, isBot: true },
          select: messageSelect,
        });
        messages.push(botMessage);
      } catch (err) {
        this.logger.error("AI guide reply failed", err as Error);
        aiError =
          err instanceof Error
            ? err.message
            : "AI-гид сейчас не отвечает, попробуйте позже.";
      }
    } else if (GUIDE_RE.test(dto.text) && !this.ai.isEnabled()) {
      aiError = "AI-гид не настроен. Добавьте ANTHROPIC_API_KEY в apps/api/.env";
    }

    return { messages, aiError };
  }

  async runAnalysis(tripId: string, userId: string) {
    await this.trips.assertMember(tripId, userId);
    const msgs = await this.prisma.tripMessage.findMany({
      where: { tripId },
      orderBy: { createdAt: "asc" },
      take: 500,
      select: { isBot: true, text: true, author: { select: { name: true } } },
    });
    const result = await this.ai.analyzeChat(
      tripId,
      msgs.map((m) => ({
        author: m.isBot ? "Гид" : (m.author?.name ?? "?"),
        text: m.text,
        isBot: m.isBot,
      })),
    );

    const byKey = (k: string) =>
      result.sections.find((s) => s.key === k) ?? null;

    const saved = await this.prisma.chatAnalysis.create({
      data: {
        tripId,
        summary: result.summary,
        destinationsJson: (byKey("directions") ?? undefined) as object | undefined,
        budgetSignalsJson: (byKey("budget") ?? undefined) as object | undefined,
        interestsJson: (byKey("interests") ?? undefined) as object | undefined,
        rawModelOutput: result as unknown as object,
      },
      select: { id: true, summary: true, rawModelOutput: true, createdAt: true },
    });

    return this.shapeAnalysis(saved, msgs.length);
  }

  async getLatestAnalysis(tripId: string, userId: string) {
    await this.trips.assertMember(tripId, userId);
    const latest = await this.prisma.chatAnalysis.findFirst({
      where: { tripId },
      orderBy: { createdAt: "desc" },
      select: { id: true, summary: true, rawModelOutput: true, createdAt: true },
    });
    if (!latest) return null;
    const messageCount = await this.prisma.tripMessage.count({ where: { tripId } });
    return this.shapeAnalysis(latest, messageCount);
  }

  private shapeAnalysis(
    row: {
      id: string;
      summary: string | null;
      rawModelOutput: unknown;
      createdAt: Date;
    },
    messageCount: number,
  ) {
    const raw = (row.rawModelOutput ?? {}) as { sections?: unknown };
    return {
      id: row.id,
      summary: row.summary,
      sections: Array.isArray(raw.sections) ? raw.sections : [],
      createdAt: row.createdAt,
      messageCount,
    };
  }
}

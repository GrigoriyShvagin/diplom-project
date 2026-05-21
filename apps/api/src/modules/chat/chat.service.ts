import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import { TripsService } from "../trips/trips.service";
import { AiService } from "../ai/ai.service";
import { CreateMessageDto } from "./dto/message.dto";

const GUIDE_RE = /@гид(?![а-яА-ЯёЁ])/i;
const DEFAULT_BLOCK_SIZE = 100;

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

  private readonly blockSize: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly trips: TripsService,
    private readonly ai: AiService,
    config: ConfigService,
  ) {
    const raw = Number(config.get<string>("CHAT_SUMMARY_BLOCK_SIZE"));
    this.blockSize = Number.isInteger(raw) && raw > 0 ? raw : DEFAULT_BLOCK_SIZE;
  }

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

    // Keep the rolling memory up to date as messages accumulate.
    if (this.ai.isEnabled()) {
      await this.ensureSummaries(tripId).catch((err) =>
        this.logger.error("ensureSummaries failed", err as Error),
      );
    }

    if (GUIDE_RE.test(dto.text) && this.ai.isEnabled()) {
      try {
        const rollingSummary = await this.buildRollingSummary(tripId);
        const recent = await this.prisma.tripMessage.findMany({
          where: { tripId },
          orderBy: { createdAt: "desc" },
          take: 12,
          select: { isBot: true, text: true, author: { select: { name: true } } },
        });
        const reply = await this.ai.askGuide(
          tripId,
          userId,
          {
            question: dto.text,
            recentMessages: recent.reverse().map((m) => ({
              author: m.isBot ? "Гид" : (m.author?.name ?? "?"),
              text: m.text,
              isBot: m.isBot,
            })),
          },
          rollingSummary,
        );
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

  /**
   * Generates a structured "memory" summary for every completed block of
   * `blockSize` messages that has not yet been summarized. Idempotent.
   */
  async ensureSummaries(tripId: string): Promise<void> {
    if (!this.ai.isEnabled()) return;
    const total = await this.prisma.tripMessage.count({ where: { tripId } });
    const last = await this.prisma.chatSummary.findFirst({
      where: { tripId },
      orderBy: { blockNumber: "desc" },
      select: { blockNumber: true, toIndex: true },
    });

    let covered = last?.toIndex ?? 0;
    let blockNumber = last?.blockNumber ?? 0;

    while (total - covered >= this.blockSize) {
      const slice = await this.prisma.tripMessage.findMany({
        where: { tripId },
        orderBy: { createdAt: "asc" },
        skip: covered,
        take: this.blockSize,
        select: { isBot: true, text: true, author: { select: { name: true } } },
      });
      const result = await this.ai.summarizeBlock(
        slice.map((m) => ({
          author: m.isBot ? "Гид" : (m.author?.name ?? "?"),
          text: m.text,
          isBot: m.isBot,
        })),
      );
      blockNumber += 1;
      const from = covered;
      const to = covered + this.blockSize;
      await this.prisma.chatSummary.create({
        data: {
          tripId,
          blockNumber,
          fromIndex: from,
          toIndex: to,
          mood: result.mood,
          summary: result.summary,
          topicsJson: result.topics as object,
          decisionsJson: result.decisions as object,
          questionsJson: result.questions as object,
        },
      });
      covered = to;
    }
  }

  async getSuggestions(tripId: string, userId: string) {
    await this.trips.assertMember(tripId, userId);
    if (!this.ai.isEnabled()) return { suggestions: [] };
    return this.ai.suggest(tripId);
  }

  async getSummaries(tripId: string, userId: string) {
    await this.trips.assertMember(tripId, userId);
    const rows = await this.prisma.chatSummary.findMany({
      where: { tripId },
      orderBy: { blockNumber: "asc" },
      select: {
        id: true,
        blockNumber: true,
        fromIndex: true,
        toIndex: true,
        mood: true,
        summary: true,
        topicsJson: true,
        decisionsJson: true,
        questionsJson: true,
        createdAt: true,
      },
    });
    return rows.map((r) => ({
      id: r.id,
      blockNumber: r.blockNumber,
      fromIndex: r.fromIndex,
      toIndex: r.toIndex,
      mood: r.mood,
      summary: r.summary,
      topics: asStringArray(r.topicsJson),
      decisions: asStringArray(r.decisionsJson),
      questions: asStringArray(r.questionsJson),
      createdAt: r.createdAt,
    }));
  }

  private async buildRollingSummary(tripId: string): Promise<string> {
    const rows = await this.prisma.chatSummary.findMany({
      where: { tripId },
      orderBy: { blockNumber: "asc" },
      select: {
        blockNumber: true,
        fromIndex: true,
        toIndex: true,
        mood: true,
        summary: true,
        decisionsJson: true,
        questionsJson: true,
      },
    });
    if (rows.length === 0) return "";
    return rows
      .map((r) => {
        const decisions = asStringArray(r.decisionsJson);
        const questions = asStringArray(r.questionsJson);
        const parts = [
          `[Блок ${r.blockNumber}, сообщения ${r.fromIndex + 1}–${r.toIndex}]`,
          `Настроение: ${r.mood}.`,
          `Сводка: ${r.summary}`,
        ];
        if (decisions.length) parts.push(`Решения: ${decisions.join("; ")}.`);
        if (questions.length) parts.push(`Открыто: ${questions.join("; ")}.`);
        return parts.join(" ");
      })
      .join("\n");
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

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((x): x is string => typeof x === "string") : [];
}

import { Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Anthropic from "@anthropic-ai/sdk";
import { PrismaService } from "../../prisma/prisma.service";
import { TripsService } from "../trips/trips.service";
import { AskGuideDto, RecentMessageDto } from "./dto/ask.dto";

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private client: Anthropic | null = null;
  private readonly model: string;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly trips: TripsService,
  ) {
    const apiKey = this.config.get<string>("ANTHROPIC_API_KEY");
    this.model = this.config.get<string>("ANTHROPIC_MODEL") ?? "claude-haiku-4-5-20251001";
    if (apiKey && apiKey.length > 0) {
      this.client = new Anthropic({ apiKey });
      this.logger.log(`Anthropic ready (model=${this.model})`);
    } else {
      this.logger.warn(
        "ANTHROPIC_API_KEY is not set — AI guide endpoint will return 503",
      );
    }
  }

  isEnabled(): boolean {
    return this.client !== null;
  }

  async analyzeChat(
    tripId: string,
    messages: { author: string; text: string; isBot: boolean }[],
  ): Promise<ChatAnalysisResult> {
    if (!this.client) {
      throw new ServiceUnavailableException(
        "AI не настроен. Добавьте ANTHROPIC_API_KEY в apps/api/.env",
      );
    }
    const tripCtx = await this.buildTripContext(tripId);
    const transcript = messages
      .map((m) => `${m.isBot ? "Гид" : m.author}: ${m.text}`)
      .join("\n");

    const system = `Ты анализируешь чат группы друзей, планирующих путешествие. Извлеки конкретные договорённости и разногласия из переписки.

Контекст поездки:
${tripCtx}

Правила:
- Включай только то, что реально обсуждалось в чате. Пустые массивы — это нормально.
- "sources" = сколько сообщений поддерживают этот пункт (оценка).
- "strong: true" для пунктов с явным консенсусом; "conflict: true" для разногласий.
- Заголовки секций (title) на русском.
- Вызови инструмент save_chat_analysis с результатом.`;

    const tool: Anthropic.Tool = {
      name: "save_chat_analysis",
      description: "Сохранить структурированный анализ чата поездки",
      input_schema: {
        type: "object",
        properties: {
          summary: { type: "string", description: "1–2 предложения общего обзора" },
          sections: {
            type: "array",
            items: {
              type: "object",
              properties: {
                key: {
                  type: "string",
                  enum: [
                    "directions",
                    "budget",
                    "dates",
                    "interests",
                    "constraints",
                    "conflicts",
                  ],
                },
                title: { type: "string" },
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      text: { type: "string" },
                      strong: { type: "boolean" },
                      conflict: { type: "boolean" },
                      sources: { type: "integer" },
                    },
                    required: ["text"],
                  },
                },
              },
              required: ["key", "title", "items"],
            },
          },
        },
        required: ["summary", "sections"],
      },
    };

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 2000,
        system,
        tools: [tool],
        tool_choice: { type: "tool", name: "save_chat_analysis" },
        messages: [
          {
            role: "user",
            content: `Вот переписка чата (${messages.length} сообщений):\n\n${transcript || "(пусто)"}`,
          },
        ],
      });
      const block = response.content.find((b) => b.type === "tool_use");
      if (!block || block.type !== "tool_use") {
        throw new Error("no tool_use block in response");
      }
      return block.input as ChatAnalysisResult;
    } catch (err) {
      this.logger.error("Anthropic analyze failed", err as Error);
      throw new ServiceUnavailableException("Не удалось проанализировать чат");
    }
  }

  async askGuide(tripId: string, userId: string, dto: AskGuideDto): Promise<string> {
    if (!this.client) {
      throw new ServiceUnavailableException(
        "AI-гид не настроен. Добавьте ANTHROPIC_API_KEY в apps/api/.env",
      );
    }
    await this.trips.assertMember(tripId, userId);
    const tripCtx = await this.buildTripContext(tripId);
    const recent = formatRecent(dto.recentMessages ?? []);

    const system = `Ты — Гид, дружелюбный AI-помощник в чате группы друзей, планирующих путешествие.

Контекст поездки:
${tripCtx}

Последние сообщения в чате:
${recent || "(пусто)"}

Правила:
- Отвечай на русском, в дружеском тоне, как в чате.
- Будь конкретен: предлагай реальные места, давай суммы в рублях, оценивай время.
- Используй короткие маркированные списки (строки с "- ") когда уместно.
- Можешь выделять ключевое **жирным** (используй ** **).
- 3–8 коротких предложений или 1 список + короткий итог.
- Помни предыдущие сообщения и не повторяйся.`;

    const question = dto.question.replace(/@гид/gi, "").trim();

    try {
      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: 600,
        temperature: 0.7,
        system,
        messages: [{ role: "user", content: question }],
      });
      const block = message.content[0];
      const reply = block && block.type === "text" ? block.text.trim() : "";
      return reply || "Не удалось разобрать ответ.";
    } catch (err) {
      this.logger.error("Anthropic request failed", err as Error);
      throw new ServiceUnavailableException("Не удалось получить ответ от AI-гида");
    }
  }

  private async buildTripContext(tripId: string): Promise<string> {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      select: {
        title: true,
        destinationLabel: true,
        startDate: true,
        endDate: true,
        members: { select: { user: { select: { name: true } } } },
        days: {
          orderBy: { dayNumber: "asc" },
          select: {
            dayNumber: true,
            date: true,
            scheduleItems: {
              orderBy: { sortOrder: "asc" },
              select: { title: true, startTime: true, type: true },
            },
          },
        },
        expenses: { select: { amount: true, currency: true } },
      },
    });
    if (!trip) return "(нет данных о поездке)";

    const lines: string[] = [];
    lines.push(
      `Поездка: ${trip.title}${trip.destinationLabel ? ` (${trip.destinationLabel})` : ""}`,
    );
    if (trip.startDate && trip.endDate) {
      lines.push(
        `Даты: ${trip.startDate.toISOString().slice(0, 10)} — ${trip.endDate.toISOString().slice(0, 10)}`,
      );
    }
    lines.push(
      `Участники: ${trip.members.map((m) => m.user.name).join(", ") || "—"}`,
    );
    if (trip.days.length) {
      lines.push("Маршрут:");
      for (const d of trip.days) {
        const items = d.scheduleItems
          .map((it) => `${it.startTime ?? "—"} ${it.title}`)
          .join("; ");
        lines.push(
          `  День ${d.dayNumber} (${d.date.toISOString().slice(0, 10)}): ${items || "пусто"}`,
        );
      }
    }
    const totalSpent = trip.expenses.reduce((s, e) => s + e.amount, 0);
    if (totalSpent > 0) {
      lines.push(
        `Потрачено: ${totalSpent.toLocaleString("ru")} ${trip.expenses[0]?.currency ?? "RUB"}`,
      );
    }
    return lines.join("\n");
  }
}

export type ChatAnalysisSection = {
  key: "directions" | "budget" | "dates" | "interests" | "constraints" | "conflicts";
  title: string;
  items: { text: string; strong?: boolean; conflict?: boolean; sources?: number }[];
};

export type ChatAnalysisResult = {
  summary: string;
  sections: ChatAnalysisSection[];
};

function formatRecent(msgs: RecentMessageDto[]): string {
  return msgs
    .slice(-12)
    .map((m) => `${m.isBot ? "Гид" : m.author}: ${m.text}`)
    .join("\n");
}

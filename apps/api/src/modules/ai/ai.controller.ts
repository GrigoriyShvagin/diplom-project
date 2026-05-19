import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser, type AuthUser } from "../../common/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AskGuideDto } from "./dto/ask.dto";
import { AiService } from "./ai.service";

@Controller()
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Get("ai/status")
  status() {
    return { enabled: this.ai.isEnabled() };
  }

  @Post("trips/:tripId/chat/ask")
  async ask(
    @Param("tripId") tripId: string,
    @Body() dto: AskGuideDto,
    @CurrentUser() user: AuthUser,
  ) {
    const reply = await this.ai.askGuide(tripId, user.id, dto);
    return { reply };
  }
}

import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser, type AuthUser } from "../../common/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateMessageDto } from "./dto/message.dto";
import { ChatService } from "./chat.service";

@Controller("trips/:tripId/chat")
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Get("messages")
  list(@Param("tripId") tripId: string, @CurrentUser() user: AuthUser) {
    return this.chat.list(tripId, user.id);
  }

  @Post("messages")
  send(
    @Param("tripId") tripId: string,
    @Body() dto: CreateMessageDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.chat.send(tripId, user.id, dto);
  }

  @Get("analysis")
  analysis(@Param("tripId") tripId: string, @CurrentUser() user: AuthUser) {
    return this.chat.getLatestAnalysis(tripId, user.id);
  }

  @Get("summaries")
  summaries(@Param("tripId") tripId: string, @CurrentUser() user: AuthUser) {
    return this.chat.getSummaries(tripId, user.id);
  }

  @Post("suggestions")
  suggestions(@Param("tripId") tripId: string, @CurrentUser() user: AuthUser) {
    return this.chat.getSuggestions(tripId, user.id);
  }

  @Post("analyze")
  analyze(@Param("tripId") tripId: string, @CurrentUser() user: AuthUser) {
    return this.chat.runAnalysis(tripId, user.id);
  }
}

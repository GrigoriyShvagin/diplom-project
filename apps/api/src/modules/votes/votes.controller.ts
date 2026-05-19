import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser, type AuthUser } from "../../common/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AnswerVoteDto, CreateVoteDto } from "./dto/vote.dto";
import { VotesService } from "./votes.service";

@Controller("trips/:tripId/votes")
@UseGuards(JwtAuthGuard)
export class VotesController {
  constructor(private readonly votes: VotesService) {}

  @Get()
  list(@Param("tripId") tripId: string, @CurrentUser() user: AuthUser) {
    return this.votes.list(tripId, user.id);
  }

  @Post()
  create(
    @Param("tripId") tripId: string,
    @Body() dto: CreateVoteDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.votes.create(tripId, user.id, dto);
  }

  @Post(":voteId/answer")
  answer(
    @Param("tripId") tripId: string,
    @Param("voteId") voteId: string,
    @Body() dto: AnswerVoteDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.votes.castAnswer(tripId, voteId, user.id, dto);
  }

  @Delete(":voteId/answer")
  clear(
    @Param("tripId") tripId: string,
    @Param("voteId") voteId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.votes.clearAnswer(tripId, voteId, user.id);
  }
}

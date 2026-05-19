import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser, type AuthUser } from "../../common/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateExpenseDto } from "./dto/expense.dto";
import { ExpensesService } from "./expenses.service";

@Controller("trips/:tripId/expenses")
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expenses: ExpensesService) {}

  @Get()
  list(@Param("tripId") tripId: string, @CurrentUser() user: AuthUser) {
    return this.expenses.list(tripId, user.id);
  }

  @Post()
  create(
    @Param("tripId") tripId: string,
    @Body() dto: CreateExpenseDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.expenses.create(tripId, user.id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param("tripId") tripId: string,
    @Param("id") id: string,
    @CurrentUser() user: AuthUser,
  ) {
    await this.expenses.remove(tripId, id, user.id);
  }
}

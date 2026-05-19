import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { TripsModule } from "./modules/trips/trips.module";
import { ItineraryModule } from "./modules/itinerary/itinerary.module";
import { VotesModule } from "./modules/votes/votes.module";
import { ExpensesModule } from "./modules/expenses/expenses.module";
import { AiModule } from "./modules/ai/ai.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    TripsModule,
    ItineraryModule,
    VotesModule,
    ExpensesModule,
    AiModule,
  ],
})
export class AppModule {}

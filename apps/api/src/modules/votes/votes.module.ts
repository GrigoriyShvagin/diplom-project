import { Module } from "@nestjs/common";
import { TripsModule } from "../trips/trips.module";
import { VotesController } from "./votes.controller";
import { VotesService } from "./votes.service";

@Module({
  imports: [TripsModule],
  controllers: [VotesController],
  providers: [VotesService],
})
export class VotesModule {}

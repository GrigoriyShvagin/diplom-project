import { Module } from "@nestjs/common";
import { TripsModule } from "../trips/trips.module";
import { AiController } from "./ai.controller";
import { AiService } from "./ai.service";

@Module({
  imports: [TripsModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}

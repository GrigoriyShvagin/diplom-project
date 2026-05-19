import { Module } from "@nestjs/common";
import { TripsModule } from "../trips/trips.module";
import { AiModule } from "../ai/ai.module";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";

@Module({
  imports: [TripsModule, AiModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}

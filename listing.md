# Листинг исходного кода веб-платформы «Friends Journey»

*Приложение к техническому отчёту. Файлы упорядочены: сначала декларативная схема БД, далее серверная часть (по модулям), затем клиентская часть (каркас → страницы → общий слой → функциональные блоки). Для каждого файла указан путь относительно корня репозитория.*

---

## Часть I. Схема базы данных

### Файл `apps/api/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(uuid())
  name         String
  email        String   @unique
  passwordHash String?
  avatarUrl    String?
  createdAt    DateTime @default(now())

  ownedTrips   Trip[]         @relation("TripOwner")
  memberships  TripMember[]
  voteAnswers  VoteAnswer[]
  votesCreated Vote[]         @relation("VoteAuthor")
  expenses     Expense[]
  splits       ExpenseSplit[]
  messages     TripMessage[]

  @@map("users")
}

model Trip {
  id               String   @id @default(uuid())
  title            String
  description      String?
  destinationLabel String?
  startDate        DateTime?
  endDate          DateTime?
  status           String   @default("draft")
  createdAt        DateTime @default(now())

  ownerId String
  owner   User   @relation("TripOwner", fields: [ownerId], references: [id])

  members      TripMember[]
  days         TripDay[]
  routes       TripRoute[]
  votes        Vote[]
  expenses     Expense[]
  chats        TripChat[]
  analyses     ChatAnalysis[]
  placesCached PlaceCache[]
  messages     TripMessage[]
  chatSummaries ChatSummary[]

  @@map("trips")
}

model TripMember {
  id       String   @id @default(uuid())
  role     String   @default("member")
  joinedAt DateTime @default(now())

  tripId String
  trip   Trip   @relation(fields: [tripId], references: [id], onDelete: Cascade)

  userId String
  user   User   @relation(fields: [userId], references: [id])

  @@unique([tripId, userId])
  @@map("trip_members")
}

model TripDay {
  id        String   @id @default(uuid())
  date      DateTime
  dayNumber Int

  tripId String
  trip   Trip   @relation(fields: [tripId], references: [id], onDelete: Cascade)

  scheduleItems ScheduleItem[]

  @@map("trip_days")
}

model ScheduleItem {
  id          String   @id @default(uuid())
  type        String
  title       String
  description String?
  startTime   String?
  endTime     String?
  sortOrder   Int      @default(0)
  lat         Float?
  lng         Float?
  address     String?

  tripDayId String
  tripDay   TripDay @relation(fields: [tripDayId], references: [id], onDelete: Cascade)

  placeCacheId String?
  placeCache   PlaceCache? @relation(fields: [placeCacheId], references: [id])

  @@map("schedule_items")
}

model TripRoute {
  id            String @id @default(uuid())
  title         String
  transportType String @default("mixed")
  dayNumber     Int?

  tripId String
  trip   Trip   @relation(fields: [tripId], references: [id], onDelete: Cascade)

  points RoutePoint[]

  @@map("trip_routes")
}

model RoutePoint {
  id        String @id @default(uuid())
  sortOrder Int    @default(0)
  note      String?

  routeId String
  route   TripRoute @relation(fields: [routeId], references: [id], onDelete: Cascade)

  placeCacheId String?
  placeCache   PlaceCache? @relation(fields: [placeCacheId], references: [id])

  @@map("route_points")
}

model PlaceCache {
  id              String   @id @default(uuid())
  provider        String
  providerPlaceId String
  name            String
  address         String?
  lat             Float
  lng             Float
  types           String[]
  rating          Float?
  priceLevel      Int?
  photoUrl        String?
  cachedAt        DateTime @default(now())

  tripId String
  trip   Trip   @relation(fields: [tripId], references: [id], onDelete: Cascade)

  scheduleItems ScheduleItem[]
  routePoints   RoutePoint[]

  @@unique([tripId, provider, providerPlaceId])
  @@map("places_cache")
}

model TripMessage {
  id        String   @id @default(uuid())
  text      String
  isBot     Boolean  @default(false)
  createdAt DateTime @default(now())

  tripId String
  trip   Trip   @relation(fields: [tripId], references: [id], onDelete: Cascade)

  authorId String?
  author   User?   @relation(fields: [authorId], references: [id])

  @@index([tripId, createdAt])
  @@map("trip_messages")
}

model ChatSummary {
  id            String   @id @default(uuid())
  blockNumber   Int
  fromIndex     Int
  toIndex       Int
  mood          String
  summary       String
  topicsJson    Json?
  decisionsJson Json?
  questionsJson Json?
  createdAt     DateTime @default(now())

  tripId String
  trip   Trip   @relation(fields: [tripId], references: [id], onDelete: Cascade)

  @@unique([tripId, blockNumber])
  @@index([tripId, blockNumber])
  @@map("chat_summaries")
}

model TripChat {
  id             String   @id @default(uuid())
  externalChatId String?
  source         String
  title          String?
  lastSyncedAt   DateTime?

  tripId String
  trip   Trip   @relation(fields: [tripId], references: [id], onDelete: Cascade)

  @@map("trip_chats")
}

model ChatAnalysis {
  id                String   @id @default(uuid())
  summary           String?
  interestsJson     Json?
  budgetSignalsJson Json?
  destinationsJson  Json?
  rawModelOutput    Json?
  createdAt         DateTime @default(now())

  tripId String
  trip   Trip   @relation(fields: [tripId], references: [id], onDelete: Cascade)

  @@map("chat_analyses")
}

model Vote {
  id         String    @id @default(uuid())
  title      String
  type       String    @default("single")
  resolvedAt DateTime?
  expiresAt  DateTime?
  createdAt  DateTime  @default(now())

  tripId String
  trip   Trip   @relation(fields: [tripId], references: [id], onDelete: Cascade)

  createdById String
  createdBy   User   @relation("VoteAuthor", fields: [createdById], references: [id])

  options VoteOption[]

  @@map("votes")
}

model VoteOption {
  id    String @id @default(uuid())
  label String

  voteId String
  vote   Vote   @relation(fields: [voteId], references: [id], onDelete: Cascade)

  answers VoteAnswer[]

  @@map("vote_options")
}

model VoteAnswer {
  id String @id @default(uuid())

  optionId String
  option   VoteOption @relation(fields: [optionId], references: [id], onDelete: Cascade)

  userId String
  user   User   @relation(fields: [userId], references: [id])

  @@unique([optionId, userId])
  @@map("vote_answers")
}

model Expense {
  id          String   @id @default(uuid())
  title       String
  category    String
  amount      Float
  currency    String   @default("RUB")
  expenseDate DateTime?
  note        String?
  createdAt   DateTime @default(now())

  tripId String
  trip   Trip   @relation(fields: [tripId], references: [id], onDelete: Cascade)

  createdById String
  createdBy   User   @relation(fields: [createdById], references: [id])

  splits ExpenseSplit[]

  @@map("expenses")
}

model ExpenseSplit {
  id     String @id @default(uuid())
  amount Float
  status String @default("pending")

  expenseId String
  expense   Expense @relation(fields: [expenseId], references: [id], onDelete: Cascade)

  userId String
  user   User   @relation(fields: [userId], references: [id])

  @@map("expense_splits")
}
```

---

## Часть II. Серверная часть (NestJS + Prisma + PostgreSQL)

### 1. Каркас приложения

#### Файл `apps/api/src/main.ts`

```typescript
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix("api");
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: config.get<string>("CORS_ORIGIN") ?? "http://localhost:5173",
    credentials: true,
  });

  const port = Number(config.get<string>("PORT") ?? 3000);
  await app.listen(port);
}

void bootstrap();
```

#### Файл `apps/api/src/app.module.ts`

```typescript
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
import { ChatModule } from "./modules/chat/chat.module";

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
    ChatModule,
  ],
})
export class AppModule {}
```

#### Файл `apps/api/src/prisma/prisma.service.ts`

```typescript
import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

#### Файл `apps/api/src/prisma/prisma.module.ts`

```typescript
import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

#### Файл `apps/api/src/common/current-user.decorator.ts`

```typescript
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export type AuthUser = { id: string; email: string };

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const req = ctx.switchToHttp().getRequest<{ user: AuthUser }>();
    return req.user;
  },
);
```

### 2. Модуль аутентификации (`modules/auth`)

#### Файл `apps/api/src/modules/auth/auth.module.ts`

```typescript
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule, type JwtModuleOptions } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => ({
        secret: config.getOrThrow<string>("JWT_SECRET"),
        signOptions: {
          expiresIn: (config.get<string>("JWT_EXPIRES_IN") ?? "7d") as unknown as number,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

#### Файл `apps/api/src/modules/auth/auth.controller.ts`

```typescript
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";
import { AuthService, type AuthResult } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { AUTH_COOKIE } from "./jwt.strategy";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post("register")
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.register(dto);
    this.setSessionCookie(res, result);
    return { user: result.user };
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.login(dto);
    this.setSessionCookie(res, result);
    return { user: result.user };
  }

  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(AUTH_COOKIE, this.cookieOptions());
  }

  private setSessionCookie(res: Response, result: AuthResult) {
    res.cookie(AUTH_COOKIE, result.token, {
      ...this.cookieOptions(),
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private cookieOptions() {
    const secure = this.config.get<string>("COOKIE_SECURE") === "true";
    return {
      httpOnly: true,
      sameSite: "lax" as const,
      secure,
      path: "/",
    };
  }
}
```

#### Файл `apps/api/src/modules/auth/auth.service.ts`

```typescript
import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../../prisma/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import type { JwtPayload } from "./jwt.strategy";

export type AuthResult = {
  token: string;
  user: { id: string; name: string; email: string; avatarUrl: string | null };
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException("Email already in use");

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
      },
      select: { id: true, name: true, email: true, avatarUrl: true },
    });

    return { token: this.signToken(user.id, user.email), user };
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.passwordHash) throw new UnauthorizedException("Invalid credentials");

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException("Invalid credentials");

    return {
      token: this.signToken(user.id, user.email),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  private signToken(userId: string, email: string): string {
    const payload: JwtPayload = { sub: userId, email };
    return this.jwt.sign(payload);
  }
}
```

#### Файл `apps/api/src/modules/auth/jwt.strategy.ts`

```typescript
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { Strategy } from "passport-jwt";

export type JwtPayload = { sub: string; email: string };

export const AUTH_COOKIE = "fjp_session";

function cookieExtractor(req: Request): string | null {
  const cookies = (req as Request & { cookies?: Record<string, string> }).cookies;
  return cookies?.[AUTH_COOKIE] ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>("JWT_SECRET"),
    });
  }

  validate(payload: JwtPayload) {
    return { id: payload.sub, email: payload.email };
  }
}
```

#### Файл `apps/api/src/modules/auth/jwt-auth.guard.ts`

```typescript
import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
```

#### Файл `apps/api/src/modules/auth/dto/register.dto.ts`

```typescript
import { IsEmail, IsString, MinLength } from "class-validator";

export class RegisterDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
```

#### Файл `apps/api/src/modules/auth/dto/login.dto.ts`

```typescript
import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
```

### 3. Модуль пользователей (`modules/users`)

#### Файл `apps/api/src/modules/users/users.module.ts`

```typescript
import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

#### Файл `apps/api/src/modules/users/users.controller.ts`

```typescript
import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, type AuthUser } from "../../common/current-user.decorator";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthUser) {
    return this.users.findById(user.id);
  }
}
```

#### Файл `apps/api/src/modules/users/users.service.ts`

```typescript
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true },
    });
    if (!user) throw new NotFoundException();
    return user;
  }
}
```

### 4. Модуль поездок (`modules/trips`)

#### Файл `apps/api/src/modules/trips/trips.module.ts`

```typescript
import { Module } from "@nestjs/common";
import { TripsController } from "./trips.controller";
import { TripsService } from "./trips.service";

@Module({
  controllers: [TripsController],
  providers: [TripsService],
  exports: [TripsService],
})
export class TripsModule {}
```

#### Файл `apps/api/src/modules/trips/trips.controller.ts`

```typescript
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser, type AuthUser } from "../../common/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateTripDto } from "./dto/create-trip.dto";
import { InviteMemberDto } from "./dto/invite-member.dto";
import { UpdateTripDto } from "./dto/update-trip.dto";
import { TripsService } from "./trips.service";

@Controller("trips")
@UseGuards(JwtAuthGuard)
export class TripsController {
  constructor(private readonly trips: TripsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.trips.listForUser(user.id);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.trips.findByIdForUser(id, user.id);
  }

  @Post()
  create(@Body() dto: CreateTripDto, @CurrentUser() user: AuthUser) {
    return this.trips.create(user.id, dto);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateTripDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.trips.update(id, user.id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    await this.trips.remove(id, user.id);
  }

  @Post(":id/members")
  inviteMember(
    @Param("id") id: string,
    @Body() dto: InviteMemberDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.trips.inviteMember(id, user.id, dto.email);
  }

  @Delete(":id/members/:memberId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMember(
    @Param("id") id: string,
    @Param("memberId") memberId: string,
    @CurrentUser() user: AuthUser,
  ) {
    await this.trips.removeMember(id, memberId, user.id);
  }
}
```

#### Файл `apps/api/src/modules/trips/trips.service.ts`

```typescript
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateTripDto } from "./dto/create-trip.dto";
import { UpdateTripDto } from "./dto/update-trip.dto";

const tripSelect = {
  id: true,
  title: true,
  description: true,
  destinationLabel: true,
  startDate: true,
  endDate: true,
  status: true,
  createdAt: true,
  ownerId: true,
  members: {
    select: {
      id: true,
      role: true,
      joinedAt: true,
      user: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
  },
} as const;

@Injectable()
export class TripsService {
  constructor(private readonly prisma: PrismaService) {}

  listForUser(userId: string) {
    return this.prisma.trip.findMany({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
      orderBy: { createdAt: "desc" },
      select: tripSelect,
    });
  }

  async findByIdForUser(id: string, userId: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id },
      select: tripSelect,
    });
    if (!trip) throw new NotFoundException();
    if (!this.isMember(trip, userId)) throw new ForbiddenException();
    return trip;
  }

  async assertMember(tripId: string, userId: string): Promise<void> {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      select: { ownerId: true, members: { select: { userId: true } } },
    });
    if (!trip) throw new NotFoundException();
    if (trip.ownerId === userId) return;
    if (trip.members.some((m) => m.userId === userId)) return;
    throw new ForbiddenException();
  }

  async create(userId: string, dto: CreateTripDto) {
    const trip = await this.prisma.trip.create({
      data: {
        title: dto.title,
        description: dto.description,
        destinationLabel: dto.destinationLabel,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        ownerId: userId,
        members: {
          create: { userId, role: "owner" },
        },
      },
      select: tripSelect,
    });
    return trip;
  }

  async update(id: string, userId: string, dto: UpdateTripDto) {
    const existing = await this.prisma.trip.findUnique({
      where: { id },
      select: { ownerId: true },
    });
    if (!existing) throw new NotFoundException();
    if (existing.ownerId !== userId) throw new ForbiddenException();

    return this.prisma.trip.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        destinationLabel: dto.destinationLabel,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        status: dto.status,
      },
      select: tripSelect,
    });
  }

  async remove(id: string, userId: string) {
    const existing = await this.prisma.trip.findUnique({
      where: { id },
      select: { ownerId: true },
    });
    if (!existing) throw new NotFoundException();
    if (existing.ownerId !== userId) throw new ForbiddenException();
    await this.prisma.trip.delete({ where: { id } });
  }

  async inviteMember(tripId: string, userId: string, email: string) {
    await this.assertMember(tripId, userId);
    const invitee = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (!invitee) {
      throw new NotFoundException("Пользователь с таким email не найден");
    }
    const existing = await this.prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId: invitee.id } },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException("Уже участник этой поездки");
    }
    await this.prisma.tripMember.create({
      data: { tripId, userId: invitee.id, role: "member" },
    });
    return this.findByIdForUser(tripId, userId);
  }

  async removeMember(tripId: string, memberId: string, userId: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      select: { ownerId: true },
    });
    if (!trip) throw new NotFoundException();
    if (trip.ownerId !== userId) throw new ForbiddenException();

    const member = await this.prisma.tripMember.findUnique({
      where: { id: memberId },
      select: { tripId: true, userId: true, role: true },
    });
    if (!member) throw new NotFoundException();
    if (member.tripId !== tripId) throw new ForbiddenException();
    if (member.role === "owner") {
      throw new ForbiddenException("Нельзя удалить организатора");
    }
    await this.prisma.tripMember.delete({ where: { id: memberId } });
  }

  private isMember(trip: { ownerId: string; members: { user: { id: string } }[] }, userId: string) {
    if (trip.ownerId === userId) return true;
    return trip.members.some((m) => m.user.id === userId);
  }
}
```

#### Файл `apps/api/src/modules/trips/dto/create-trip.dto.ts`

```typescript
import { IsDateString, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateTripDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  destinationLabel?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
```

#### Файл `apps/api/src/modules/trips/dto/update-trip.dto.ts`

```typescript
import { PartialType } from "@nestjs/mapped-types";
import { CreateTripDto } from "./create-trip.dto";
import { IsIn, IsOptional, IsString } from "class-validator";

export class UpdateTripDto extends PartialType(CreateTripDto) {
  @IsOptional()
  @IsString()
  @IsIn(["draft", "planning", "active", "done"])
  status?: string;
}
```

#### Файл `apps/api/src/modules/trips/dto/invite-member.dto.ts`

```typescript
import { IsEmail } from "class-validator";

export class InviteMemberDto {
  @IsEmail()
  email!: string;
}
```

### 5. Модуль расписания (`modules/itinerary`)

#### Файл `apps/api/src/modules/itinerary/itinerary.module.ts`

```typescript
import { Module } from "@nestjs/common";
import { TripsModule } from "../trips/trips.module";
import { ItineraryController } from "./itinerary.controller";
import { ItineraryService } from "./itinerary.service";

@Module({
  imports: [TripsModule],
  controllers: [ItineraryController],
  providers: [ItineraryService],
})
export class ItineraryModule {}
```

#### Файл `apps/api/src/modules/itinerary/itinerary.controller.ts`

```typescript
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser, type AuthUser } from "../../common/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateDayDto, UpdateDayDto } from "./dto/day.dto";
import {
  CreateScheduleItemDto,
  UpdateScheduleItemDto,
} from "./dto/schedule-item.dto";
import { ItineraryService } from "./itinerary.service";

@Controller("trips/:tripId")
@UseGuards(JwtAuthGuard)
export class ItineraryController {
  constructor(private readonly itinerary: ItineraryService) {}

  @Get("days")
  listDays(@Param("tripId") tripId: string, @CurrentUser() user: AuthUser) {
    return this.itinerary.listDays(tripId, user.id);
  }

  @Post("days")
  createDay(
    @Param("tripId") tripId: string,
    @Body() dto: CreateDayDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.itinerary.createDay(tripId, user.id, dto);
  }

  @Patch("days/:dayId")
  updateDay(
    @Param("tripId") tripId: string,
    @Param("dayId") dayId: string,
    @Body() dto: UpdateDayDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.itinerary.updateDay(tripId, dayId, user.id, dto);
  }

  @Delete("days/:dayId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeDay(
    @Param("tripId") tripId: string,
    @Param("dayId") dayId: string,
    @CurrentUser() user: AuthUser,
  ) {
    await this.itinerary.removeDay(tripId, dayId, user.id);
  }

  @Post("days/:dayId/items")
  createItem(
    @Param("tripId") tripId: string,
    @Param("dayId") dayId: string,
    @Body() dto: CreateScheduleItemDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.itinerary.createItem(tripId, dayId, user.id, dto);
  }

  @Patch("days/:dayId/items/:itemId")
  updateItem(
    @Param("tripId") tripId: string,
    @Param("dayId") dayId: string,
    @Param("itemId") itemId: string,
    @Body() dto: UpdateScheduleItemDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.itinerary.updateItem(tripId, dayId, itemId, user.id, dto);
  }

  @Delete("days/:dayId/items/:itemId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeItem(
    @Param("tripId") tripId: string,
    @Param("dayId") dayId: string,
    @Param("itemId") itemId: string,
    @CurrentUser() user: AuthUser,
  ) {
    await this.itinerary.removeItem(tripId, dayId, itemId, user.id);
  }
}
```

#### Файл `apps/api/src/modules/itinerary/itinerary.service.ts`

```typescript
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { TripsService } from "../trips/trips.service";
import { CreateDayDto, UpdateDayDto } from "./dto/day.dto";
import {
  CreateScheduleItemDto,
  UpdateScheduleItemDto,
} from "./dto/schedule-item.dto";

const itemSelect = {
  id: true,
  type: true,
  title: true,
  description: true,
  startTime: true,
  endTime: true,
  sortOrder: true,
  lat: true,
  lng: true,
  address: true,
  tripDayId: true,
  placeCacheId: true,
} as const;

const daySelect = {
  id: true,
  date: true,
  dayNumber: true,
  tripId: true,
  scheduleItems: {
    select: itemSelect,
    orderBy: [{ sortOrder: "asc" as const }, { startTime: "asc" as const }],
  },
};

@Injectable()
export class ItineraryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trips: TripsService,
  ) {}

  async listDays(tripId: string, userId: string) {
    await this.trips.assertMember(tripId, userId);
    return this.prisma.tripDay.findMany({
      where: { tripId },
      orderBy: { dayNumber: "asc" },
      select: daySelect,
    });
  }

  async createDay(tripId: string, userId: string, dto: CreateDayDto) {
    await this.trips.assertMember(tripId, userId);
    return this.prisma.tripDay.create({
      data: {
        tripId,
        date: new Date(dto.date),
        dayNumber: dto.dayNumber,
      },
      select: daySelect,
    });
  }

  async updateDay(tripId: string, dayId: string, userId: string, dto: UpdateDayDto) {
    await this.trips.assertMember(tripId, userId);
    const day = await this.prisma.tripDay.findUnique({ where: { id: dayId }, select: { tripId: true } });
    if (!day) throw new NotFoundException();
    if (day.tripId !== tripId) throw new ForbiddenException();
    return this.prisma.tripDay.update({
      where: { id: dayId },
      data: {
        date: dto.date ? new Date(dto.date) : undefined,
        dayNumber: dto.dayNumber,
      },
      select: daySelect,
    });
  }

  async removeDay(tripId: string, dayId: string, userId: string) {
    await this.trips.assertMember(tripId, userId);
    const day = await this.prisma.tripDay.findUnique({ where: { id: dayId }, select: { tripId: true } });
    if (!day) throw new NotFoundException();
    if (day.tripId !== tripId) throw new ForbiddenException();
    await this.prisma.tripDay.delete({ where: { id: dayId } });
  }

  async createItem(
    tripId: string,
    dayId: string,
    userId: string,
    dto: CreateScheduleItemDto,
  ) {
    await this.trips.assertMember(tripId, userId);
    const day = await this.prisma.tripDay.findUnique({ where: { id: dayId }, select: { tripId: true } });
    if (!day) throw new NotFoundException();
    if (day.tripId !== tripId) throw new ForbiddenException();

    const nextSort =
      dto.sortOrder ??
      (await this.prisma.scheduleItem.count({ where: { tripDayId: dayId } }));
    return this.prisma.scheduleItem.create({
      data: {
        tripDayId: dayId,
        type: dto.type,
        title: dto.title,
        description: dto.description,
        startTime: dto.startTime,
        endTime: dto.endTime,
        sortOrder: nextSort,
        lat: dto.lat,
        lng: dto.lng,
        address: dto.address,
      },
      select: itemSelect,
    });
  }

  async updateItem(
    tripId: string,
    dayId: string,
    itemId: string,
    userId: string,
    dto: UpdateScheduleItemDto,
  ) {
    await this.trips.assertMember(tripId, userId);
    const item = await this.prisma.scheduleItem.findUnique({
      where: { id: itemId },
      select: { tripDayId: true, tripDay: { select: { tripId: true } } },
    });
    if (!item) throw new NotFoundException();
    if (item.tripDayId !== dayId || item.tripDay.tripId !== tripId)
      throw new ForbiddenException();

    return this.prisma.scheduleItem.update({
      where: { id: itemId },
      data: {
        type: dto.type,
        title: dto.title,
        description: dto.description,
        startTime: dto.startTime,
        endTime: dto.endTime,
        sortOrder: dto.sortOrder,
        lat: dto.lat,
        lng: dto.lng,
        address: dto.address,
      },
      select: itemSelect,
    });
  }

  async removeItem(
    tripId: string,
    dayId: string,
    itemId: string,
    userId: string,
  ) {
    await this.trips.assertMember(tripId, userId);
    const item = await this.prisma.scheduleItem.findUnique({
      where: { id: itemId },
      select: { tripDayId: true, tripDay: { select: { tripId: true } } },
    });
    if (!item) throw new NotFoundException();
    if (item.tripDayId !== dayId || item.tripDay.tripId !== tripId)
      throw new ForbiddenException();
    await this.prisma.scheduleItem.delete({ where: { id: itemId } });
  }
}
```

#### Файл `apps/api/src/modules/itinerary/dto/day.dto.ts`

```typescript
import { IsDateString, IsInt, IsOptional, Min } from "class-validator";

export class CreateDayDto {
  @IsDateString()
  date!: string;

  @IsInt()
  @Min(1)
  dayNumber!: number;
}

export class UpdateDayDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  dayNumber?: number;
}
```

#### Файл `apps/api/src/modules/itinerary/dto/schedule-item.dto.ts`

```typescript
import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

const ITEM_TYPES = ["flight", "stay", "food", "walk", "drive", "place", "custom"] as const;

export class CreateScheduleItemDto {
  @IsIn(ITEM_TYPES as unknown as string[])
  type!: (typeof ITEM_TYPES)[number];

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  startTime?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  endTime?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng?: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  address?: string;
}

export class UpdateScheduleItemDto {
  @IsOptional()
  @IsIn(ITEM_TYPES as unknown as string[])
  type?: (typeof ITEM_TYPES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  startTime?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  endTime?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng?: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  address?: string;
}
```

### 6. Модуль голосований (`modules/votes`)

#### Файл `apps/api/src/modules/votes/votes.module.ts`

```typescript
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
```

#### Файл `apps/api/src/modules/votes/votes.controller.ts`

```typescript
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
```

#### Файл `apps/api/src/modules/votes/votes.service.ts`

```typescript
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { TripsService } from "../trips/trips.service";
import { AnswerVoteDto, CreateVoteDto } from "./dto/vote.dto";

@Injectable()
export class VotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trips: TripsService,
  ) {}

  async list(tripId: string, userId: string) {
    await this.trips.assertMember(tripId, userId);
    const raw = await this.prisma.vote.findMany({
      where: { tripId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        createdAt: true,
        resolvedAt: true,
        tripId: true,
        createdBy: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        options: {
          select: {
            id: true,
            label: true,
            _count: { select: { answers: true } },
            answers: {
              where: { userId },
              select: { id: true },
            },
          },
        },
      },
    });
    return raw.map((v) => this.mapVote(v));
  }

  async create(tripId: string, userId: string, dto: CreateVoteDto) {
    await this.trips.assertMember(tripId, userId);
    const vote = await this.prisma.vote.create({
      data: {
        tripId,
        createdById: userId,
        title: dto.title,
        type: "single",
        options: {
          create: dto.options.map((label) => ({ label })),
        },
      },
      select: { id: true },
    });
    return this.findOne(tripId, userId, vote.id);
  }

  async findOne(tripId: string, userId: string, voteId: string) {
    await this.trips.assertMember(tripId, userId);
    const raw = await this.prisma.vote.findUnique({
      where: { id: voteId },
      select: {
        id: true,
        title: true,
        createdAt: true,
        resolvedAt: true,
        tripId: true,
        createdBy: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        options: {
          select: {
            id: true,
            label: true,
            _count: { select: { answers: true } },
            answers: { where: { userId }, select: { id: true } },
          },
        },
      },
    });
    if (!raw) throw new NotFoundException();
    if (raw.tripId !== tripId) throw new ForbiddenException();
    return this.mapVote(raw);
  }

  async castAnswer(tripId: string, voteId: string, userId: string, dto: AnswerVoteDto) {
    await this.trips.assertMember(tripId, userId);
    const vote = await this.prisma.vote.findUnique({
      where: { id: voteId },
      select: {
        tripId: true,
        resolvedAt: true,
        options: { select: { id: true } },
      },
    });
    if (!vote) throw new NotFoundException();
    if (vote.tripId !== tripId) throw new ForbiddenException();
    if (vote.resolvedAt) throw new ForbiddenException("Голосование закрыто");
    if (!vote.options.some((o) => o.id === dto.optionId)) {
      throw new NotFoundException("Такого варианта нет");
    }

    const optionIds = vote.options.map((o) => o.id);
    const currentAnswers = await this.prisma.voteAnswer.findMany({
      where: { userId, optionId: { in: optionIds } },
      select: { id: true, optionId: true },
    });

    const sameOption = currentAnswers.find((a) => a.optionId === dto.optionId);
    await this.prisma.$transaction(async (tx) => {
      if (currentAnswers.length) {
        await tx.voteAnswer.deleteMany({
          where: { id: { in: currentAnswers.map((a) => a.id) } },
        });
      }
      if (!sameOption) {
        await tx.voteAnswer.create({
          data: { optionId: dto.optionId, userId },
        });
      }
    });

    return this.findOne(tripId, userId, voteId);
  }

  async clearAnswer(tripId: string, voteId: string, userId: string) {
    await this.trips.assertMember(tripId, userId);
    const vote = await this.prisma.vote.findUnique({
      where: { id: voteId },
      select: {
        tripId: true,
        options: { select: { id: true } },
      },
    });
    if (!vote) throw new NotFoundException();
    if (vote.tripId !== tripId) throw new ForbiddenException();
    const optionIds = vote.options.map((o) => o.id);
    await this.prisma.voteAnswer.deleteMany({
      where: { userId, optionId: { in: optionIds } },
    });
    return this.findOne(tripId, userId, voteId);
  }

  private mapVote(v: {
    id: string;
    title: string;
    createdAt: Date;
    resolvedAt: Date | null;
    tripId: string;
    createdBy: { id: string; name: string; email: string; avatarUrl: string | null };
    options: {
      id: string;
      label: string;
      _count: { answers: number };
      answers: { id: string }[];
    }[];
  }) {
    const options = v.options.map((o) => ({
      id: o.id,
      label: o.label,
      count: o._count.answers,
    }));
    const myAnswerOption = v.options.find((o) => o.answers.length > 0);
    const total = options.reduce((s, o) => s + o.count, 0);
    return {
      id: v.id,
      tripId: v.tripId,
      title: v.title,
      createdAt: v.createdAt,
      resolvedAt: v.resolvedAt,
      createdBy: v.createdBy,
      options,
      myAnswer: myAnswerOption?.id ?? null,
      total,
    };
  }
}
```

#### Файл `apps/api/src/modules/votes/dto/vote.dto.ts`

```typescript
import { ArrayMinSize, IsArray, IsString, MaxLength, MinLength } from "class-validator";

export class CreateVoteDto {
  @IsString()
  @MinLength(1)
  @MaxLength(280)
  title!: string;

  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  options!: string[];
}

export class AnswerVoteDto {
  @IsString()
  optionId!: string;
}
```

### 7. Модуль расходов (`modules/expenses`)

#### Файл `apps/api/src/modules/expenses/expenses.module.ts`

```typescript
import { Module } from "@nestjs/common";
import { TripsModule } from "../trips/trips.module";
import { ExpensesController } from "./expenses.controller";
import { ExpensesService } from "./expenses.service";

@Module({
  imports: [TripsModule],
  controllers: [ExpensesController],
  providers: [ExpensesService],
})
export class ExpensesModule {}
```

#### Файл `apps/api/src/modules/expenses/expenses.controller.ts`

```typescript
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
```

#### Файл `apps/api/src/modules/expenses/expenses.service.ts`

```typescript
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { TripsService } from "../trips/trips.service";
import { CreateExpenseDto } from "./dto/expense.dto";

const expenseSelect = {
  id: true,
  title: true,
  amount: true,
  category: true,
  currency: true,
  expenseDate: true,
  note: true,
  createdAt: true,
  tripId: true,
  createdBy: {
    select: { id: true, name: true, email: true, avatarUrl: true },
  },
  splits: {
    select: {
      id: true,
      amount: true,
      status: true,
      user: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
  },
};

@Injectable()
export class ExpensesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trips: TripsService,
  ) {}

  async list(tripId: string, userId: string) {
    await this.trips.assertMember(tripId, userId);
    return this.prisma.expense.findMany({
      where: { tripId },
      orderBy: { createdAt: "desc" },
      select: expenseSelect,
    });
  }

  async create(tripId: string, userId: string, dto: CreateExpenseDto) {
    await this.trips.assertMember(tripId, userId);
    const memberIds = await this.tripMemberIds(tripId);
    if (!memberIds.has(dto.payerId)) {
      throw new BadRequestException("Плательщик не участник поездки");
    }
    for (const id of dto.splitUserIds) {
      if (!memberIds.has(id)) {
        throw new BadRequestException("В разделе расхода есть не-участник");
      }
    }

    const share = round2(dto.amount / dto.splitUserIds.length);
    return this.prisma.expense.create({
      data: {
        tripId,
        createdById: dto.payerId,
        title: dto.title,
        amount: dto.amount,
        category: dto.category ?? "other",
        currency: dto.currency ?? "RUB",
        expenseDate: dto.expenseDate ? new Date(dto.expenseDate) : null,
        note: dto.note,
        splits: {
          create: dto.splitUserIds.map((uid) => ({
            userId: uid,
            amount: share,
            status: "pending",
          })),
        },
      },
      select: expenseSelect,
    });
  }

  async remove(tripId: string, expenseId: string, userId: string) {
    await this.trips.assertMember(tripId, userId);
    const exp = await this.prisma.expense.findUnique({
      where: { id: expenseId },
      select: { tripId: true, createdById: true },
    });
    if (!exp) throw new NotFoundException();
    if (exp.tripId !== tripId) throw new ForbiddenException();
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      select: { ownerId: true },
    });
    if (!trip) throw new NotFoundException();
    if (exp.createdById !== userId && trip.ownerId !== userId) {
      throw new ForbiddenException();
    }
    await this.prisma.expense.delete({ where: { id: expenseId } });
  }

  private async tripMemberIds(tripId: string): Promise<Set<string>> {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      select: {
        ownerId: true,
        members: { select: { userId: true } },
      },
    });
    if (!trip) throw new NotFoundException();
    const ids = new Set<string>([trip.ownerId, ...trip.members.map((m) => m.userId)]);
    return ids;
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
```

#### Файл `apps/api/src/modules/expenses/dto/expense.dto.ts`

```typescript
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateExpenseDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsString()
  payerId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  splitUserIds!: string[];

  @IsOptional()
  @IsString()
  @MaxLength(60)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @IsOptional()
  @IsDateString()
  expenseDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
```

### 8. Модуль чата (`modules/chat`)

#### Файл `apps/api/src/modules/chat/chat.module.ts`

```typescript
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
```

#### Файл `apps/api/src/modules/chat/chat.controller.ts`

```typescript
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
```

#### Файл `apps/api/src/modules/chat/chat.service.ts`

```typescript
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
```

#### Файл `apps/api/src/modules/chat/dto/message.dto.ts`

```typescript
import { IsString, MaxLength, MinLength } from "class-validator";

export class CreateMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  text!: string;
}
```

### 9. Модуль ИИ-ассистента (`modules/ai`)

#### Файл `apps/api/src/modules/ai/ai.module.ts`

```typescript
import { Module } from "@nestjs/common";
import { TripsModule } from "../trips/trips.module";
import { AiController } from "./ai.controller";
import { AiService } from "./ai.service";

@Module({
  imports: [TripsModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
```

#### Файл `apps/api/src/modules/ai/ai.controller.ts`

```typescript
import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AiService } from "./ai.service";

@Controller("ai")
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Get("status")
  status() {
    return { enabled: this.ai.isEnabled() };
  }
}
```

#### Файл `apps/api/src/modules/ai/ai.service.ts`

```typescript
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

  async summarizeBlock(
    messages: { author: string; text: string; isBot: boolean }[],
  ): Promise<BlockSummaryResult> {
    if (!this.client) {
      throw new ServiceUnavailableException("AI не настроен");
    }
    const transcript = messages
      .map((m) => `${m.isBot ? "Гид" : m.author}: ${m.text}`)
      .join("\n");

    const system = `Ты сжимаешь фрагмент группового чата путешественников в краткую «память».
Зафиксируй ОБЩЕЕ НАСТРОЕНИЕ фрагмента, о чём говорили, что решили и какие вопросы остались открытыми.

Правила:
- Пиши на русском, живо и по делу.
- mood — одной фразой передай настроение и динамику (напр. «воодушевлённые, спорят о бюджете»).
- summary — 2–4 предложения.
- topics / decisions / questions — короткие пункты; пустой массив допустим.
- Вызови инструмент save_chat_summary.`;

    const tool: Anthropic.Tool = {
      name: "save_chat_summary",
      description: "Сохранить сжатую память по фрагменту чата",
      input_schema: {
        type: "object",
        properties: {
          mood: { type: "string", description: "Общее настроение фрагмента, одной фразой" },
          summary: { type: "string", description: "2–4 предложения о чём говорили" },
          topics: { type: "array", items: { type: "string" } },
          decisions: { type: "array", items: { type: "string" } },
          questions: { type: "array", items: { type: "string" } },
        },
        required: ["mood", "summary", "topics", "decisions", "questions"],
      },
    };

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 700,
      system,
      tools: [tool],
      tool_choice: { type: "tool", name: "save_chat_summary" },
      messages: [
        {
          role: "user",
          content: `Фрагмент чата (${messages.length} сообщений):\n\n${transcript || "(пусто)"}`,
        },
      ],
    });
    const block = response.content.find((b) => b.type === "tool_use");
    if (!block || block.type !== "tool_use") {
      throw new Error("no tool_use block in summary response");
    }
    return block.input as BlockSummaryResult;
  }

  async askGuide(
    tripId: string,
    userId: string,
    dto: AskGuideDto,
    rollingSummary?: string,
  ): Promise<string> {
    if (!this.client) {
      throw new ServiceUnavailableException(
        "AI-гид не настроен. Добавьте ANTHROPIC_API_KEY в apps/api/.env",
      );
    }
    await this.trips.assertMember(tripId, userId);
    const tripCtx = await this.buildTripContext(tripId);
    const recent = formatRecent(dto.recentMessages ?? []);

    const memorySection =
      rollingSummary && rollingSummary.trim().length > 0
        ? `Память о ранних обсуждениях (сжатые блоки чата, от старых к новым):
${rollingSummary}

`
        : "";

    const system = `Ты — Гид, дружелюбный AI-помощник в чате группы друзей, планирующих путешествие.

Контекст поездки:
${tripCtx}

${memorySection}Последние сообщения в чате:
${recent || "(пусто)"}

Правила:
- Отвечай на русском, в дружеском тоне, как в чате.
- Опирайся на «Память о ранних обсуждениях», чтобы помнить весь чат, а не только последние сообщения.
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

  async suggest(tripId: string): Promise<SuggestionResult> {
    if (!this.client) {
      throw new ServiceUnavailableException("AI не настроен");
    }
    const tripCtx = await this.buildTripContext(tripId);

    const system = `Ты — Гид, помощник в планировании путешествия. На основе данных поездки предложи 5–6 конкретных, полезных идей: куда сходить, что посмотреть, что попробовать, на что заложить время.

Данные поездки:
${tripCtx}

Правила:
- Опирайся на направление и маршрут выше; используй свои знания о местах этого региона. Если направление известно — НЕ проси уточнений, сразу давай идеи.
- Где уместно — привязывай идею к конкретному дню (title вида «День 3 · Казбеги»); если день не очевиден — дай тематический заголовок.
- text — 1–2 фразы с конкретикой: название места, сколько времени займёт, практичный совет.
- ask — готовый вопрос от лица участника, который можно задать гиду, чтобы углубиться в идею.
- Предлагай новое, не дублируй уже добавленные пункты маршрута.
- Пиши на русском. Вызови инструмент save_suggestions.`;

    const tool: Anthropic.Tool = {
      name: "save_suggestions",
      description: "Сохранить подсказки по поездке",
      input_schema: {
        type: "object",
        properties: {
          suggestions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                text: { type: "string" },
                ask: { type: "string" },
              },
              required: ["title", "text", "ask"],
            },
          },
        },
        required: ["suggestions"],
      },
    };

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1500,
      system,
      tools: [tool],
      tool_choice: { type: "tool", name: "save_suggestions" },
      messages: [{ role: "user", content: "Предложи идеи для нашей поездки." }],
    });
    const block = response.content.find((b) => b.type === "tool_use");
    if (!block || block.type !== "tool_use") {
      throw new Error("no tool_use block in suggestions response");
    }
    return block.input as SuggestionResult;
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

export type BlockSummaryResult = {
  mood: string;
  summary: string;
  topics: string[];
  decisions: string[];
  questions: string[];
};

export type Suggestion = { title: string; text: string; ask: string };
export type SuggestionResult = { suggestions: Suggestion[] };

function formatRecent(msgs: RecentMessageDto[]): string {
  return msgs
    .slice(-12)
    .map((m) => `${m.isBot ? "Гид" : m.author}: ${m.text}`)
    .join("\n");
}
```

#### Файл `apps/api/src/modules/ai/dto/ask.dto.ts`

```typescript
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class RecentMessageDto {
  @IsString()
  @MaxLength(40)
  author!: string;

  @IsString()
  @MaxLength(2000)
  text!: string;

  @IsOptional()
  @IsBoolean()
  isBot?: boolean;
}

export class AskGuideDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  question!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => RecentMessageDto)
  recentMessages?: RecentMessageDto[];
}
```

---

## Часть III. Клиентская часть (React + Vite + TypeScript)

### 1. Каркас приложения

#### Файл `apps/web/src/main.tsx`

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app/App";
import "./app/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

#### Файл `apps/web/src/app/App.tsx`

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { I18nProvider } from "@/shared/lib/i18n";
import { AuthProvider } from "@/shared/lib/auth-context";
import { RequireAuth } from "@/shared/lib/RequireAuth";
import { LandingPage } from "@/pages/LandingPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { TripDetailPage } from "@/pages/TripDetailPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/trips"
                element={
                  <RequireAuth>
                    <DashboardPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/trips/:id"
                element={
                  <RequireAuth>
                    <TripDetailPage />
                  </RequireAuth>
                }
              />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}
```

#### Файл `apps/web/src/shared/lib/RequireAuth.tsx`

```tsx
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./auth-context";

export function RequireAuth({ children }: { children: ReactNode }) {
  const auth = useAuth();
  if (auth.status === "loading") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--ink-3)",
          fontFamily: "var(--font-mono)",
          fontSize: 13,
        }}
      >
        loading…
      </div>
    );
  }
  if (auth.status === "anon") return <Navigate to="/login" replace />;
  return <>{children}</>;
}
```

### 2. Страницы (`pages/`)

#### Файл `apps/web/src/pages/LoginPage.tsx`

```tsx
import { AuthShell } from "@/features/auth/AuthShell";

export function LoginPage() {
  return <AuthShell mode="login" />;
}
```

#### Файл `apps/web/src/pages/RegisterPage.tsx`

```tsx
import { AuthShell } from "@/features/auth/AuthShell";

export function RegisterPage() {
  return <AuthShell mode="register" />;
}
```

#### Файл `apps/web/src/pages/DashboardPage.tsx`

```tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useT } from "@/shared/lib/i18n";
import { useAuth } from "@/shared/lib/auth-context";
import { listTrips, createTrip, type ApiTrip } from "@/shared/api/trips";
import { ApiError } from "@/shared/api/client";
import { Logo } from "@/shared/ui/Logo";
import { LangSwitcher } from "@/shared/ui/LangSwitcher";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import { TripCard, NewTripCard } from "@/features/dashboard/TripCard";
import { EmptyState } from "@/features/dashboard/EmptyState";
import { CreateTripModal } from "@/features/dashboard/CreateTripModal";

type Filter = "all" | "draft" | "planning" | "active" | "done";

const tripsKey = ["trips"] as const;

export function DashboardPage() {
  const { t } = useT();
  const navigate = useNavigate();
  const auth = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Filter>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const tripsQuery = useQuery({
    queryKey: tripsKey,
    queryFn: listTrips,
  });

  const createMutation = useMutation({
    mutationFn: createTrip,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tripsKey });
      setCreateOpen(false);
      setCreateError(null);
    },
    onError: (err: unknown) => {
      setCreateError(err instanceof Error ? err.message : "Не удалось создать поездку");
    },
  });

  const trips = useMemo(() => tripsQuery.data ?? [], [tripsQuery.data]);
  const counts = useMemo(() => countByStatus(trips), [trips]);
  const filtered = trips.filter((tr) => filter === "all" || tr.status === filter);

  const firstName = auth.user?.name?.split(/\s+/)[0] ?? "";

  return (
    <div className="fade-in" style={{ minHeight: "100vh", background: "var(--paper)" }}>
      <header
        style={{
          borderBottom: "1px solid var(--line)",
          background: "oklch(from var(--paper) l c h / 0.85)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          style={{
            maxWidth: 1320,
            margin: "0 auto",
            padding: "16px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <button onClick={() => navigate("/")}>
            <Logo />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => void auth.logout().then(() => navigate("/"))}
              title="Выйти"
            >
              ⎋
            </button>
            <LangSwitcher />
            {auth.user && <UserAvatar user={auth.user} size={36} ring={false} />}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1320, margin: "0 auto", padding: "40px 32px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <h1 style={{ fontSize: 36, lineHeight: 1.1, fontWeight: 600 }}>
            {t("dash.greet")},{" "}
            <span className="display-italic" style={{ color: "var(--terracotta)" }}>
              {firstName}
            </span>
          </h1>
          <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
            + {t("nav.create")}
          </button>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", gap: 4 }}>
            {(
              [
                { id: "all", label: t("dash.filter.all"), count: trips.length },
                { id: "planning", label: t("dash.filter.planning"), count: counts.planning },
                { id: "active", label: t("dash.filter.active"), count: counts.active },
                { id: "done", label: t("dash.filter.done"), count: counts.done },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 999,
                  background: filter === f.id ? "var(--paper-2)" : "transparent",
                  color: filter === f.id ? "var(--ink)" : "var(--ink-3)",
                  fontSize: 13,
                  fontWeight: filter === f.id ? 500 : 400,
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <input
              className="input"
              placeholder={t("common.search") + "..."}
              style={{ width: 240, padding: "8px 14px", fontSize: 13 }}
            />
          </div>
        </div>

        {tripsQuery.isLoading && (
          <div className="mono" style={{ color: "var(--ink-3)", textAlign: "center" }}>
            загрузка…
          </div>
        )}

        {tripsQuery.isError && (
          <div style={{ padding: 60, textAlign: "center", color: "var(--terracotta-ink)" }}>
            Не удалось получить список поездок. Проверьте, что API запущен.
            <div className="mono" style={{ fontSize: 11, marginTop: 8 }}>
              {errorMessage(tripsQuery.error)}
            </div>
          </div>
        )}

        {tripsQuery.isSuccess && filtered.length === 0 ? (
          <EmptyState onCreate={() => setCreateOpen(true)} />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 20,
            }}
          >
            {filtered.map((tr, i) => (
              <TripCard
                key={tr.id}
                trip={tr}
                index={i}
                onOpen={() => navigate(`/trips/${tr.id}`)}
              />
            ))}
            {tripsQuery.isSuccess && (
              <NewTripCard onClick={() => setCreateOpen(true)} />
            )}
          </div>
        )}
      </main>

      <CreateTripModal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setCreateError(null);
        }}
        onCreate={(draft) => createMutation.mutate(draft)}
        submitting={createMutation.isPending}
        error={createError}
      />
    </div>
  );
}

function countByStatus(trips: ApiTrip[]) {
  const counts = { draft: 0, planning: 0, active: 0, done: 0 };
  for (const t of trips) {
    if (t.status in counts) counts[t.status as keyof typeof counts] += 1;
  }
  return counts;
}

function errorMessage(err: unknown): string {
  if (err instanceof ApiError) return `${err.status} · ${err.message}`;
  if (err instanceof Error) return err.message;
  return String(err);
}
```

#### Файл `apps/web/src/pages/TripDetailPage.tsx`

```tsx
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useT } from "@/shared/lib/i18n";
import { Logo } from "@/shared/ui/Logo";
import { LangSwitcher } from "@/shared/ui/LangSwitcher";
import { useAuth } from "@/shared/lib/auth-context";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import { getTrip } from "@/shared/api/trips";
import { ApiError } from "@/shared/api/client";
import { formatTripDates } from "@/shared/lib/format";
import { ChatTab } from "@/features/trip/ChatTab";
import { SummaryTab } from "@/features/trip/SummaryTab";
import { MapTab } from "@/features/trip/MapTab";
import { ItineraryTab } from "@/features/trip/ItineraryTab";
import { VotesTab } from "@/features/trip/VotesTab";
import { BudgetTab } from "@/features/trip/BudgetTab";
import { MembersTab } from "@/features/trip/MembersTab";
import { FinalTab } from "@/features/trip/FinalTab";

type TabId =
  | "chat"
  | "summary"
  | "map"
  | "itin"
  | "votes"
  | "budget"
  | "members"
  | "final";

export function TripDetailPage() {
  const { t } = useT();
  const navigate = useNavigate();
  const auth = useAuth();
  const { id } = useParams<{ id: string }>();
  const tripId = id ?? "";

  const tripQuery = useQuery({
    queryKey: ["trips", tripId] as const,
    queryFn: () => getTrip(tripId),
    enabled: tripId.length > 0,
  });

  const [tab, setTab] = useState<TabId>("itin");

  const tabs: { id: TabId; label: string }[] = [
    { id: "chat", label: "Чат" },
    { id: "summary", label: "Сводка" },
    { id: "map", label: t("trip.tab.map") },
    { id: "itin", label: t("trip.tab.itin") },
    { id: "votes", label: t("trip.tab.votes") },
    { id: "budget", label: t("trip.tab.budget") },
    { id: "members", label: t("trip.tab.members") },
    { id: "final", label: "Итоги" },
  ];

  if (tripQuery.isLoading) {
    return <CenteredNote text="загрузка…" />;
  }

  if (tripQuery.isError) {
    const err = tripQuery.error;
    const status = err instanceof ApiError ? err.status : 0;
    return (
      <CenteredNote
        text={
          status === 404
            ? "Поездка не найдена"
            : status === 403
              ? "Нет доступа к этой поездке"
              : "Не удалось загрузить поездку"
        }
        sub={<Link to="/trips" className="btn btn-ghost btn-sm">← На дашборд</Link>}
      />
    );
  }

  const trip = tripQuery.data;
  if (!trip) return <CenteredNote text="Поездка не найдена" />;

  const subtitle = [
    trip.destinationLabel,
    formatTripDates(trip.startDate, trip.endDate),
    `${trip.members.length} человек`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      className="fade-in"
      style={{ minHeight: "100vh", background: "var(--paper)", display: "flex" }}
    >
      <aside
        style={{
          width: 220,
          flexShrink: 0,
          borderRight: "1px solid var(--line)",
          background: "var(--paper)",
          padding: "20px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 6px" }}>
          <button onClick={() => navigate("/trips")} title="Все поездки">←</button>
          <button onClick={() => navigate("/trips")} style={{ flex: 1, textAlign: "left" }}>
            <Logo size={22} />
          </button>
        </div>

        <div style={{ padding: "0 8px" }}>
          <h2 style={{ fontSize: 17, lineHeight: 1.2, fontWeight: 600 }}>{trip.title}</h2>
          <p style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{subtitle}</p>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {tabs.map((tb) => {
            const active = tab === tb.id;
            return (
              <button
                key={tb.id}
                onClick={() => setTab(tb.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: active ? "var(--paper-2)" : "transparent",
                  color: active ? "var(--ink)" : "var(--ink-2)",
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  textAlign: "left",
                  position: "relative",
                }}
              >
                {active && (
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 8,
                      bottom: 8,
                      width: 2,
                      borderRadius: 2,
                      background: "var(--terracotta)",
                    }}
                  />
                )}
                {tb.label}
              </button>
            );
          })}
        </nav>

        <div
          style={{
            marginTop: "auto",
            padding: "0 8px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {auth.user && <UserAvatar user={auth.user} size={26} ring={false} />}
          <LangSwitcher />
        </div>
      </aside>

      <main style={{ flex: 1, minWidth: 0, padding: "32px 40px" }}>
        {tab === "chat" && <ChatTab tripId={tripId} />}
        {tab === "summary" && (
          <SummaryTab tripId={tripId} onGoVotes={() => setTab("votes")} />
        )}
        {tab === "map" && <MapTab tripId={tripId} />}
        {tab === "itin" && <ItineraryTab tripId={tripId} />}
        {tab === "votes" && <VotesTab tripId={tripId} />}
        {tab === "budget" && <BudgetTab tripId={tripId} />}
        {tab === "members" && <MembersTab tripId={tripId} />}
        {tab === "final" && <FinalTab tripId={tripId} />}
      </main>
    </div>
  );
}

function CenteredNote({ text, sub }: { text: string; sub?: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        color: "var(--ink-3)",
      }}
    >
      <div className="mono" style={{ fontSize: 13 }}>{text}</div>
      {sub}
    </div>
  );
}
```

### 3. Общий слой: API-клиенты (`shared/api/`)

#### Файл `apps/web/src/shared/api/client.ts`

```typescript
const BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      // not JSON
    }
    const message =
      (body && typeof body === "object" && "message" in body
        ? String((body as { message: unknown }).message)
        : null) ?? `API ${res.status}: ${res.statusText}`;
    throw new ApiError(res.status, message, body);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
```

#### Файл `apps/web/src/shared/api/auth.ts`

```typescript
import { apiFetch } from "./client";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
};

export function register(input: { name: string; email: string; password: string }) {
  return apiFetch<{ user: AuthUser }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function login(input: { email: string; password: string }) {
  return apiFetch<{ user: AuthUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function logout() {
  return apiFetch<void>("/auth/logout", { method: "POST" });
}

export function getMe() {
  return apiFetch<AuthUser>("/users/me");
}
```

#### Файл `apps/web/src/shared/api/trips.ts`

```typescript
import { apiFetch } from "./client";

export type ApiTripMember = {
  id: string;
  role: string;
  joinedAt: string;
  user: { id: string; name: string; email: string; avatarUrl: string | null };
};

export type ApiTrip = {
  id: string;
  title: string;
  description: string | null;
  destinationLabel: string | null;
  startDate: string | null;
  endDate: string | null;
  status: string;
  createdAt: string;
  ownerId: string;
  members: ApiTripMember[];
};

export type CreateTripInput = {
  title: string;
  description?: string;
  destinationLabel?: string;
  startDate?: string;
  endDate?: string;
};

export function listTrips() {
  return apiFetch<ApiTrip[]>("/trips");
}

export function getTrip(id: string) {
  return apiFetch<ApiTrip>(`/trips/${id}`);
}

export function createTrip(input: CreateTripInput) {
  return apiFetch<ApiTrip>("/trips", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function inviteMember(tripId: string, email: string) {
  return apiFetch<ApiTrip>(`/trips/${tripId}/members`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function removeMember(tripId: string, memberId: string) {
  return apiFetch<void>(`/trips/${tripId}/members/${memberId}`, {
    method: "DELETE",
  });
}
```

#### Файл `apps/web/src/shared/api/itinerary.ts`

```typescript
import { apiFetch } from "./client";

export type ApiScheduleItem = {
  id: string;
  type: "flight" | "stay" | "food" | "walk" | "drive" | "place" | "custom";
  title: string;
  description: string | null;
  startTime: string | null;
  endTime: string | null;
  sortOrder: number;
  lat: number | null;
  lng: number | null;
  address: string | null;
  tripDayId: string;
  placeCacheId: string | null;
};

export type ApiTripDay = {
  id: string;
  date: string;
  dayNumber: number;
  tripId: string;
  scheduleItems: ApiScheduleItem[];
};

export type CreateDayInput = {
  date: string;
  dayNumber: number;
};

export type CreateScheduleItemInput = {
  type: ApiScheduleItem["type"];
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  lat?: number;
  lng?: number;
  address?: string;
};

export function listDays(tripId: string) {
  return apiFetch<ApiTripDay[]>(`/trips/${tripId}/days`);
}

export function createDay(tripId: string, input: CreateDayInput) {
  return apiFetch<ApiTripDay>(`/trips/${tripId}/days`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deleteDay(tripId: string, dayId: string) {
  return apiFetch<void>(`/trips/${tripId}/days/${dayId}`, { method: "DELETE" });
}

export function createScheduleItem(
  tripId: string,
  dayId: string,
  input: CreateScheduleItemInput,
) {
  return apiFetch<ApiScheduleItem>(`/trips/${tripId}/days/${dayId}/items`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deleteScheduleItem(tripId: string, dayId: string, itemId: string) {
  return apiFetch<void>(`/trips/${tripId}/days/${dayId}/items/${itemId}`, {
    method: "DELETE",
  });
}
```

#### Файл `apps/web/src/shared/api/votes.ts`

```typescript
import { apiFetch } from "./client";

export type ApiVoteOption = {
  id: string;
  label: string;
  count: number;
};

export type ApiVote = {
  id: string;
  tripId: string;
  title: string;
  createdAt: string;
  resolvedAt: string | null;
  createdBy: { id: string; name: string; email: string; avatarUrl: string | null };
  options: ApiVoteOption[];
  myAnswer: string | null;
  total: number;
};

export function listVotes(tripId: string) {
  return apiFetch<ApiVote[]>(`/trips/${tripId}/votes`);
}

export function createVote(tripId: string, input: { title: string; options: string[] }) {
  return apiFetch<ApiVote>(`/trips/${tripId}/votes`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function castAnswer(tripId: string, voteId: string, optionId: string) {
  return apiFetch<ApiVote>(`/trips/${tripId}/votes/${voteId}/answer`, {
    method: "POST",
    body: JSON.stringify({ optionId }),
  });
}

export function clearAnswer(tripId: string, voteId: string) {
  return apiFetch<ApiVote>(`/trips/${tripId}/votes/${voteId}/answer`, {
    method: "DELETE",
  });
}
```

#### Файл `apps/web/src/shared/api/expenses.ts`

```typescript
import { apiFetch } from "./client";

export type ApiUserMini = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
};

export type ApiExpenseSplit = {
  id: string;
  amount: number;
  status: string;
  user: ApiUserMini;
};

export type ApiExpense = {
  id: string;
  title: string;
  amount: number;
  category: string;
  currency: string;
  expenseDate: string | null;
  note: string | null;
  createdAt: string;
  tripId: string;
  createdBy: ApiUserMini;
  splits: ApiExpenseSplit[];
};

export type CreateExpenseInput = {
  title: string;
  amount: number;
  payerId: string;
  splitUserIds: string[];
  category?: string;
  expenseDate?: string;
  note?: string;
};

export function listExpenses(tripId: string) {
  return apiFetch<ApiExpense[]>(`/trips/${tripId}/expenses`);
}

export function createExpense(tripId: string, input: CreateExpenseInput) {
  return apiFetch<ApiExpense>(`/trips/${tripId}/expenses`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deleteExpense(tripId: string, id: string) {
  return apiFetch<void>(`/trips/${tripId}/expenses/${id}`, { method: "DELETE" });
}
```

#### Файл `apps/web/src/shared/api/chat.ts`

```typescript
import { apiFetch } from "./client";

export type ApiAuthor = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
};

export type ApiMessage = {
  id: string;
  text: string;
  isBot: boolean;
  createdAt: string;
  tripId: string;
  author: ApiAuthor | null;
};

export type SendResult = {
  messages: ApiMessage[];
  aiError?: string;
};

export function listMessages(tripId: string) {
  return apiFetch<ApiMessage[]>(`/trips/${tripId}/chat/messages`);
}

export function sendMessage(tripId: string, text: string) {
  return apiFetch<SendResult>(`/trips/${tripId}/chat/messages`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export function getAiStatus() {
  return apiFetch<{ enabled: boolean }>("/ai/status");
}

export type AnalysisItem = {
  text: string;
  strong?: boolean;
  conflict?: boolean;
  sources?: number;
};

export type AnalysisSection = {
  key: "directions" | "budget" | "dates" | "interests" | "constraints" | "conflicts";
  title: string;
  items: AnalysisItem[];
};

export type ChatAnalysis = {
  id: string;
  summary: string | null;
  sections: AnalysisSection[];
  createdAt: string;
  messageCount: number;
};

export type ChatSummaryBlock = {
  id: string;
  blockNumber: number;
  fromIndex: number;
  toIndex: number;
  mood: string;
  summary: string;
  topics: string[];
  decisions: string[];
  questions: string[];
  createdAt: string;
};

export function getSummaries(tripId: string) {
  return apiFetch<ChatSummaryBlock[]>(`/trips/${tripId}/chat/summaries`);
}

export type ChatSuggestion = { title: string; text: string; ask: string };

export function getSuggestions(tripId: string) {
  return apiFetch<{ suggestions: ChatSuggestion[] }>(
    `/trips/${tripId}/chat/suggestions`,
    { method: "POST" },
  );
}

export function getAnalysis(tripId: string) {
  return apiFetch<ChatAnalysis | null>(`/trips/${tripId}/chat/analysis`);
}

export function runAnalysis(tripId: string) {
  return apiFetch<ChatAnalysis>(`/trips/${tripId}/chat/analyze`, { method: "POST" });
}
```

### 4. Общий слой: библиотеки (`shared/lib/`)

#### Файл `apps/web/src/shared/lib/auth-context.tsx`

```tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { ApiError } from "@/shared/api/client";
import { getMe, login as apiLogin, logout as apiLogout, register as apiRegister, type AuthUser } from "@/shared/api/auth";

type AuthState =
  | { status: "loading"; user: null }
  | { status: "anon"; user: null }
  | { status: "authed"; user: AuthUser };

type AuthValue = AuthState & {
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (name: string, email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading", user: null });

  useEffect(() => {
    let cancelled = false;
    getMe()
      .then((user) => {
        if (!cancelled) setState({ status: "authed", user });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          setState({ status: "anon", user: null });
        } else {
          setState({ status: "anon", user: null });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user } = await apiLogin({ email, password });
    setState({ status: "authed", user });
    return user;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { user } = await apiRegister({ name, email, password });
    setState({ status: "authed", user });
    return user;
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setState({ status: "anon", user: null });
  }, []);

  const value: AuthValue = { ...state, login, register, logout };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}
```

#### Файл `apps/web/src/shared/lib/format.ts`

```typescript
const RU_MONTHS = [
  "января", "февраля", "марта", "апреля",
  "мая", "июня", "июля", "августа",
  "сентября", "октября", "ноября", "декабря",
];

export function formatTripDates(start: string | null, end: string | null): string {
  if (!start && !end) return "даты не указаны";
  if (start && !end) return `с ${formatRu(new Date(start))}`;
  if (!start && end) return `до ${formatRu(new Date(end))}`;
  return `${formatRu(new Date(start!))} — ${formatRu(new Date(end!))}`;
}

export function tripDayCount(start: string | null, end: string | null): number | null {
  if (!start || !end) return null;
  const a = new Date(start).getTime();
  const b = new Date(end).getTime();
  if (Number.isNaN(a) || Number.isNaN(b) || b < a) return null;
  return Math.round((b - a) / (24 * 60 * 60 * 1000)) + 1;
}

function formatRu(d: Date): string {
  const day = d.getDate();
  const month = RU_MONTHS[d.getMonth()] ?? "";
  return `${day} ${month}`;
}
```

#### Файл `apps/web/src/shared/lib/avatar.ts`

```typescript
export function colorFromId(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) | 0;
  }
  const hue = Math.abs(h) % 360;
  return `oklch(0.74 0.10 ${hue})`;
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  const out = parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
  return out || "?";
}
```

#### Файл `apps/web/src/shared/lib/categories.ts`

```typescript
export type ExpenseCategory =
  | "housing"
  | "food"
  | "transport"
  | "activities"
  | "other";

export const EXPENSE_CATEGORIES: {
  key: ExpenseCategory;
  label: string;
  color: string;
}[] = [
  { key: "housing", label: "Жильё", color: "var(--terracotta)" },
  { key: "food", label: "Еда", color: "var(--moss)" },
  { key: "transport", label: "Транспорт", color: "var(--teal)" },
  { key: "activities", label: "Активности", color: "oklch(0.65 0.10 80)" },
  { key: "other", label: "Другое", color: "var(--ink-3)" },
];

export function categoryMeta(key: string) {
  return (
    EXPENSE_CATEGORIES.find((c) => c.key === key) ?? {
      key: "other" as ExpenseCategory,
      label: "Другое",
      color: "var(--ink-3)",
    }
  );
}
```

#### Файл `apps/web/src/shared/lib/geocode.ts`

```typescript
export type GeoResult = {
  id: string;
  name: string;
  address: string;
  lng: number;
  lat: number;
};

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export function geocodingEnabled(): boolean {
  return typeof TOKEN === "string" && TOKEN.length > 0;
}

type MapboxFeature = {
  id: string;
  text: string;
  place_name: string;
  center: [number, number];
};

export async function geocode(
  query: string,
  opts?: { proximity?: [number, number] },
): Promise<GeoResult[]> {
  if (!geocodingEnabled() || query.trim().length < 2) return [];
  const params = new URLSearchParams({
    access_token: TOKEN,
    limit: "6",
    language: "ru",
  });
  if (opts?.proximity) {
    params.set("proximity", `${opts.proximity[0]},${opts.proximity[1]}`);
  }
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    query.trim(),
  )}.json?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = (await res.json()) as { features?: MapboxFeature[] };
  return (data.features ?? []).map((f) => ({
    id: f.id,
    name: f.text,
    address: f.place_name,
    lng: f.center[0],
    lat: f.center[1],
  }));
}
```

### 5. Общий слой: UI-компоненты (`shared/ui/`)

#### Файл `apps/web/src/shared/ui/Logo.tsx`

```tsx
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <span
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: "var(--ink)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <span
          style={{
            width: size * 0.5,
            height: 2,
            background: "var(--terracotta)",
            transform: "rotate(45deg)",
            position: "absolute",
          }}
        />
        <span
          style={{
            width: 2,
            height: size * 0.5,
            background: "var(--paper)",
            transform: "rotate(45deg)",
            position: "absolute",
          }}
        />
      </span>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: size * 0.7,
          fontStyle: "italic",
          letterSpacing: "-0.02em",
        }}
      >
        journey
      </span>
    </span>
  );
}
```

#### Файл `apps/web/src/shared/ui/LangSwitcher.tsx`

```tsx
import { useT, type Lang } from "@/shared/lib/i18n";

export function LangSwitcher() {
  const { lang, setLang } = useT();
  const langs: Lang[] = ["ru", "en"];
  return (
    <div
      style={{
        display: "inline-flex",
        border: "1px solid var(--line)",
        borderRadius: "var(--r-pill)",
        padding: 3,
        background: "var(--paper)",
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        letterSpacing: "0.06em",
      }}
    >
      {langs.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          style={{
            padding: "5px 11px",
            borderRadius: "var(--r-pill)",
            background: lang === l ? "var(--ink)" : "transparent",
            color: lang === l ? "var(--paper)" : "var(--ink-2)",
            transition: "background 0.15s ease",
            textTransform: "uppercase",
          }}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
```

#### Файл `apps/web/src/shared/ui/UserAvatar.tsx`

```tsx
import { colorFromId, initialsOf } from "@/shared/lib/avatar";

type UserLike = { id: string; name: string; avatarUrl?: string | null };

export function UserAvatar({
  user,
  size = 32,
  ring = true,
}: {
  user: UserLike;
  size?: number;
  ring?: boolean;
}) {
  return (
    <span
      className="avatar"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.36),
        background: colorFromId(user.id),
        color: "oklch(0.20 0.02 60)",
        border: ring ? "2px solid var(--paper)" : "none",
      }}
      title={user.name}
    >
      {initialsOf(user.name)}
    </span>
  );
}

export function UserAvatarStack({
  users,
  max = 5,
  size = 28,
}: {
  users: UserLike[];
  max?: number;
  size?: number;
}) {
  const shown = users.slice(0, max);
  const overflow = users.length - shown.length;
  return (
    <span className="avatar-stack" style={{ alignItems: "center" }}>
      {shown.map((u) => (
        <UserAvatar key={u.id} user={u} size={size} />
      ))}
      {overflow > 0 && (
        <span
          className="avatar"
          style={{
            width: size,
            height: size,
            fontSize: Math.round(size * 0.32),
            background: "var(--paper)",
            color: "var(--ink-2)",
            border: "2px solid var(--paper)",
            fontFamily: "var(--font-mono)",
          }}
        >
          +{overflow}
        </span>
      )}
    </span>
  );
}
```

#### Файл `apps/web/src/shared/ui/Modal.tsx`

```tsx
import { useEffect, type ReactNode } from "react";

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  width = 520,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  width?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "oklch(0.20 0.01 60 / 0.45)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        animation: "fadeIn 0.18s ease both",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card"
        style={{
          width: "100%",
          maxWidth: width,
          background: "var(--paper)",
          padding: 28,
          boxShadow: "var(--shadow-lg)",
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 18,
          }}
        >
          <div>
            <h3 style={{ fontSize: 28, marginBottom: 4 }}>{title}</h3>
            {subtitle && (
              <p style={{ color: "var(--ink-3)", fontSize: 13, margin: 0 }}>{subtitle}</p>
            )}
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
```

### 6. Функциональный блок аутентификации (`features/auth/`)

#### Файл `apps/web/src/features/auth/AuthShell.tsx`

```tsx
import { useState, type CSSProperties, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useT } from "@/shared/lib/i18n";
import { useAuth } from "@/shared/lib/auth-context";
import { ApiError } from "@/shared/api/client";
import { Logo } from "@/shared/ui/Logo";
import { LangSwitcher } from "@/shared/ui/LangSwitcher";

type Mode = "login" | "register";
type FormState = { name: string; email: string; password: string };
type Errors = Partial<Record<keyof FormState, string>>;

const errStyle: CSSProperties = { borderColor: "var(--terracotta)" };

export function AuthShell({ mode }: { mode: Mode }) {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const auth = useAuth();
  const [form, setForm] = useState<FormState>({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const isLogin = mode === "login";

  const validate = (f: FormState): Errors => {
    const e: Errors = {};
    if (!isLogin && !f.name.trim()) e.name = t("auth.err.name");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = t("auth.err.email");
    if (f.password.length < 8) e.password = t("auth.err.pwd");
    return e;
  };

  const set = (k: keyof FormState, v: string) => {
    const next = { ...form, [k]: v };
    setForm(next);
    if (touched[k]) setErrors(validate(next));
    if (serverError) setServerError(null);
  };
  const blur = (k: keyof FormState) => {
    setTouched({ ...touched, [k]: true });
    setErrors(validate(form));
  };
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true });
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    setServerError(null);
    try {
      if (isLogin) {
        await auth.login(form.email, form.password);
      } else {
        await auth.register(form.name, form.email, form.password);
      }
      navigate("/trips");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) setServerError(t("auth.err.taken"));
        else if (err.status === 401) setServerError(t("auth.err.bad"));
        else setServerError(err.message);
      } else if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError("Что-то пошло не так");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    form.password.length >= 8 &&
    (isLogin || form.name.trim().length > 0);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        background: "var(--paper)",
      }}
    >
      <aside
        style={{
          background:
            "linear-gradient(160deg, oklch(0.55 0.10 200) 0%, oklch(0.35 0.06 215) 80%)",
          color: "var(--paper)",
          padding: "48px 56px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Logo size={32} />
          <LangSwitcher />
        </header>
        <div style={{ position: "relative" }}>
          <h2
            style={{
              fontSize: 56,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              fontWeight: 600,
              marginBottom: 24,
            }}
          >
            {lang === "ru" ? (
              <>
                Путешествуйте{" "}
                <span className="display-italic" style={{ color: "var(--terracotta)" }}>
                  вместе
                </span>
              </>
            ) : (
              <>
                Travel{" "}
                <span className="display-italic" style={{ color: "var(--terracotta)" }}>
                  together
                </span>
              </>
            )}
          </h2>
          <p
            style={{
              fontSize: 17,
              lineHeight: 1.55,
              color: "oklch(0.85 0.012 65)",
              maxWidth: 420,
            }}
          >
            {t("auth.hero.d")}
          </p>
        </div>
        <footer
          className="mono"
          style={{ fontSize: 11, color: "oklch(0.65 0.012 65)", letterSpacing: "0.06em" }}
        >
          {t("auth.tagline")}
        </footer>
      </aside>

      <section
        style={{
          padding: "48px 56px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          maxWidth: 520,
          width: "100%",
          margin: "0 auto",
        }}
      >
        <div
          className="mono"
          style={{
            fontSize: 11,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--ink-3)",
            marginBottom: 8,
          }}
        >
          {isLogin ? t("auth.login.eyebrow") : t("auth.register.eyebrow")}
        </div>
        <h1 style={{ fontSize: 40, lineHeight: 1.1, marginBottom: 12, fontWeight: 600 }}>
          {isLogin ? t("auth.login.h") : t("auth.register.h")}
        </h1>
        <p style={{ color: "var(--ink-2)", fontSize: 14, marginBottom: 32 }}>
          {isLogin ? t("auth.login.sub") : t("auth.register.sub")}
        </p>

        <form
          onSubmit={submit}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
          noValidate
        >
          {!isLogin && (
            <Field
              label={t("auth.name")}
              value={form.name}
              onChange={(v) => set("name", v)}
              onBlur={() => blur("name")}
              placeholder={t("auth.name.ph")}
              autoComplete="name"
              error={errors.name}
            />
          )}
          <Field
            label={t("auth.email")}
            type="email"
            value={form.email}
            onChange={(v) => set("email", v)}
            onBlur={() => blur("email")}
            placeholder={t("auth.email.ph")}
            autoComplete="email"
            error={errors.email}
          />
          <Field
            label={t("auth.password")}
            type="password"
            value={form.password}
            onChange={(v) => set("password", v)}
            onBlur={() => blur("password")}
            placeholder={t("auth.password.ph")}
            autoComplete={isLogin ? "current-password" : "new-password"}
            error={errors.password}
          />

          {serverError && <div className="field-error">{serverError}</div>}

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              padding: "12px 18px",
              fontSize: 14,
              opacity: !canSubmit || submitting ? 0.5 : 1,
            }}
            disabled={!canSubmit || submitting}
          >
            {submitting
              ? "..."
              : isLogin
                ? t("auth.login.cta")
                : t("auth.register.cta")}
          </button>
        </form>

        <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 24 }}>
          {isLogin ? (
            <>
              {t("auth.no.acc")}{" "}
              <a href="/register" style={{ color: "var(--terracotta)" }}>
                {t("auth.register.h")}
              </a>
            </>
          ) : (
            <>
              {t("auth.has.acc")}{" "}
              <a href="/login" style={{ color: "var(--terracotta)" }}>
                {t("auth.login.h")}
              </a>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  type = "text",
  autoComplete,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  error?: string;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        className="input"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={error ? errStyle : undefined}
      />
      {error && <div className="field-error">{error}</div>}
    </div>
  );
}
```

### 7. Функциональный блок дашборда (`features/dashboard/`)

#### Файл `apps/web/src/features/dashboard/TripCard.tsx`

```tsx
import type { ApiTrip } from "@/shared/api/trips";
import { UserAvatarStack } from "@/shared/ui/UserAvatar";
import { formatTripDates, tripDayCount } from "@/shared/lib/format";

const TINTS = [
  "linear-gradient(135deg, oklch(0.55 0.10 200), oklch(0.35 0.06 215))",
  "linear-gradient(135deg, oklch(0.62 0.135 40), oklch(0.42 0.12 30))",
  "linear-gradient(135deg, oklch(0.50 0.07 145), oklch(0.35 0.06 160))",
  "linear-gradient(135deg, oklch(0.40 0.04 60), oklch(0.25 0.02 50))",
];

export function TripCard({
  trip,
  index,
  onOpen,
}: {
  trip: ApiTrip;
  index: number;
  onOpen: () => void;
}) {
  const tint = TINTS[index % TINTS.length];
  const dates = formatTripDates(trip.startDate, trip.endDate);
  const days = tripDayCount(trip.startDate, trip.endDate);
  const dest = trip.destinationLabel ?? "направление не указано";
  return (
    <article
      onClick={onOpen}
      className="card"
      style={{
        cursor: "pointer",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      <div style={{ height: 120, background: tint, position: "relative" }}>
        {trip.status === "active" && (
          <span
            style={{
              position: "absolute",
              top: 12,
              left: 14,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "3px 9px",
              borderRadius: 999,
              background: "oklch(1 0 0 / 0.18)",
              backdropFilter: "blur(8px)",
              color: "var(--paper)",
              fontSize: 11,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: "oklch(0.78 0.13 145)",
              }}
            />
            в пути
          </span>
        )}
      </div>
      <div style={{ padding: 18, flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        <div>
          <h3 style={{ fontSize: 19, marginBottom: 4, fontWeight: 600 }}>{trip.title}</h3>
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: 0 }}>
            {dest} · {dates}
          </p>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "auto",
          }}
        >
          <UserAvatarStack users={trip.members.map((m) => m.user)} size={22} max={5} />
          <span style={{ fontSize: 12, color: "var(--ink-3)" }}>
            {days != null ? `${days} дней` : `${trip.members.length} чел`}
          </span>
        </div>
      </div>
    </article>
  );
}

export function NewTripCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: "1.5px dashed var(--line-2)",
        borderRadius: "var(--r-lg)",
        background: "transparent",
        minHeight: 220,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        color: "var(--ink-3)",
        transition: "background 0.15s, border-color 0.15s, color 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--paper-2)";
        e.currentTarget.style.borderColor = "var(--terracotta)";
        e.currentTarget.style.color = "var(--terracotta)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "";
        e.currentTarget.style.borderColor = "";
        e.currentTarget.style.color = "var(--ink-3)";
      }}
    >
      <span style={{ fontSize: 28, fontWeight: 300, lineHeight: 1 }}>+</span>
      <span style={{ fontSize: 14 }}>Новая поездка</span>
    </button>
  );
}
```

#### Файл `apps/web/src/features/dashboard/EmptyState.tsx`

```tsx
import { useT } from "@/shared/lib/i18n";

export function EmptyState({ onCreate }: { onCreate: () => void }) {
  const { t } = useT();
  return (
    <div
      style={{
        padding: "80px 32px",
        textAlign: "center",
        border: "1px dashed var(--line-2)",
        borderRadius: "var(--r-xl)",
        background: "var(--paper-2)",
      }}
    >
      <svg width="120" height="80" viewBox="0 0 120 80" style={{ marginBottom: 24 }}>
        <path
          d="M10 60 L 30 30 L 50 50 L 75 25 L 110 60 L 110 70 L 10 70 Z"
          fill="var(--paper-3)"
          stroke="var(--line-2)"
        />
        <circle cx="90" cy="22" r="8" fill="var(--terracotta)" opacity="0.6" />
        <path
          d="M20 65 Q 50 50 80 60 T 105 60"
          stroke="var(--terracotta)"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="3 3"
        />
      </svg>
      <h3 style={{ fontSize: 32, marginBottom: 8 }}>{t("dash.empty.h")}</h3>
      <p style={{ color: "var(--ink-2)", maxWidth: 420, margin: "0 auto 24px" }}>
        {t("dash.empty.d")}
      </p>
      <button className="btn btn-primary" onClick={onCreate}>
        + {t("nav.create")}
      </button>
    </div>
  );
}
```

#### Файл `apps/web/src/features/dashboard/CreateTripModal.tsx`

```tsx
import { useEffect, useState } from "react";
import { useT } from "@/shared/lib/i18n";
import { Modal } from "@/shared/ui/Modal";

export type NewTripDraft = {
  title: string;
  destinationLabel?: string;
  startDate?: string;
  endDate?: string;
};

type FormState = {
  title: string;
  dest: string;
  dateFrom: string;
  dateTo: string;
};

export function CreateTripModal({
  open,
  onClose,
  onCreate,
  submitting = false,
  error = null,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (draft: NewTripDraft) => void;
  submitting?: boolean;
  error?: string | null;
}) {
  const { t } = useT();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    title: "",
    dest: "",
    dateFrom: "",
    dateTo: "",
  });

  useEffect(() => {
    if (open) {
      setStep(0);
      setForm({ title: "", dest: "", dateFrom: "", dateTo: "" });
    }
  }, [open]);

  const canNext =
    step === 0
      ? form.title.trim().length > 0 && form.dest.trim().length > 0
      : form.dateFrom.length > 0 && form.dateTo.length > 0;

  const submit = () => {
    onCreate({
      title: form.title.trim(),
      destinationLabel: form.dest.trim() || undefined,
      startDate: form.dateFrom || undefined,
      endDate: form.dateTo || undefined,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("dash.create.h")}
      subtitle={t("dash.create.sub")}
      width={560}
    >
      <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
        {[0, 1].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              background: i <= step ? "var(--terracotta)" : "var(--paper-3)",
              borderRadius: 999,
              transition: "background 0.2s",
            }}
          />
        ))}
      </div>

      {step === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label className="label">{t("common.title")}</label>
            <input
              className="input"
              placeholder="Например: Грузия, июнь"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <label className="label">{t("dash.create.dest")}</label>
            <input
              className="input"
              placeholder={t("common.placeholder.dest")}
              value={form.dest}
              onChange={(e) => setForm({ ...form, dest: e.target.value })}
            />
          </div>
          <div>
            <label className="label">
              {t("dash.create.cover")}{" "}
              <span className="mono" style={{ color: "var(--ink-3)", fontSize: 11 }}>
                · {t("dash.create.cover.hint")}
              </span>
            </label>
            <div className="imgph" style={{ height: 120, cursor: "pointer" }}>
              <span className="imgph-label">перетащите фото · или нажмите</span>
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label className="label">{t("common.date")}</label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 24px 1fr",
                gap: 8,
                alignItems: "center",
              }}
            >
              <input
                className="input"
                type="date"
                value={form.dateFrom}
                onChange={(e) => setForm({ ...form, dateFrom: e.target.value })}
              />
              <span style={{ textAlign: "center", color: "var(--ink-3)" }}>→</span>
              <input
                className="input"
                type="date"
                value={form.dateTo}
                onChange={(e) => setForm({ ...form, dateTo: e.target.value })}
              />
            </div>
          </div>
          <div
            style={{
              background: "var(--paper-2)",
              padding: 16,
              borderRadius: "var(--r-md)",
              fontSize: 13,
              color: "var(--ink-2)",
            }}
          >
            Вы будете назначены организатором. Друзей пригласите внутри поездки.
          </div>
          {error && <div className="field-error">{error}</div>}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 28,
          paddingTop: 20,
          borderTop: "1px solid var(--line)",
        }}
      >
        <button
          className="btn btn-ghost"
          onClick={step === 0 ? onClose : () => setStep(0)}
          disabled={submitting}
        >
          {step === 0 ? t("common.cancel") : "← Назад"}
        </button>
        {step === 0 ? (
          <button
            className="btn btn-primary"
            disabled={!canNext}
            onClick={() => setStep(1)}
            style={{ opacity: canNext ? 1 : 0.4 }}
          >
            Дальше →
          </button>
        ) : (
          <button
            className="btn btn-primary"
            disabled={!canNext || submitting}
            onClick={submit}
            style={{ opacity: !canNext || submitting ? 0.4 : 1 }}
          >
            {submitting ? "..." : t("dash.create.cta")}
          </button>
        )}
      </div>
    </Modal>
  );
}
```

### 8. Функциональный блок поездки (`features/trip/`)

#### Файл `apps/web/src/features/trip/TabHeader.tsx`

```tsx
import type { ReactNode } from "react";

export function TabHeader({
  eyebrow,
  title,
  italic,
  action,
}: {
  eyebrow: string;
  title: string;
  italic: string;
  action?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        flexWrap: "wrap",
        gap: 16,
        paddingBottom: 16,
        borderBottom: "1px solid var(--line)",
      }}
    >
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1 style={{ fontSize: 56, marginTop: 8, lineHeight: 1.0 }}>
          {title}{" "}
          <span className="display-italic" style={{ color: "var(--terracotta)" }}>
            {italic}
          </span>
        </h1>
      </div>
      {action}
    </div>
  );
}
```

#### Файл `apps/web/src/features/trip/MapboxMap.tsx`

```tsx
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export type MapMarker = {
  id: string;
  lng: number;
  lat: number;
  color: string;
  label?: string | number;
};

export function MapboxMap({
  token,
  center = [44.78, 42.0],
  zoom = 6,
  markers = [],
  style = "mapbox://styles/mapbox/outdoors-v12",
}: {
  token: string;
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  style?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRefs = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;
    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style,
      center,
      zoom,
    });
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");
    map.addControl(new mapboxgl.AttributionControl({ compact: true }));
    mapRef.current = map;
    return () => {
      markerRefs.current.forEach((m) => m.remove());
      markerRefs.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [token, style]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markerRefs.current.forEach((m) => m.remove());
    markerRefs.current = markers.map((m) => {
      const el = document.createElement("div");
      el.style.cssText = `
        width: 20px; height: 20px; border-radius: 50%;
        background: ${m.color}; border: 2px solid var(--paper, white);
        box-shadow: 0 1px 3px oklch(0 0 0 / 0.3);
        display: flex; align-items: center; justify-content: center;
        font-family: var(--font-mono, monospace); font-size: 9px; font-weight: 700;
        color: var(--paper, white);
      `;
      if (m.label !== undefined) el.textContent = String(m.label);
      return new mapboxgl.Marker({ element: el })
        .setLngLat([m.lng, m.lat])
        .addTo(map);
    });
  }, [markers]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "var(--r-lg)",
        overflow: "hidden",
      }}
    />
  );
}
```

#### Файл `apps/web/src/features/trip/ChatTab.tsx` (часть 1: основной компонент, рендер сообщений и поле ввода)

```tsx
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/shared/lib/auth-context";
import { UserAvatar, UserAvatarStack } from "@/shared/ui/UserAvatar";
import {
  getSuggestions,
  getSummaries,
  listMessages,
  sendMessage,
  type ApiAuthor,
  type ApiMessage,
} from "@/shared/api/chat";
import { getTrip } from "@/shared/api/trips";

const iconBtn: CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 999,
  background: "transparent",
  border: "none",
  color: "var(--ink-2)",
  fontSize: 16,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

const GUIDE_RE = /@гид(?![а-яА-ЯёЁ])/i;

export function ChatTab({ tripId }: { tripId: string }) {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const messagesKey = ["trips", tripId, "messages"] as const;

  const messagesQuery = useQuery({
    queryKey: messagesKey,
    queryFn: () => listMessages(tripId),
  });
  const tripQuery = useQuery({
    queryKey: ["trips", tripId] as const,
    queryFn: () => getTrip(tripId),
  });

  const messages = useMemo(
    () => messagesQuery.data ?? [],
    [messagesQuery.data],
  );
  const tripMembers = tripQuery.data?.members ?? [];

  const [input, setInput] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [railOpen, setRailOpen] = useState(false);
  const [transientError, setTransientError] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, thinking]);

  const sendMutation = useMutation({
    mutationFn: (text: string) => sendMessage(tripId, text),
    onSuccess: (result) => {
      queryClient.setQueryData<ApiMessage[]>(messagesKey, (prev) =>
        prev ? [...prev, ...result.messages] : result.messages,
      );
      if (result.aiError) {
        setTransientError(result.aiError);
        setTimeout(() => setTransientError(null), 6000);
      }
    },
    onError: (err: unknown) => {
      setTransientError(err instanceof Error ? err.message : "Не удалось отправить сообщение");
    },
    onSettled: () => setThinking(false),
  });

  const send = async () => {
    const txt = input.trim();
    if (!txt || sendMutation.isPending) return;
    setInput("");
    setTransientError(null);
    if (GUIDE_RE.test(txt)) setThinking(true);
    sendMutation.mutate(txt);
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  const onChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setInput(v);
    setShowMentions(v.endsWith("@"));
  };

  const insertMention = (handle: string) => {
    setInput((prev) => prev.replace(/@$/, "@" + handle + " "));
    setShowMentions(false);
  };

  type Entry = ApiMessage | { divider: string; id: string };
  const grouped: Entry[] = [];
  let lastDate: string | null = null;
  for (const m of messages) {
    const label = dateLabel(m.createdAt);
    if (label !== lastDate) {
      grouped.push({ divider: label, id: `div-${label}-${m.id}` });
      lastDate = label;
    }
    grouped.push(m);
  }

  const myId = auth.user?.id;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 64px)",
        margin: "-32px -40px",
        background: "var(--paper-2)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 24px",
          background: "var(--paper)",
          borderBottom: "1px solid var(--line)",
          flexShrink: 0,
          zIndex: 2,
        }}
      >
        <span
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--terracotta), oklch(0.50 0.10 30))",
            color: "var(--paper)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-display)",
            fontSize: 16,
            fontStyle: "italic",
            flexShrink: 0,
          }}
        >
          {(tripQuery.data?.title?.slice(0, 2) ?? "Гр").trim()}
        </span>
        <div style={{ flex: 1, minWidth: 0, lineHeight: 1.2 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>
            {tripQuery.data?.title ?? "Чат поездки"}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--ink-3)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>{tripMembers.length} участников</span>
            <span style={{ width: 3, height: 3, borderRadius: 999, background: "var(--ink-3)" }} />
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: "oklch(0.70 0.15 145)" }} />
              @гид онлайн
            </span>
          </div>
        </div>
        <UserAvatarStack users={tripMembers.map((m) => m.user)} size={24} max={5} />
        {!railOpen && (
          <button onClick={() => setRailOpen(true)} title="Контекст гида" style={iconBtn}>
            ☰
          </button>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: railOpen ? "minmax(0, 1fr) 300px" : "minmax(0, 1fr)",
          flex: 1,
          minHeight: 0,
          transition: "grid-template-columns 0.25s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            overflow: "hidden",
            background: "var(--paper-2)",
          }}
        >
          <div
            ref={listRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px 24px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {messagesQuery.isLoading && (
              <div className="mono" style={{ textAlign: "center", color: "var(--ink-3)", padding: 24 }}>
                загрузка истории…
              </div>
            )}

            {messagesQuery.isSuccess && messages.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 24px", color: "var(--ink-3)", fontSize: 13 }}>
                Чат пустой. Напишите первое сообщение или попросите{" "}
                <span style={{ color: "var(--terracotta)", fontFamily: "var(--font-mono)" }}>@гид</span>{" "}
                подсказать что-нибудь.
              </div>
            )}

            {grouped.map((entry) =>
              "divider" in entry ? (
                <div key={entry.id} style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0" }}>
                  <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
                  <span
                    className="mono"
                    style={{
                      fontSize: 10,
                      color: "var(--ink-3)",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    {entry.divider}
                  </span>
                  <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
                </div>
              ) : (
                <Message key={entry.id} m={entry} isMe={Boolean(myId) && entry.author?.id === myId} />
              ),
            )}
            {thinking && <BotThinking />}
            {transientError && (
              <div
                className="field-error"
                style={{
                  textAlign: "center",
                  padding: "8px 12px",
                  background: "oklch(from var(--terracotta) l c h / 0.08)",
                  borderRadius: "var(--r-md)",
                }}
              >
                {transientError}
              </div>
            )}
          </div>

          <div
            style={{
              borderTop: "1px solid var(--line)",
              padding: "10px 16px",
              position: "relative",
              background: "var(--paper)",
            }}
          >
            {showMentions && (
              <MentionPopup
                tripMembers={tripMembers.map((m) => m.user)}
                onPick={insertMention}
              />
            )}
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              {auth.user && <UserAvatar user={auth.user} size={32} ring={false} />}
              <div style={{ flex: 1, position: "relative" }}>
                <textarea
                  value={input}
                  onChange={onChange}
                  onKeyDown={onKey}
                  placeholder="Напишите сообщение или @гид для подсказки…"
                  rows={1}
                  disabled={sendMutation.isPending}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    paddingRight: 90,
                    border: "1px solid var(--line)",
                    borderRadius: "var(--r-md)",
                    resize: "none",
                    fontSize: 14,
                    background: "var(--paper-2)",
                    color: "var(--ink)",
                    minHeight: 44,
                    maxHeight: 140,
                    lineHeight: 1.5,
                    opacity: sendMutation.isPending ? 0.6 : 1,
                  }}
                />
                <div style={{ position: "absolute", right: 10, bottom: 8, display: "flex", gap: 4 }}>
                  <button
                    onClick={() => {
                      setInput((prev) => prev + "@гид ");
                      setShowMentions(false);
                    }}
                    title="Спросить гида"
                    style={{
                      padding: "5px 10px",
                      borderRadius: 999,
                      background: "oklch(from var(--terracotta) l c h / 0.15)",
                      color: "var(--terracotta)",
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      letterSpacing: "0.04em",
                    }}
                  >
                    @гид
                  </button>
                </div>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => void send()}
                disabled={sendMutation.isPending || !input.trim()}
                style={{
                  padding: "10px 16px",
                  opacity: !input.trim() || sendMutation.isPending ? 0.4 : 1,
                }}
              >
                {sendMutation.isPending ? "…" : "Отправить"}
              </button>
            </div>
            <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 8 }}>
              ↵ отправить · shift+↵ перенос строки · @гид помнит контекст последних сообщений и поездки
            </div>
          </div>
        </div>

        {railOpen && (
          <ContextRail
            tripId={tripId}
            messages={messages}
            onClose={() => setRailOpen(false)}
            onAsk={(text) => setInput(text)}
          />
        )}
      </div>
    </div>
  );
}
```

#### Файл `apps/web/src/features/trip/ChatTab.tsx` (часть 2: вспомогательные компоненты — сообщения, разбор Markdown, боковая панель «Память/Идеи»)

```tsx
function MentionPopup({
  tripMembers,
  onPick,
}: {
  tripMembers: ApiAuthor[];
  onPick: (handle: string) => void;
}) {
  const items: { id: string; handle: string; sub: string }[] = [
    { id: "bot", handle: "гид", sub: "AI-помощник · решения, места, бюджет" },
    ...tripMembers.map((u) => ({ id: u.id, handle: u.name.split(/\s+/)[0] ?? u.name, sub: "" })),
  ];
  return (
    <div
      style={{
        position: "absolute",
        bottom: "calc(100% - 4px)",
        left: 16,
        background: "var(--paper)",
        border: "1px solid var(--line)",
        borderRadius: "var(--r-md)",
        boxShadow: "var(--shadow-md)",
        overflow: "hidden",
        minWidth: 220,
        zIndex: 5,
      }}
    >
      <div className="eyebrow" style={{ padding: "8px 12px", borderBottom: "1px solid var(--line)" }}>
        упомянуть
      </div>
      {items.map((o) => (
        <button
          key={o.id}
          onClick={() => onPick(o.handle)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 12px",
            width: "100%",
            textAlign: "left",
            transition: "background 0.12s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--paper-2)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          {o.id === "bot" ? (
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: 8,
                background: "var(--terracotta)",
                color: "var(--paper)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              Г
            </span>
          ) : (
            <UserAvatar user={{ id: o.id, name: o.handle, avatarUrl: null }} size={26} ring={false} />
          )}
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>@{o.handle}</div>
            {o.sub && <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{o.sub}</div>}
          </div>
        </button>
      ))}
    </div>
  );
}

function Message({ m, isMe }: { m: ApiMessage; isMe: boolean }) {
  const time = timeOf(m.createdAt);

  if (m.isBot) {
    return (
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
          padding: 16,
          background: "linear-gradient(180deg, oklch(from var(--terracotta) l c h / 0.06), transparent)",
          borderRadius: "var(--r-md)",
          border: "1px solid oklch(from var(--terracotta) l c h / 0.18)",
        }}
      >
        <BotAvatar />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Гид</span>
            <span className="badge" style={{ color: "var(--terracotta)", padding: "2px 8px", fontSize: 9 }}>
              <span className="dot" />
              AI
            </span>
            <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{time}</span>
          </div>
          <BotMessage text={m.text} />
        </div>
      </div>
    );
  }

  const authorName = m.author?.name ?? "?";
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "flex-end",
        flexDirection: isMe ? "row-reverse" : "row",
      }}
    >
      {!isMe && m.author && <UserAvatar user={m.author} size={28} ring={false} />}
      {isMe && <span style={{ width: 28 }} />}
      <div
        style={{
          maxWidth: "70%",
          padding: "6px 12px",
          background: isMe ? "var(--terracotta)" : "var(--paper)",
          color: isMe ? "var(--paper)" : "var(--ink)",
          borderRadius: 14,
          borderBottomRightRadius: isMe ? 4 : 14,
          borderBottomLeftRadius: isMe ? 14 : 4,
          fontSize: 14,
          lineHeight: 1.4,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          boxShadow: "0 1px 1px oklch(0.18 0.02 30 / 0.06)",
          border: isMe ? "none" : "1px solid var(--line)",
        }}
      >
        {!isMe && (
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--terracotta)", marginBottom: 1 }}>
            {authorName}
          </div>
        )}
        <span>{renderInlineMentions(m.text)}</span>
        <span
          className="mono"
          style={{
            fontSize: 10,
            color: isMe ? "oklch(1 0 0 / 0.7)" : "var(--ink-3)",
            marginLeft: 8,
            float: "right",
            marginTop: 4,
          }}
        >
          {time}
        </span>
      </div>
    </div>
  );
}

function BotAvatar() {
  return (
    <span
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        background: "var(--terracotta)",
        color: "var(--paper)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M16 9 L13 12 L16 15 M8 9 L11 12 L8 15"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function BotThinking() {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "8px 16px" }}>
      <BotAvatar />
      <div
        style={{
          display: "flex",
          gap: 4,
          padding: "10px 14px",
          background: "var(--paper-2)",
          borderRadius: "var(--r-md)",
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--terracotta)",
              animation: `chat-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
              display: "inline-block",
            }}
          />
        ))}
      </div>
      <style>{`@keyframes chat-bounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-4px); opacity: 1; } }`}</style>
    </div>
  );
}

function BotMessage({ text }: { text: string }) {
  const blocks = parseBlocks(text);
  return (
    <div style={{ fontSize: 14, lineHeight: 1.55, color: "var(--ink)" }}>
      {blocks.map((b, i) => {
        if (b.type === "list") {
          return (
            <ul
              key={i}
              style={{
                margin: "6px 0",
                paddingLeft: 18,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {b.items.map((it, j) => (
                <li key={j}>{renderBold(it)}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} style={{ margin: "6px 0" }}>
            {renderBold(b.text)}
          </p>
        );
      })}
    </div>
  );
}

type Block = { type: "para"; text: string } | { type: "list"; items: string[] };

function parseBlocks(text: string): Block[] {
  const lines = text.split("\n");
  const blocks: Block[] = [];
  let buf: string[] = [];
  let listBuf: string[] = [];
  const flushBuf = () => {
    if (buf.length) {
      blocks.push({ type: "para", text: buf.join(" ") });
      buf = [];
    }
  };
  const flushList = () => {
    if (listBuf.length) {
      blocks.push({ type: "list", items: listBuf });
      listBuf = [];
    }
  };
  for (const line of lines) {
    const tr = line.trim();
    if (tr.startsWith("- ")) {
      flushBuf();
      listBuf.push(tr.slice(2));
      continue;
    }
    flushList();
    if (tr === "") {
      flushBuf();
      continue;
    }
    buf.push(tr);
  }
  flushBuf();
  flushList();
  return blocks;
}

function renderBold(s: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let rest = s;
  let key = 0;
  while (rest.length) {
    const m = rest.match(/\*\*([^*]+)\*\*/);
    if (!m || m.index === undefined) {
      parts.push(<span key={key++}>{rest}</span>);
      break;
    }
    parts.push(<span key={key++}>{rest.slice(0, m.index)}</span>);
    parts.push(
      <strong key={key++} style={{ color: "var(--ink)", fontWeight: 600 }}>
        {m[1]}
      </strong>,
    );
    rest = rest.slice(m.index + m[0].length);
  }
  return parts;
}

function renderInlineMentions(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let rest = text;
  let key = 0;
  while (rest.length) {
    const m = rest.match(/@([\wа-яА-ЯёЁ]+)/u);
    if (!m || m.index === undefined) {
      parts.push(<span key={key++}>{rest}</span>);
      break;
    }
    parts.push(<span key={key++}>{rest.slice(0, m.index)}</span>);
    const isBot = /гид/i.test(m[1] ?? "");
    parts.push(
      <span
        key={key++}
        style={{
          color: isBot ? "var(--terracotta)" : "oklch(0.78 0.04 220)",
          fontWeight: 500,
          background: isBot
            ? "oklch(from var(--terracotta) l c h / 0.18)"
            : "oklch(0.78 0.04 220 / 0.2)",
          padding: "1px 6px",
          borderRadius: 999,
          fontSize: "0.92em",
        }}
      >
        @{m[1]}
      </span>,
    );
    rest = rest.slice(m.index + m[0].length);
  }
  return parts;
}

function ContextRail({
  tripId,
  messages,
  onClose,
  onAsk,
}: {
  tripId: string;
  messages: ApiMessage[];
  onClose: () => void;
  onAsk: (text: string) => void;
}) {
  const pinned = messages.filter((m) => m.isBot).slice(-1);
  const summariesQuery = useQuery({
    queryKey: ["trips", tripId, "summaries"] as const,
    queryFn: () => getSummaries(tripId),
  });
  const summaries = summariesQuery.data ?? [];
  const suggestionsQuery = useQuery({
    queryKey: ["trips", tripId, "suggestions"] as const,
    queryFn: () => getSuggestions(tripId),
    staleTime: Infinity,
  });
  const suggestions = suggestionsQuery.data?.suggestions ?? [];
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        minHeight: 0,
        overflow: "auto",
        position: "relative",
        padding: "12px 16px 16px",
      }}
    >
      <button
        onClick={onClose}
        title="Скрыть"
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 2,
          width: 24,
          height: 24,
          borderRadius: 999,
          background: "var(--paper-2)",
          border: "1px solid var(--line)",
          color: "var(--ink-2)",
          fontSize: 14,
        }}
      >
        ×
      </button>
      <div
        className="card"
        style={{ padding: 16, background: "var(--ink)", color: "var(--paper)", border: "none" }}
      >
        <div className="eyebrow" style={{ color: "oklch(0.65 0.012 65)", marginBottom: 10 }}>
          что знает гид
        </div>
        <ul
          style={{
            margin: 0,
            paddingLeft: 16,
            fontSize: 12,
            lineHeight: 1.6,
            color: "oklch(0.85 0.012 65)",
          }}
        >
          <li>состав группы и роли</li>
          <li>маршрут (дни, время, пункты)</li>
          <li>бюджет и кто за что платил</li>
          <li>сжатую память всего чата + последние сообщения</li>
        </ul>
      </div>

      <div className="card" style={{ padding: 16 }}>
        <div
          className="eyebrow"
          style={{ marginBottom: 10, display: "flex", justifyContent: "space-between" }}
        >
          <span>память чата</span>
          <span style={{ color: "var(--ink-3)" }}>{summaries.length} бл.</span>
        </div>
        {summaries.length === 0 ? (
          <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.5 }}>
            копится автоматически: каждые 100 сообщений гид сжимает блок чата
            в краткую сводку по настроению и договорённостям
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 300, overflow: "auto" }}>
            {summaries.map((s) => (
              <div
                key={s.id}
                style={{ paddingBottom: 10, borderBottom: "1px dashed var(--line)" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: 4,
                  }}
                >
                  <span className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>
                    блок {s.blockNumber} · {s.fromIndex + 1}–{s.toIndex}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "var(--terracotta)", fontWeight: 500, marginBottom: 4 }}>
                  {s.mood}
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.45 }}>
                  {s.summary}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ padding: 16 }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>
          последняя идея от гида
        </div>
        {pinned.length > 0 ? (
          <div
            style={{
              fontSize: 12,
              lineHeight: 1.5,
              color: "var(--ink-2)",
              maxHeight: 240,
              overflow: "auto",
            }}
          >
            {pinned[0]!.text.slice(0, 400)}
            {pinned[0]!.text.length > 400 && "…"}
          </div>
        ) : (
          <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>пока нет</div>
        )}
      </div>

      <div className="card" style={{ padding: 16 }}>
        <div
          className="eyebrow"
          style={{
            marginBottom: 10,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>идеи от гида</span>
          <button
            onClick={() => suggestionsQuery.refetch()}
            disabled={suggestionsQuery.isFetching}
            title="Обновить подсказки"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--terracotta)",
              padding: "2px 6px",
            }}
          >
            {suggestionsQuery.isFetching ? "…" : "↻"}
          </button>
        </div>

        {suggestionsQuery.isLoading && (
          <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
            гид подбирает идеи…
          </div>
        )}

        {suggestionsQuery.isError && (
          <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
            не удалось получить подсказки
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => onAsk(s.ask)}
              title="Спросить гида об этом"
              style={{
                padding: "10px 12px",
                borderRadius: "var(--r-md)",
                background: "var(--paper-2)",
                border: "1px solid var(--line)",
                textAlign: "left",
                lineHeight: 1.4,
                transition: "border-color 0.12s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--terracotta)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--line)")}
            >
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)", marginBottom: 3 }}>
                {s.title}
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-2)", marginBottom: 6 }}>
                {s.text}
              </div>
              <div className="mono" style={{ fontSize: 10, color: "var(--terracotta)" }}>
                спросить →
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function timeOf(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function dateLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) return "сегодня";
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  const isYesterday =
    d.getFullYear() === y.getFullYear() &&
    d.getMonth() === y.getMonth() &&
    d.getDate() === y.getDate();
  if (isYesterday) return "вчера";
  const months = ["янв","фев","мар","апр","мая","июн","июл","авг","сен","окт","ноя","дек"];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}
```

---

*Конец листинга. Перечислены ключевые модули программного продукта: декларативная схема БД (17 моделей Prisma), все девять серверных модулей NestJS (контроллеры, сервисы, DTO, защита маршрутов) и клиентская часть (каркас, маршрутизация, страницы, API-клиенты, общий слой, функциональные блоки аутентификации, дашборда и вкладок поездки — включая центральный компонент чата с ИИ-ассистентом). Остальные вкладки страницы поездки (`SummaryTab`, `MapTab`, `ItineraryTab`, `VotesTab`, `BudgetTab`, `MembersTab`, `FinalTab`, `AddExpenseModal`) построены по той же архитектурной схеме: `useQuery` для чтения, `useMutation` для записи, проверка членства на сервере через `TripsService.assertMember`.*

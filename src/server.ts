import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { convertHoursStringToMinutes } from "./utils/convert-hours-string-to-minutes";
import { convertMinutesToHoursString } from "./utils/convert-minutes-to-hours-string";

const app = express();
app.use(express.json());
app.use(cors());

const prisma = new PrismaClient();

app.get("/games", async (req, res) => {
  const games = await prisma.game.findMany({
    include: {
      _count: {
        select: {
          Ad: true,
        },
      },
    },
  });
  return res.json(games);
});

app.get("/games/:id/ads", async (req, res) => {
  const gameId = req.params.id;
  const ads = await prisma.ad.findMany({
    select: {
      game: true,
      name: true,
      hoursStart: true,
      hoursEnd: true,
      weekDays: true,
      yearsPlaying: true,
      id: true,
      useVoiceChannel: true,
    },
    where: { gameId },
    orderBy: { createdAt: "desc" },
  });
  return res.json(
    ads.map((ad) => {
      return {
        ...ad,
        weekDays: ad.weekDays.split(","),
        hoursEnd: convertMinutesToHoursString(ad.hoursEnd),
        hoursStart: convertMinutesToHoursString(ad.hoursStart),
      };
    })
  );
});

app.get("ads/:id/discord", async (req, res) => {
  const id = req.params.id;
  const ad = await prisma.ad.findUniqueOrThrow({
    where: { id: id },
    select: { discord: true },
  });

  return res.json({
    discord: ad.discord,
  });
});

app.post("games/:id/ads", async (req, res) => {
  const gameId = req.params.id;
  const body: any = req.body;

  const ad = await prisma.ad.create({
    data: {
      gameId,
      name: body.name,
      yearsPlaying: body.yearsPlaying,
      discord: body.discord,
      weekDays: body.weekDays,
      hoursStart: convertHoursStringToMinutes(body.hoursStart),
      hoursEnd: convertHoursStringToMinutes(body.hoursEnd),
      useVoiceChannel: body.useVoiceChannel,
    },
  });
  return res.status(201).json(ad);
});

app.listen(3333);

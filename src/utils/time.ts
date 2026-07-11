import { DayOfWeek } from "@prisma/client";
import { ApiError } from "../core/ApiError";

const weekdayMap: Record<string, DayOfWeek> = {
  Saturday: DayOfWeek.SATURDAY,
  Sunday: DayOfWeek.SUNDAY,
  Monday: DayOfWeek.MONDAY,
  Tuesday: DayOfWeek.TUESDAY,
  Wednesday: DayOfWeek.WEDNESDAY,
  Thursday: DayOfWeek.THURSDAY,
  Friday: DayOfWeek.FRIDAY
};

export const timeToMinutes = (time: string): number => {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    throw new ApiError(400, `Invalid time value: ${time}. Use HH:mm.`);
  }
  const [hours, minutes] = time.split(":").map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
};

export const localScheduleParts = (date: Date, timeZone: string) => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  });

  const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
  const day = weekdayMap[parts.weekday ?? ""];

  if (!day) {
    throw new ApiError(400, `Unsupported timezone or weekday for ${timeZone}`);
  }

  const minutes = Number(parts.hour) * 60 + Number(parts.minute);
  return { day, minutes };
};

export type AvailabilitySlotInput = {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  isAvailable?: boolean;
};

export const assertValidAvailability = (slots: AvailabilitySlotInput[]): void => {
  const byDay = new Map<DayOfWeek, Array<{ start: number; end: number }>>();

  for (const slot of slots) {
    const start = timeToMinutes(slot.startTime);
    const end = timeToMinutes(slot.endTime);
    if (start >= end) {
      throw new ApiError(400, `${slot.dayOfWeek}: endTime must be later than startTime`);
    }

    const daySlots = byDay.get(slot.dayOfWeek) ?? [];
    if (daySlots.some((existing) => start < existing.end && end > existing.start)) {
      throw new ApiError(400, `${slot.dayOfWeek}: availability slots cannot overlap`);
    }
    daySlots.push({ start, end });
    byDay.set(slot.dayOfWeek, daySlots);
  }
};

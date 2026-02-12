import { z } from 'zod';

// Match status constants
export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  FINISHED: 'finished',
};

// Query schema for listing matches
export const listMatchesQuerySchema = z.object({
  limit: z
    .coerce.number()
    .int()
    .positive()
    .max(100)
    .optional(),
});

// Params schema for matchId
export const matchIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// Create match schema
export const createMatchSchema = z
  .object({
    sport: z.string().min(1, { message: 'sport is required' }),
    homeTeam: z.string().min(1, { message: 'homeTeam is required' }),
    awayTeam: z.string().min(1, { message: 'awayTeam is required' }),
    startTime: z.iso.datetime(),
    endTime: z.iso.datetime(),
    homeScore: z.coerce.number().int().min(0).optional(),
    awayScore: z.coerce.number().int().min(0).optional(),
  })
  .superRefine((data, ctx) => {
    const start = Date.parse(data.startTime);
    const end = Date.parse(data.endTime);
    if (Number.isNaN(start)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'startTime must be a valid ISO date' });
    }
    if (Number.isNaN(end)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'endTime must be a valid ISO date' });
    }
    if (!Number.isNaN(start) && !Number.isNaN(end) && end <= start) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'endTime must be after startTime' });
    }
  });

// Update score schema
export const updateScoreSchema = z.object({
  homeScore: z.coerce.number().int().min(0),
  awayScore: z.coerce.number().int().min(0),
});

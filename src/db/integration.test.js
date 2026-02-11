import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';

// These tests require a real database connection
// They can be skipped in CI by setting SKIP_INTEGRATION_TESTS=true or if DATABASE_URL is not set
const shouldSkip = process.env.SKIP_INTEGRATION_TESTS === 'true' || !process.env.DATABASE_URL;

// Conditionally import to avoid errors when DATABASE_URL is not set
let db, pool, matches, commentary, matchStatusEnum, eq, and;

if (!shouldSkip) {
  const dbModule = await import('./db.js');
  const schemaModule = await import('./schema.js');
  const drizzleORM = await import('drizzle-orm');

  db = dbModule.db;
  pool = dbModule.pool;
  matches = schemaModule.matches;
  commentary = schemaModule.commentary;
  matchStatusEnum = schemaModule.matchStatusEnum;
  eq = drizzleORM.eq;
  and = drizzleORM.and;
}

describe.skipIf(shouldSkip)('Database Integration Tests', () => {
  let testMatchId;

  beforeAll(async () => {
    // Ensure we have a database connection
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL must be set for integration tests');
    }
  });

  afterAll(async () => {
    // Clean up database connection
    if (pool) {
      await pool.end();
    }
  });

  describe('matches table operations', () => {
    it('should insert a new match with default values', async () => {
      const result = await db
        .insert(matches)
        .values({
          sport: 'football',
          homeTeam: 'Team A',
          awayTeam: 'Team B',
          startTime: new Date('2026-03-01T15:00:00Z'),
        })
        .returning();

      expect(result).toHaveLength(1);
      const match = result[0];

      expect(match.id).toBeDefined();
      expect(match.sport).toBe('football');
      expect(match.homeTeam).toBe('Team A');
      expect(match.awayTeam).toBe('Team B');
      expect(match.status).toBe('scheduled');
      expect(match.homeScore).toBe(0);
      expect(match.awayScore).toBe(0);
      expect(match.createdAt).toBeDefined();

      testMatchId = match.id;

      // Clean up
      await db.delete(matches).where(eq(matches.id, match.id));
    });

    it('should insert a match with all fields specified', async () => {
      const startTime = new Date('2026-03-01T15:00:00Z');
      const endTime = new Date('2026-03-01T17:00:00Z');

      const result = await db
        .insert(matches)
        .values({
          sport: 'basketball',
          homeTeam: 'Lakers',
          awayTeam: 'Warriors',
          status: 'live',
          startTime,
          endTime,
          homeScore: 85,
          awayScore: 92,
        })
        .returning();

      expect(result).toHaveLength(1);
      const match = result[0];

      expect(match.sport).toBe('basketball');
      expect(match.homeTeam).toBe('Lakers');
      expect(match.awayTeam).toBe('Warriors');
      expect(match.status).toBe('live');
      expect(match.homeScore).toBe(85);
      expect(match.awayScore).toBe(92);
      expect(match.endTime).toBeDefined();

      // Clean up
      await db.delete(matches).where(eq(matches.id, match.id));
    });

    it('should update match status and score', async () => {
      // Create a match
      const [match] = await db
        .insert(matches)
        .values({
          sport: 'football',
          homeTeam: 'Team A',
          awayTeam: 'Team B',
          startTime: new Date(),
        })
        .returning();

      // Update the match
      const [updated] = await db
        .update(matches)
        .set({ status: 'finished', homeScore: 3, awayScore: 2 })
        .where(eq(matches.id, match.id))
        .returning();

      expect(updated.status).toBe('finished');
      expect(updated.homeScore).toBe(3);
      expect(updated.awayScore).toBe(2);

      // Clean up
      await db.delete(matches).where(eq(matches.id, match.id));
    });

    it('should delete a match', async () => {
      // Create a match
      const [match] = await db
        .insert(matches)
        .values({
          sport: 'football',
          homeTeam: 'Team A',
          awayTeam: 'Team B',
          startTime: new Date(),
        })
        .returning();

      // Delete the match
      await db.delete(matches).where(eq(matches.id, match.id));

      // Verify it's deleted
      const found = await db
        .select()
        .from(matches)
        .where(eq(matches.id, match.id));

      expect(found).toHaveLength(0);
    });

    it('should query matches by status', async () => {
      // Create multiple matches
      const [match1] = await db
        .insert(matches)
        .values({
          sport: 'football',
          homeTeam: 'Team A',
          awayTeam: 'Team B',
          status: 'scheduled',
          startTime: new Date(),
        })
        .returning();

      const [match2] = await db
        .insert(matches)
        .values({
          sport: 'football',
          homeTeam: 'Team C',
          awayTeam: 'Team D',
          status: 'live',
          startTime: new Date(),
        })
        .returning();

      // Query scheduled matches
      const scheduled = await db
        .select()
        .from(matches)
        .where(eq(matches.status, 'scheduled'));

      expect(scheduled.length).toBeGreaterThan(0);
      expect(scheduled.some((m) => m.id === match1.id)).toBe(true);

      // Clean up
      await db.delete(matches).where(eq(matches.id, match1.id));
      await db.delete(matches).where(eq(matches.id, match2.id));
    });
  });

  describe('commentary table operations', () => {
    let matchId;

    beforeEach(async () => {
      // Create a match for commentary tests
      const [match] = await db
        .insert(matches)
        .values({
          sport: 'football',
          homeTeam: 'Team A',
          awayTeam: 'Team B',
          startTime: new Date(),
        })
        .returning();
      matchId = match.id;
    });

    afterAll(async () => {
      // Clean up all test matches (and cascade will clean commentary)
      await db.delete(matches).where(eq(matches.sport, 'football'));
    });

    it('should insert commentary with minimal fields', async () => {
      const result = await db
        .insert(commentary)
        .values({
          matchId,
        })
        .returning();

      expect(result).toHaveLength(1);
      const comment = result[0];

      expect(comment.id).toBeDefined();
      expect(comment.matchId).toBe(matchId);
      expect(comment.createdAt).toBeDefined();

      // Clean up
      await db.delete(commentary).where(eq(commentary.id, comment.id));
    });

    it('should insert commentary with all fields', async () => {
      const metadata = { playerId: 123, videoTimestamp: 45.5 };
      const tags = ['goal', 'highlight'];

      const result = await db
        .insert(commentary)
        .values({
          matchId,
          minute: 23,
          sequence: 1,
          period: 'first_half',
          eventType: 'goal',
          actor: 'Player Name',
          team: 'Team A',
          message: 'Goal scored!',
          metadata,
          tags,
        })
        .returning();

      expect(result).toHaveLength(1);
      const comment = result[0];

      expect(comment.matchId).toBe(matchId);
      expect(comment.minute).toBe(23);
      expect(comment.sequence).toBe(1);
      expect(comment.period).toBe('first_half');
      expect(comment.eventType).toBe('goal');
      expect(comment.actor).toBe('Player Name');
      expect(comment.team).toBe('Team A');
      expect(comment.message).toBe('Goal scored!');
      expect(comment.metadata).toEqual(metadata);
      expect(comment.tags).toEqual(tags);

      // Clean up
      await db.delete(commentary).where(eq(commentary.id, comment.id));
    });

    it('should query commentary by match', async () => {
      // Insert multiple commentary entries
      await db.insert(commentary).values([
        { matchId, minute: 10, message: 'First event' },
        { matchId, minute: 20, message: 'Second event' },
      ]);

      const comments = await db
        .select()
        .from(commentary)
        .where(eq(commentary.matchId, matchId));

      expect(comments.length).toBeGreaterThan(0);
      expect(comments.some((c) => c.message === 'First event')).toBe(true);

      // Clean up
      await db.delete(commentary).where(eq(commentary.matchId, matchId));
    });

    it('should store and retrieve JSONB metadata correctly', async () => {
      const complexMetadata = {
        player: { id: 10, name: 'John Doe' },
        stats: { shots: 5, saves: 3 },
        coordinates: { x: 45.5, y: 30.2 },
      };

      const [comment] = await db
        .insert(commentary)
        .values({
          matchId,
          metadata: complexMetadata,
        })
        .returning();

      expect(comment.metadata).toEqual(complexMetadata);

      // Clean up
      await db.delete(commentary).where(eq(commentary.id, comment.id));
    });

    it('should store and retrieve text array tags correctly', async () => {
      const tags = ['goal', 'home_team', 'highlight', 'penalty'];

      const [comment] = await db
        .insert(commentary)
        .values({
          matchId,
          tags,
        })
        .returning();

      expect(comment.tags).toEqual(tags);
      expect(Array.isArray(comment.tags)).toBe(true);
      expect(comment.tags).toHaveLength(4);

      // Clean up
      await db.delete(commentary).where(eq(commentary.id, comment.id));
    });
  });

  describe('match status enum', () => {
    it('should accept all valid match status values', async () => {
      const statuses = ['scheduled', 'live', 'finished'];

      for (const status of statuses) {
        const [match] = await db
          .insert(matches)
          .values({
            sport: 'test',
            homeTeam: 'A',
            awayTeam: 'B',
            status,
            startTime: new Date(),
          })
          .returning();

        expect(match.status).toBe(status);

        // Clean up
        await db.delete(matches).where(eq(matches.id, match.id));
      }
    });
  });

  describe('data integrity and constraints', () => {
    it('should require sport field for matches', async () => {
      await expect(
        db.insert(matches).values({
          // sport is missing
          homeTeam: 'Team A',
          awayTeam: 'Team B',
          startTime: new Date(),
        })
      ).rejects.toThrow();
    });

    it('should require homeTeam field for matches', async () => {
      await expect(
        db.insert(matches).values({
          sport: 'football',
          // homeTeam is missing
          awayTeam: 'Team B',
          startTime: new Date(),
        })
      ).rejects.toThrow();
    });

    it('should require awayTeam field for matches', async () => {
      await expect(
        db.insert(matches).values({
          sport: 'football',
          homeTeam: 'Team A',
          // awayTeam is missing
          startTime: new Date(),
        })
      ).rejects.toThrow();
    });

    it('should require startTime field for matches', async () => {
      await expect(
        db.insert(matches).values({
          sport: 'football',
          homeTeam: 'Team A',
          awayTeam: 'Team B',
          // startTime is missing
        })
      ).rejects.toThrow();
    });

    it('should require matchId field for commentary', async () => {
      await expect(
        db.insert(commentary).values({
          // matchId is missing
          message: 'Test',
        })
      ).rejects.toThrow();
    });
  });
});
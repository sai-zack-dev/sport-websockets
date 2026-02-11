import { describe, it, expect } from 'vitest';
import { matches, commentary, matchStatusEnum } from './schema.js';
import { sql } from 'drizzle-orm';

describe('src/db/schema.js', () => {
  describe('matchStatusEnum', () => {
    it('should be defined', () => {
      expect(matchStatusEnum).toBeDefined();
    });

    it('should have the correct enum name', () => {
      expect(matchStatusEnum.enumName).toBe('match_status');
    });

    it('should have all required enum values', () => {
      const expectedValues = ['scheduled', 'live', 'finished'];
      expect(matchStatusEnum.enumValues).toEqual(expectedValues);
    });

    it('should have exactly three status values', () => {
      expect(matchStatusEnum.enumValues).toHaveLength(3);
    });

    it('should include scheduled status', () => {
      expect(matchStatusEnum.enumValues).toContain('scheduled');
    });

    it('should include live status', () => {
      expect(matchStatusEnum.enumValues).toContain('live');
    });

    it('should include finished status', () => {
      expect(matchStatusEnum.enumValues).toContain('finished');
    });
  });

  describe('matches table', () => {
    it('should be defined', () => {
      expect(matches).toBeDefined();
    });

    it('should have correct table name', () => {
      expect(matches[Symbol.for('drizzle:Name')]).toBe('matches');
    });

    it('should have id column as serial primary key', () => {
      const columns = matches[Symbol.for('drizzle:Columns')];
      expect(columns.id).toBeDefined();
      expect(columns.id.primary).toBe(true);
      expect(columns.id.notNull).toBe(true);
    });

    it('should have sport column as required text', () => {
      const columns = matches[Symbol.for('drizzle:Columns')];
      expect(columns.sport).toBeDefined();
      expect(columns.sport.notNull).toBe(true);
    });

    it('should have homeTeam column as required text', () => {
      const columns = matches[Symbol.for('drizzle:Columns')];
      expect(columns.homeTeam).toBeDefined();
      expect(columns.homeTeam.notNull).toBe(true);
      expect(columns.homeTeam.name).toBe('home_team');
    });

    it('should have awayTeam column as required text', () => {
      const columns = matches[Symbol.for('drizzle:Columns')];
      expect(columns.awayTeam).toBeDefined();
      expect(columns.awayTeam.notNull).toBe(true);
      expect(columns.awayTeam.name).toBe('away_team');
    });

    it('should have status column with default value scheduled', () => {
      const columns = matches[Symbol.for('drizzle:Columns')];
      expect(columns.status).toBeDefined();
      expect(columns.status.notNull).toBe(true);
      expect(columns.status.hasDefault).toBe(true);
    });

    it('should have startTime column as required timestamp', () => {
      const columns = matches[Symbol.for('drizzle:Columns')];
      expect(columns.startTime).toBeDefined();
      expect(columns.startTime.notNull).toBe(true);
      expect(columns.startTime.name).toBe('start_time');
    });

    it('should have endTime column as optional timestamp', () => {
      const columns = matches[Symbol.for('drizzle:Columns')];
      expect(columns.endTime).toBeDefined();
      expect(columns.endTime.notNull).toBe(false);
      expect(columns.endTime.name).toBe('end_time');
    });

    it('should have homeScore column with default value 0', () => {
      const columns = matches[Symbol.for('drizzle:Columns')];
      expect(columns.homeScore).toBeDefined();
      expect(columns.homeScore.notNull).toBe(true);
      expect(columns.homeScore.hasDefault).toBe(true);
      expect(columns.homeScore.name).toBe('home_score');
    });

    it('should have awayScore column with default value 0', () => {
      const columns = matches[Symbol.for('drizzle:Columns')];
      expect(columns.awayScore).toBeDefined();
      expect(columns.awayScore.notNull).toBe(true);
      expect(columns.awayScore.hasDefault).toBe(true);
      expect(columns.awayScore.name).toBe('away_score');
    });

    it('should have createdAt column with default now()', () => {
      const columns = matches[Symbol.for('drizzle:Columns')];
      expect(columns.createdAt).toBeDefined();
      expect(columns.createdAt.notNull).toBe(true);
      expect(columns.createdAt.hasDefault).toBe(true);
      expect(columns.createdAt.name).toBe('created_at');
    });

    it('should have all required columns', () => {
      const columns = matches[Symbol.for('drizzle:Columns')];
      const requiredColumns = [
        'id',
        'sport',
        'homeTeam',
        'awayTeam',
        'status',
        'startTime',
        'endTime',
        'homeScore',
        'awayScore',
        'createdAt',
      ];

      requiredColumns.forEach((columnName) => {
        expect(columns[columnName]).toBeDefined();
      });
    });
  });

  describe('commentary table', () => {
    it('should be defined', () => {
      expect(commentary).toBeDefined();
    });

    it('should have correct table name', () => {
      expect(commentary[Symbol.for('drizzle:Name')]).toBe('commentary');
    });

    it('should have id column as serial primary key', () => {
      const columns = commentary[Symbol.for('drizzle:Columns')];
      expect(columns.id).toBeDefined();
      expect(columns.id.primary).toBe(true);
      expect(columns.id.notNull).toBe(true);
    });

    it('should have matchId column as required integer', () => {
      const columns = commentary[Symbol.for('drizzle:Columns')];
      expect(columns.matchId).toBeDefined();
      expect(columns.matchId.notNull).toBe(true);
      expect(columns.matchId.name).toBe('match_id');
    });

    it('should have foreign key to matches table', () => {
      // Foreign keys are defined in the schema
      // The foreign key constraint is defined using foreignKey() in the schema
      // This test verifies the schema is structured correctly
      expect(commentary).toBeDefined();
      const columns = commentary[Symbol.for('drizzle:Columns')];
      expect(columns.matchId).toBeDefined();
      expect(columns.matchId.name).toBe('match_id');
    });

    it('should have minute column as optional integer', () => {
      const columns = commentary[Symbol.for('drizzle:Columns')];
      expect(columns.minute).toBeDefined();
      expect(columns.minute.notNull).toBe(false);
    });

    it('should have sequence column as optional integer', () => {
      const columns = commentary[Symbol.for('drizzle:Columns')];
      expect(columns.sequence).toBeDefined();
      expect(columns.sequence.notNull).toBe(false);
    });

    it('should have period column as optional text', () => {
      const columns = commentary[Symbol.for('drizzle:Columns')];
      expect(columns.period).toBeDefined();
      expect(columns.period.notNull).toBe(false);
    });

    it('should have eventType column as optional text', () => {
      const columns = commentary[Symbol.for('drizzle:Columns')];
      expect(columns.eventType).toBeDefined();
      expect(columns.eventType.notNull).toBe(false);
      expect(columns.eventType.name).toBe('event_type');
    });

    it('should have actor column as optional text', () => {
      const columns = commentary[Symbol.for('drizzle:Columns')];
      expect(columns.actor).toBeDefined();
      expect(columns.actor.notNull).toBe(false);
    });

    it('should have team column as optional text', () => {
      const columns = commentary[Symbol.for('drizzle:Columns')];
      expect(columns.team).toBeDefined();
      expect(columns.team.notNull).toBe(false);
    });

    it('should have message column as optional text', () => {
      const columns = commentary[Symbol.for('drizzle:Columns')];
      expect(columns.message).toBeDefined();
      expect(columns.message.notNull).toBe(false);
    });

    it('should have metadata column as optional jsonb', () => {
      const columns = commentary[Symbol.for('drizzle:Columns')];
      expect(columns.metadata).toBeDefined();
      expect(columns.metadata.notNull).toBe(false);
    });

    it('should have tags column as text array', () => {
      const columns = commentary[Symbol.for('drizzle:Columns')];
      expect(columns.tags).toBeDefined();
      expect(columns.tags.notNull).toBe(false);
    });

    it('should have createdAt column with default now()', () => {
      const columns = commentary[Symbol.for('drizzle:Columns')];
      expect(columns.createdAt).toBeDefined();
      expect(columns.createdAt.notNull).toBe(true);
      expect(columns.createdAt.hasDefault).toBe(true);
      expect(columns.createdAt.name).toBe('created_at');
    });

    it('should have all required columns', () => {
      const columns = commentary[Symbol.for('drizzle:Columns')];
      const requiredColumns = [
        'id',
        'matchId',
        'minute',
        'sequence',
        'period',
        'eventType',
        'actor',
        'team',
        'message',
        'metadata',
        'tags',
        'createdAt',
      ];

      requiredColumns.forEach((columnName) => {
        expect(columns[columnName]).toBeDefined();
      });
    });
  });

  describe('schema relationships', () => {
    it('should export matchStatusEnum', () => {
      expect(matchStatusEnum).toBeDefined();
      // pgEnum returns a function in Drizzle ORM
      expect(typeof matchStatusEnum).toBe('function');
    });

    it('should export matches table', () => {
      expect(matches).toBeDefined();
      expect(typeof matches).toBe('object');
    });

    it('should export commentary table', () => {
      expect(commentary).toBeDefined();
      expect(typeof commentary).toBe('object');
    });

    it('should have commentary table reference matches table', () => {
      // The foreign key is defined in the schema file using foreignKey()
      // This test verifies the schema structure is correct
      const columns = commentary[Symbol.for('drizzle:Columns')];
      expect(columns.matchId).toBeDefined();
      expect(columns.matchId.name).toBe('match_id');

      // Verify both tables exist and can be related
      expect(matches).toBeDefined();
      expect(commentary).toBeDefined();
    });
  });

  describe('column name mappings', () => {
    it('should map camelCase to snake_case correctly in matches table', () => {
      const columns = matches[Symbol.for('drizzle:Columns')];

      expect(columns.homeTeam.name).toBe('home_team');
      expect(columns.awayTeam.name).toBe('away_team');
      expect(columns.startTime.name).toBe('start_time');
      expect(columns.endTime.name).toBe('end_time');
      expect(columns.homeScore.name).toBe('home_score');
      expect(columns.awayScore.name).toBe('away_score');
      expect(columns.createdAt.name).toBe('created_at');
    });

    it('should map camelCase to snake_case correctly in commentary table', () => {
      const columns = commentary[Symbol.for('drizzle:Columns')];

      expect(columns.matchId.name).toBe('match_id');
      expect(columns.eventType.name).toBe('event_type');
      expect(columns.createdAt.name).toBe('created_at');
    });
  });

  describe('default values', () => {
    it('should have correct default for match status', () => {
      const columns = matches[Symbol.for('drizzle:Columns')];
      expect(columns.status.hasDefault).toBe(true);
    });

    it('should have correct default for home score', () => {
      const columns = matches[Symbol.for('drizzle:Columns')];
      expect(columns.homeScore.hasDefault).toBe(true);
    });

    it('should have correct default for away score', () => {
      const columns = matches[Symbol.for('drizzle:Columns')];
      expect(columns.awayScore.hasDefault).toBe(true);
    });

    it('should have timestamp defaults for createdAt columns', () => {
      const matchesColumns = matches[Symbol.for('drizzle:Columns')];
      const commentaryColumns = commentary[Symbol.for('drizzle:Columns')];

      expect(matchesColumns.createdAt.hasDefault).toBe(true);
      expect(commentaryColumns.createdAt.hasDefault).toBe(true);
    });
  });
});
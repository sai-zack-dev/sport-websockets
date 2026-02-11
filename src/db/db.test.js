import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('src/db/db.js', () => {
  let originalEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    // Clear module cache to force re-import
    vi.resetModules();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  it('should export pool when DATABASE_URL is set', async () => {
    process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/testdb';

    const dbModule = await import('./db.js?t=' + Date.now());

    expect(dbModule.pool).toBeDefined();
    expect(dbModule.pool).toHaveProperty('connect');
    expect(dbModule.pool).toHaveProperty('query');
    expect(dbModule.pool).toHaveProperty('end');

    // Clean up pool
    await dbModule.pool.end();
  });

  it('should export db drizzle instance when DATABASE_URL is set', async () => {
    process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/testdb';

    const dbModule = await import('./db.js?t=' + Date.now());

    expect(dbModule.db).toBeDefined();
    expect(typeof dbModule.db).toBe('object');

    // Clean up pool
    await dbModule.pool.end();
  });

  it('should throw an error when DATABASE_URL is not defined', async () => {
    delete process.env.DATABASE_URL;

    await expect(async () => {
      await import('./db.js?t=' + Date.now());
    }).rejects.toThrow('DATABASE_URL is not defined');
  });

  it('should throw an error when DATABASE_URL is an empty string', async () => {
    process.env.DATABASE_URL = '';

    await expect(async () => {
      await import('./db.js?t=' + Date.now());
    }).rejects.toThrow('DATABASE_URL is not defined');
  });

  it('should create Pool with correct connection string', async () => {
    const testUrl = 'postgresql://testuser:testpass@testhost:5555/testdb';
    process.env.DATABASE_URL = testUrl;

    const dbModule = await import('./db.js?t=' + Date.now());

    // The pool should be configured with the connection string
    expect(dbModule.pool).toBeDefined();
    expect(dbModule.pool.options).toBeDefined();
    expect(dbModule.pool.options.connectionString).toBe(testUrl);

    // Clean up pool
    await dbModule.pool.end();
  });

  it('should handle different postgresql connection string formats', async () => {
    const connectionStrings = [
      'postgresql://user:password@localhost:5432/db',
      'postgresql://user@localhost/db',
      'postgres://user:password@localhost:5432/db',
    ];

    for (const connectionString of connectionStrings) {
      process.env.DATABASE_URL = connectionString;
      vi.resetModules();

      const dbModule = await import('./db.js?t=' + Date.now());
      expect(dbModule.pool).toBeDefined();
      expect(dbModule.db).toBeDefined();

      // Clean up pool
      await dbModule.pool.end();
    }
  });

  it('should create a pool that can be ended', async () => {
    process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/testdb';

    const dbModule = await import('./db.js?t=' + Date.now());

    expect(dbModule.pool.end).toBeDefined();
    expect(typeof dbModule.pool.end).toBe('function');

    // Test ending the pool doesn't throw
    await expect(dbModule.pool.end()).resolves.not.toThrow();
  });

  it('should export both pool and db as named exports', async () => {
    process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/testdb';

    const dbModule = await import('./db.js?t=' + Date.now());

    // Check that both exports exist
    expect(dbModule).toHaveProperty('pool');
    expect(dbModule).toHaveProperty('db');

    // Verify they are exported as named exports, not default
    expect(dbModule.default).toBeUndefined();

    // Clean up pool
    await dbModule.pool.end();
  });

  it('should create drizzle instance from the pool', async () => {
    process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/testdb';

    const dbModule = await import('./db.js?t=' + Date.now());

    // The db should have drizzle methods
    expect(dbModule.db).toBeDefined();
    expect(typeof dbModule.db).toBe('object');

    // Drizzle instances typically have methods like select, insert, update, delete
    expect(dbModule.db).toHaveProperty('select');
    expect(dbModule.db).toHaveProperty('insert');
    expect(dbModule.db).toHaveProperty('update');
    expect(dbModule.db).toHaveProperty('delete');

    // Clean up pool
    await dbModule.pool.end();
  });

  describe('edge cases and error handling', () => {
    it('should handle malformed DATABASE_URL gracefully', async () => {
      process.env.DATABASE_URL = 'not-a-valid-url';

      const dbModule = await import('./db.js?t=' + Date.now());

      // Pool should still be created, even if connection will fail later
      expect(dbModule.pool).toBeDefined();

      // Clean up pool
      await dbModule.pool.end();
    });

    it('should handle DATABASE_URL with special characters', async () => {
      // URL with special characters in password
      process.env.DATABASE_URL = 'postgresql://user:p@ssw0rd!@localhost:5432/db';

      const dbModule = await import('./db.js?t=' + Date.now());

      expect(dbModule.pool).toBeDefined();
      expect(dbModule.db).toBeDefined();

      // Clean up pool
      await dbModule.pool.end();
    });

    it('should handle DATABASE_URL with query parameters', async () => {
      process.env.DATABASE_URL =
        'postgresql://localhost:5432/db?sslmode=require&connect_timeout=10';

      const dbModule = await import('./db.js?t=' + Date.now());

      expect(dbModule.pool).toBeDefined();
      expect(dbModule.db).toBeDefined();

      // Clean up pool
      await dbModule.pool.end();
    });

    it('should handle whitespace in DATABASE_URL', async () => {
      // Trailing whitespace
      process.env.DATABASE_URL = 'postgresql://localhost:5432/db  ';

      const dbModule = await import('./db.js?t=' + Date.now());

      expect(dbModule.pool).toBeDefined();

      // Clean up pool
      await dbModule.pool.end();
    });
  });
});
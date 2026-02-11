import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('drizzle.config.js', () => {
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

  it('should export a valid Drizzle config when DATABASE_URL is set', async () => {
    // Set DATABASE_URL before importing
    process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/testdb';

    const config = await import('./drizzle.config.js?t=' + Date.now());

    expect(config.default).toBeDefined();
    expect(config.default.schema).toBe('./src/db/schema.js');
    expect(config.default.out).toBe('./drizzle');
    expect(config.default.dialect).toBe('postgresql');
    expect(config.default.dbCredentials).toBeDefined();
    expect(config.default.dbCredentials.url).toBe('postgresql://user:password@localhost:5432/testdb');
  });

  it('should throw an error when DATABASE_URL is not set', async () => {
    // Remove DATABASE_URL
    delete process.env.DATABASE_URL;

    await expect(async () => {
      await import('./drizzle.config.js?t=' + Date.now());
    }).rejects.toThrow('DATABASE_URL is not set in .env file');
  });

  it('should throw an error when DATABASE_URL is an empty string', async () => {
    // Set empty DATABASE_URL
    process.env.DATABASE_URL = '';

    await expect(async () => {
      await import('./drizzle.config.js?t=' + Date.now());
    }).rejects.toThrow('DATABASE_URL is not set in .env file');
  });

  it('should accept different postgresql connection string formats', async () => {
    const connectionStrings = [
      'postgresql://user:password@localhost:5432/db',
      'postgresql://user@localhost/db',
      'postgres://user:password@localhost:5432/db',
      'postgresql://localhost:5432/db',
    ];

    for (const connectionString of connectionStrings) {
      process.env.DATABASE_URL = connectionString;
      vi.resetModules();

      const config = await import('./drizzle.config.js?t=' + Date.now());
      expect(config.default.dbCredentials.url).toBe(connectionString);
    }
  });

  it('should have correct schema path configuration', async () => {
    process.env.DATABASE_URL = 'postgresql://localhost:5432/db';

    const config = await import('./drizzle.config.js?t=' + Date.now());

    // Schema path should point to the schema file
    expect(config.default.schema).toMatch(/schema\.js$/);
    expect(config.default.schema).toBe('./src/db/schema.js');
  });

  it('should have correct migration output directory', async () => {
    process.env.DATABASE_URL = 'postgresql://localhost:5432/db';

    const config = await import('./drizzle.config.js?t=' + Date.now());

    expect(config.default.out).toBe('./drizzle');
  });

  it('should use postgresql dialect', async () => {
    process.env.DATABASE_URL = 'postgresql://localhost:5432/db';

    const config = await import('./drizzle.config.js?t=' + Date.now());

    expect(config.default.dialect).toBe('postgresql');
  });

  describe('edge cases and validation', () => {
    it('should handle DATABASE_URL with complex authentication', async () => {
      // URL with complex username and password
      process.env.DATABASE_URL =
        'postgresql://my_user:c0mpl3x_p@ssw0rd!@db.example.com:5432/prod_db';

      const config = await import('./drizzle.config.js?t=' + Date.now());

      expect(config.default.dbCredentials.url).toBe(
        'postgresql://my_user:c0mpl3x_p@ssw0rd!@db.example.com:5432/prod_db'
      );
    });

    it('should handle DATABASE_URL with IPv6 address', async () => {
      process.env.DATABASE_URL = 'postgresql://[::1]:5432/db';

      const config = await import('./drizzle.config.js?t=' + Date.now());

      expect(config.default.dbCredentials.url).toBe('postgresql://[::1]:5432/db');
    });

    it('should handle DATABASE_URL with SSL parameters', async () => {
      process.env.DATABASE_URL =
        'postgresql://localhost:5432/db?sslmode=require&sslcert=/path/to/cert';

      const config = await import('./drizzle.config.js?t=' + Date.now());

      expect(config.default.dbCredentials.url).toContain('sslmode=require');
    });

    it('should export default config object', async () => {
      process.env.DATABASE_URL = 'postgresql://localhost:5432/db';

      const config = await import('./drizzle.config.js?t=' + Date.now());

      expect(config.default).toBeDefined();
      expect(config.default).toBeTypeOf('object');
    });

    it('should have all required configuration keys', async () => {
      process.env.DATABASE_URL = 'postgresql://localhost:5432/db';

      const config = await import('./drizzle.config.js?t=' + Date.now());

      const requiredKeys = ['schema', 'out', 'dialect', 'dbCredentials'];
      requiredKeys.forEach((key) => {
        expect(config.default).toHaveProperty(key);
      });
    });

    it('should accept whitespace-padded DATABASE_URL as valid', async () => {
      // Whitespace-padded URLs are technically truthy and will be accepted
      process.env.DATABASE_URL = '  postgresql://localhost:5432/db  ';

      const config = await import('./drizzle.config.js?t=' + Date.now());

      expect(config.default).toBeDefined();
      expect(config.default.dbCredentials.url).toBe('  postgresql://localhost:5432/db  ');
    });

    it('should reject null DATABASE_URL', async () => {
      process.env.DATABASE_URL = null;

      await expect(async () => {
        await import('./drizzle.config.js?t=' + Date.now());
      }).rejects.toThrow('DATABASE_URL is not set in .env file');
    });

    it('should reject undefined DATABASE_URL', async () => {
      process.env.DATABASE_URL = undefined;

      await expect(async () => {
        await import('./drizzle.config.js?t=' + Date.now());
      }).rejects.toThrow('DATABASE_URL is not set in .env file');
    });
  });
});
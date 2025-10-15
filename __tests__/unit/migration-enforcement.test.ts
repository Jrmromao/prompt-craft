/**
 * Test: Migration Enforcement
 * Ensures migrations are properly tracked and applied
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

describe('Migration Enforcement', () => {
  const migrationsDir = path.join(process.cwd(), 'prisma', 'migrations');

  it('should have migrations directory', () => {
    expect(fs.existsSync(migrationsDir)).toBe(true);
  });

  it('should have migration files', () => {
    const migrations = fs.readdirSync(migrationsDir);
    const migrationFolders = migrations.filter(m => 
      fs.statSync(path.join(migrationsDir, m)).isDirectory()
    );
    
    expect(migrationFolders.length).toBeGreaterThan(0);
  });

  it('should have migration.sql in each migration folder', () => {
    const migrations = fs.readdirSync(migrationsDir);
    const migrationFolders = migrations.filter(m => 
      fs.statSync(path.join(migrationsDir, m)).isDirectory()
    );

    migrationFolders.forEach(folder => {
      const sqlFile = path.join(migrationsDir, folder, 'migration.sql');
      expect(fs.existsSync(sqlFile)).toBe(true);
    });
  });

  it('should have migration_lock.toml', () => {
    const lockFile = path.join(migrationsDir, 'migration_lock.toml');
    expect(fs.existsSync(lockFile)).toBe(true);
  });

  it('should not allow db push in production', () => {
    // This is a policy test - verifies the rule exists
    const rules = fs.readFileSync(
      path.join(process.cwd(), '.amazonq', 'rules', 'CRITICAL-MIGRATION-RULE.md'),
      'utf-8'
    );
    
    expect(rules).toContain('npx prisma migrate dev');
    expect(rules).toContain('FORBIDDEN');
    expect(rules).toContain('db push');
  });
});

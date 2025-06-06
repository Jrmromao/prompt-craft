import { validateEnv } from '../utils/env';

try {
  validateEnv();
  console.log('✅ Environment variables validation passed');
  process.exit(0);
} catch (error) {
  console.error('❌ Environment variables validation failed:', error);
  process.exit(1);
}

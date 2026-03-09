// Test environment setup
// In tests we mock DB and Redis to avoid needing running infrastructure.
// Integration tests that truly need the DB should use a test database URL.

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/otaku_test';
process.env.DIRECT_DATABASE_URL = 'postgresql://test:test@localhost:5432/otaku_test';
process.env.REDIS_URL = 'redis://localhost:6379/1';
process.env.JWT_SECRET = 'test-secret-that-is-long-enough-for-jwt-signing-requirements';
process.env.COOKIE_SECRET = 'test-cookie-secret-32-chars-min!!';
process.env.FRONTEND_URL = 'http://localhost:3000';

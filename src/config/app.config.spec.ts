import { validateConfig } from './app.config';

describe('Configuration Validation', () => {
  it('should validate correct configuration', () => {
    const validConfig = {
      NODE_ENV: 'development',
      PORT: '3000',
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_USERNAME: 'postgres',
      DB_PASSWORD: 'password',
      DB_NAME: 'test_db',
      JWT_EXPIRATION: '1h',
    };

    const result = validateConfig(validConfig);

    expect(result.NODE_ENV).toBe('development');
    expect(result.PORT).toBe(3000);
    expect(result.DB_HOST).toBe('localhost');
    expect(result.DB_PORT).toBe(5432);
    expect(result.DB_USERNAME).toBe('postgres');
    expect(result.DB_PASSWORD).toBe('password');
    expect(result.DB_NAME).toBe('test_db');
    expect(result.JWT_EXPIRATION).toBe('1h');
  });

  it('should apply defaults for missing values', () => {
    const partialConfig = {
      DB_PASSWORD: 'password',
    };

    const result = validateConfig(partialConfig);

    expect(result.NODE_ENV).toBe('development');
    expect(result.PORT).toBe(3000);
    expect(result.DB_HOST).toBe('localhost');
    expect(result.DB_PORT).toBe(5432);
    expect(result.DB_USERNAME).toBe('postgres');
    expect(result.DB_PASSWORD).toBe('password');
    expect(result.DB_NAME).toBe('nest_webhook');
    expect(result.JWT_EXPIRATION).toBe('1h');
  });

  it('should throw error for invalid NODE_ENV', () => {
    const invalidConfig = {
      NODE_ENV: 'invalid_env',
    };

    expect(() => validateConfig(invalidConfig)).toThrow();
  });

  it('should throw error for invalid PORT (non-numeric)', () => {
    const invalidConfig = {
      PORT: 'invalid_port',
    };

    expect(() => validateConfig(invalidConfig)).toThrow();
  });

  it('should throw error for negative PORT', () => {
    const invalidConfig = {
      PORT: '-1',
    };

    expect(() => validateConfig(invalidConfig)).toThrow();
  });

  it('should throw error for invalid DB_PORT (non-numeric)', () => {
    const invalidConfig = {
      DB_PORT: 'invalid_port',
    };

    expect(() => validateConfig(invalidConfig)).toThrow();
  });

  it('should throw error for empty DB_HOST', () => {
    const invalidConfig = {
      DB_HOST: '',
    };

    expect(() => validateConfig(invalidConfig)).toThrow();
  });

  it('should throw error for empty DB_USERNAME', () => {
    const invalidConfig = {
      DB_USERNAME: '',
    };

    expect(() => validateConfig(invalidConfig)).toThrow();
  });

  it('should throw error for empty DB_NAME', () => {
    const invalidConfig = {
      DB_NAME: '',
    };

    expect(() => validateConfig(invalidConfig)).toThrow();
  });

  it('should accept empty DB_PASSWORD', () => {
    const validConfig = {
      DB_PASSWORD: '',
    };

    const result = validateConfig(validConfig);
    expect(result.DB_PASSWORD).toBe('');
  });

  it('should require JWT_SECRET to be at least 32 characters when provided', () => {
    const invalidConfig = {
      JWT_SECRET: 'short',
    };

    expect(() => validateConfig(invalidConfig)).toThrow();
  });

  it('should accept valid JWT_SECRET', () => {
    const validConfig = {
      JWT_SECRET: 'this_is_a_very_long_jwt_secret_key_32_chars',
    };

    const result = validateConfig(validConfig);
    expect(result.JWT_SECRET).toBe(
      'this_is_a_very_long_jwt_secret_key_32_chars',
    );
  });

  it('should handle production environment', () => {
    const prodConfig = {
      NODE_ENV: 'production',
      PORT: '8080',
      DB_HOST: 'prod-db.example.com',
      DB_PORT: '5432',
      DB_USERNAME: 'app_user',
      DB_PASSWORD: 'secure_password',
      DB_NAME: 'production_db',
    };

    const result = validateConfig(prodConfig);

    expect(result.NODE_ENV).toBe('production');
    expect(result.PORT).toBe(8080);
    expect(result.DB_HOST).toBe('prod-db.example.com');
  });

  it('should handle test environment', () => {
    const testConfig = {
      NODE_ENV: 'test',
      DB_NAME: 'test_db',
    };

    const result = validateConfig(testConfig);

    expect(result.NODE_ENV).toBe('test');
    expect(result.DB_NAME).toBe('test_db');
  });
});

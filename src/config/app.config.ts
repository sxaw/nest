import { z } from 'zod';

const environmentVariablesSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive())
    .default(3000),

  // Database Configuration
  DB_HOST: z.string().min(1).default('localhost'),
  DB_PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive())
    .default(5432),
  DB_USERNAME: z.string().min(1).default('postgres'),
  DB_PASSWORD: z.string().min(0).default(''),
  DB_NAME: z.string().min(1).default('nest_webhook'),

  // JWT Configuration (for future use)
  JWT_SECRET: z.string().min(32).optional(),
  JWT_EXPIRATION: z.string().default('1h'),

  // MQTT Configuration
  MQTT_BROKER_URL: z.string().min(1).default('mqtt://localhost:1883'),
  MQTT_CLIENT_ID: z.string().min(1).default('health-app'),
});

export type EnvironmentVariables = z.infer<typeof environmentVariablesSchema>;

export function validateConfig(
  config: Record<string, unknown>,
): EnvironmentVariables {
  return environmentVariablesSchema.parse(config);
}

export const environmentVariablesSchemaObject = environmentVariablesSchema;

import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional().default("http://localhost:3000"),
  // Add more validated envs here as we integrate paid tiers or other services
  // COINGECKO_API_KEY: z.string().optional(),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  // COINGECKO_API_KEY: process.env.COINGECKO_API_KEY,
});

export type Env = z.infer<typeof envSchema>;

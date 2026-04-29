import { Redis } from "@upstash/redis";

export type SignupRecord = {
  email: string;
  name?: string;
  company?: string;
  role?: string;
  useCase?: string;
  referralCode: string;
  referredBy?: string;
  referralCount: number;
  queuePosition: number;
  signupOrder: number;
  ip?: string;
  userAgent?: string;
  utm?: Record<string, string | undefined>;
  createdAt: string;
};

const SIGNUP_KEY = (email: string) => `waitlist:signup:${email.toLowerCase()}`;
const REFERRAL_KEY = (code: string) => `waitlist:referral:${code.toUpperCase()}`;
const COUNTER_KEY = "waitlist:counter";
const REFERRAL_COUNT_KEY = (code: string) =>
  `waitlist:referral_count:${code.toUpperCase()}`;
const RATE_LIMIT_KEY = (ip: string) => `waitlist:rl:${ip}`;

// Tunables
export const RATE_LIMIT_MAX = 6;
export const RATE_LIMIT_WINDOW_S = 60 * 60; // 1 hour
export const REFERRAL_BOOST_PER_CONVERSION = 10; // each successful referral lifts you 10 spots

export type SignupStorage = {
  getByEmail(email: string): Promise<SignupRecord | null>;
  getByReferralCode(code: string): Promise<SignupRecord | null>;
  createSignup(record: Omit<SignupRecord, "signupOrder" | "queuePosition" | "referralCount">): Promise<SignupRecord>;
  incrementReferralCount(code: string): Promise<number>;
  computeQueuePosition(record: SignupRecord): Promise<number>;
  rateLimit(ip: string): Promise<{ allowed: boolean; remaining: number; resetSeconds: number }>;
  totalSignups(): Promise<number>;
};

class RedisStorage implements SignupStorage {
  constructor(private redis: Redis) {}

  async getByEmail(email: string): Promise<SignupRecord | null> {
    const raw = await this.redis.get<SignupRecord>(SIGNUP_KEY(email));
    return raw ?? null;
  }

  async getByReferralCode(code: string): Promise<SignupRecord | null> {
    const email = await this.redis.get<string>(REFERRAL_KEY(code));
    if (!email) return null;
    return this.getByEmail(email);
  }

  async createSignup(
    record: Omit<SignupRecord, "signupOrder" | "queuePosition" | "referralCount">,
  ): Promise<SignupRecord> {
    const signupOrder = await this.redis.incr(COUNTER_KEY);
    const full: SignupRecord = {
      ...record,
      signupOrder,
      referralCount: 0,
      queuePosition: signupOrder,
    };
    await Promise.all([
      this.redis.set(SIGNUP_KEY(record.email), full),
      this.redis.set(REFERRAL_KEY(record.referralCode), record.email),
    ]);
    return full;
  }

  async incrementReferralCount(code: string): Promise<number> {
    return this.redis.incr(REFERRAL_COUNT_KEY(code));
  }

  async computeQueuePosition(record: SignupRecord): Promise<number> {
    const boost = await this.redis.get<number>(REFERRAL_COUNT_KEY(record.referralCode));
    const lift = (boost ?? 0) * REFERRAL_BOOST_PER_CONVERSION;
    return Math.max(1, record.signupOrder - lift);
  }

  async rateLimit(ip: string) {
    const key = RATE_LIMIT_KEY(ip);
    const count = await this.redis.incr(key);
    if (count === 1) {
      await this.redis.expire(key, RATE_LIMIT_WINDOW_S);
    }
    const ttl = await this.redis.ttl(key);
    return {
      allowed: count <= RATE_LIMIT_MAX,
      remaining: Math.max(0, RATE_LIMIT_MAX - count),
      resetSeconds: ttl > 0 ? ttl : RATE_LIMIT_WINDOW_S,
    };
  }

  async totalSignups(): Promise<number> {
    return (await this.redis.get<number>(COUNTER_KEY)) ?? 0;
  }
}

class MemoryStorage implements SignupStorage {
  private signups = new Map<string, SignupRecord>();
  private codeToEmail = new Map<string, string>();
  private referralCounts = new Map<string, number>();
  private rateBuckets = new Map<string, { count: number; resetAt: number }>();
  private counter = 0;

  async getByEmail(email: string) {
    return this.signups.get(email.toLowerCase()) ?? null;
  }

  async getByReferralCode(code: string) {
    const email = this.codeToEmail.get(code.toUpperCase());
    if (!email) return null;
    return this.getByEmail(email);
  }

  async createSignup(
    record: Omit<SignupRecord, "signupOrder" | "queuePosition" | "referralCount">,
  ): Promise<SignupRecord> {
    this.counter += 1;
    const full: SignupRecord = {
      ...record,
      signupOrder: this.counter,
      referralCount: 0,
      queuePosition: this.counter,
    };
    this.signups.set(record.email.toLowerCase(), full);
    this.codeToEmail.set(record.referralCode.toUpperCase(), record.email.toLowerCase());
    return full;
  }

  async incrementReferralCount(code: string): Promise<number> {
    const k = code.toUpperCase();
    const next = (this.referralCounts.get(k) ?? 0) + 1;
    this.referralCounts.set(k, next);
    return next;
  }

  async computeQueuePosition(record: SignupRecord): Promise<number> {
    const boost = this.referralCounts.get(record.referralCode.toUpperCase()) ?? 0;
    const lift = boost * REFERRAL_BOOST_PER_CONVERSION;
    return Math.max(1, record.signupOrder - lift);
  }

  async rateLimit(ip: string) {
    const now = Date.now();
    const bucket = this.rateBuckets.get(ip);
    if (!bucket || bucket.resetAt < now) {
      this.rateBuckets.set(ip, {
        count: 1,
        resetAt: now + RATE_LIMIT_WINDOW_S * 1000,
      });
      return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetSeconds: RATE_LIMIT_WINDOW_S };
    }
    bucket.count += 1;
    return {
      allowed: bucket.count <= RATE_LIMIT_MAX,
      remaining: Math.max(0, RATE_LIMIT_MAX - bucket.count),
      resetSeconds: Math.max(1, Math.round((bucket.resetAt - now) / 1000)),
    };
  }

  async totalSignups(): Promise<number> {
    return this.counter;
  }
}

let cachedStorage: SignupStorage | null = null;
let cachedKind: "redis" | "memory" | null = null;

export function getStorage(): SignupStorage {
  if (cachedStorage) return cachedStorage;
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    cachedStorage = new RedisStorage(new Redis({ url, token }));
    cachedKind = "redis";
  } else {
    cachedStorage = new MemoryStorage();
    cachedKind = "memory";
  }
  return cachedStorage;
}

export function getStorageKind(): "redis" | "memory" {
  if (!cachedKind) getStorage();
  return cachedKind ?? "memory";
}

// Test-only — let unit tests reset the singleton.
export function __resetStorageForTests() {
  cachedStorage = null;
  cachedKind = null;
}

// 登录失败限流：进程内按邮箱维度计数。生产环境应替换为 Redis 等共享存储。
type Bucket = { failures: number; lockedUntil: number };

const buckets = new Map<string, Bucket>();
const MAX_FAILURES = 5;
const LOCK_MS = 15 * 60 * 1000;

export function isLocked(key: string): boolean {
  const bucket = buckets.get(key);
  if (!bucket) return false;
  if (bucket.lockedUntil <= Date.now()) {
    buckets.delete(key);
    return false;
  }
  return true;
}

export function recordFailure(key: string): void {
  const bucket = buckets.get(key) ?? { failures: 0, lockedUntil: 0 };
  bucket.failures += 1;
  if (bucket.failures >= MAX_FAILURES) {
    bucket.lockedUntil = Date.now() + LOCK_MS;
    bucket.failures = 0;
  }
  buckets.set(key, bucket);
}

export function clearFailures(key: string): void {
  buckets.delete(key);
}

export function remainingLockMs(key: string): number {
  const bucket = buckets.get(key);
  return bucket ? Math.max(0, bucket.lockedUntil - Date.now()) : 0;
}

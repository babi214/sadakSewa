const buckets = new Map();

// Registration OTP email: max 5 registration attempts per email/IP per hour
// Forgot-password OTP email: max 3 code requests per email/IP per 15 minutes
// Email verification OTP attempts: max 5 attempts per email/IP per 15 minutes
// Password reset OTP attempts: max 5 attempts per email/IP per 15 minutes

const getClientIp = (req) => {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || "unknown";
};

const cleanupExpiredBuckets = (now) => {
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
};

const createRateLimiter = ({
  windowMs,
  max,
  message,
  keyPrefix,
  keyGenerator,
}) => (req, res, next) => {
  const now = Date.now();
  cleanupExpiredBuckets(now);

  const key = `${keyPrefix}:${keyGenerator(req)}`;
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return next();
  }

  if (bucket.count >= max) {
    const retryAfterSeconds = Math.ceil((bucket.resetAt - now) / 1000);
    res.set("Retry-After", String(retryAfterSeconds));
    return res.status(429).json({
      success: false,
      message,
      retryAfter: retryAfterSeconds,
    });
  }

  bucket.count += 1;
  return next();
};

const emailAndIpKey = (req) => {
  const email = req.body?.email?.trim()?.toLowerCase() || "no-email";
  return `${getClientIp(req)}:${email}`;
};

const registerLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyPrefix: "register",
  keyGenerator: emailAndIpKey,
  message: "Too many registration attempts. Please try again later.",
});

const otpEmailLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 3,
  keyPrefix: "otp-email",
  keyGenerator: emailAndIpKey,
  message: "Too many code requests. Please wait before requesting another code.",
});

const otpVerifyLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyPrefix: "otp-verify",
  keyGenerator: emailAndIpKey,
  message: "Too many code attempts. Please wait before trying again.",
});

module.exports = {
  registerLimiter,
  otpEmailLimiter,
  otpVerifyLimiter,
};

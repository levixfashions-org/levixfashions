/**
 * Structured Production Logger for LEVIX
 * Formats logs with correlation Request IDs, ISO timestamps, and automatic PII sanitization.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'authorization',
  'cookie',
  'razorpay_signature',
  'key_secret',
  'cvv',
  'credit_card',
]);

function maskSensitiveData(data: any): any {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(maskSensitiveData);

  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      clean[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      clean[key] = maskSensitiveData(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

export class Logger {
  private requestId: string;

  constructor(requestId = 'system') {
    this.requestId = requestId;
  }

  private log(level: LogLevel, message: string, metadata?: Record<string, any>) {
    const entry = {
      level,
      time: new Date().toISOString(),
      requestId: this.requestId,
      msg: message,
      ...(metadata ? { meta: maskSensitiveData(metadata) } : {}),
    };

    const serialized = JSON.stringify(entry);

    if (level === 'error') {
      console.error(serialized);
    } else if (level === 'warn') {
      console.warn(serialized);
    } else {
      console.log(serialized);
    }
  }

  public info(message: string, metadata?: Record<string, any>) {
    this.log('info', message, metadata);
  }

  public warn(message: string, metadata?: Record<string, any>) {
    this.log('warn', message, metadata);
  }

  public error(message: string, metadata?: Record<string, any>) {
    this.log('error', message, metadata);
  }

  public debug(message: string, metadata?: Record<string, any>) {
    if (process.env.NODE_ENV !== 'production') {
      this.log('debug', message, metadata);
    }
  }
}

export const logger = new Logger();
export default logger;

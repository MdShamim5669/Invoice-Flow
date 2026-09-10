# Error Handling Patterns: Detailed Reference & Worked Examples

This document provides in-depth patterns, implementation templates, and cross-language examples for building resilient systems.

---

## 1. The Result Type Pattern (Type-Safe Errors)

Instead of throwing exceptions for predictable domain errors, return a tagged union `Result<T, E>`.

### TypeScript Implementation

```typescript
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

export const Ok = <T>(data: T): Result<T, never> => ({
  success: true,
  data,
});

export const Err = <E>(error: E): Result<never, E> => ({
  success: false,
  error,
});

// Usage in Domain Logic / API Calls
interface User {
  id: string;
  email: string;
}

type UserFetchError =
  | { type: 'NOT_FOUND'; userId: string }
  | { type: 'NETWORK_ERROR'; reason: string }
  | { type: 'UNAUTHORIZED' };

export async function fetchUserProfile(userId: string): Promise<Result<User, UserFetchError>> {
  try {
    const response = await fetch(`/api/users/${userId}`);
    if (response.status === 404) {
      return Err({ type: 'NOT_FOUND', userId });
    }
    if (response.status === 401) {
      return Err({ type: 'UNAUTHORIZED' });
    }
    if (!response.ok) {
      return Err({ type: 'NETWORK_ERROR', reason: response.statusText });
    }
    const data = await response.json();
    return Ok(data);
  } catch (err: any) {
    return Err({ type: 'NETWORK_ERROR', reason: err.message || 'Unknown network failure' });
  }
}

// Consumer handles errors exhaustively without try-catch
const result = await fetchUserProfile('123');
if (!result.success) {
  switch (result.error.type) {
    case 'NOT_FOUND':
      console.warn(`User ${result.error.userId} not found`);
      break;
    case 'UNAUTHORIZED':
      redirectToLogin();
      break;
    case 'NETWORK_ERROR':
      showToast('Network error, please retry');
      break;
  }
} else {
  renderProfile(result.data);
}
```

---

## 2. Structured Application Error Hierarchy

When throwing exceptions, define a structured base class with machine-readable error codes and safe serialization.

```typescript
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: Record<string, any>;

  constructor(message: string, code: string, statusCode = 500, isOperational = true, details?: Record<string, any>) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'VALIDATION_FAILED', 400, true, details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(`${resource} with ID ${id} was not found`, 'RESOURCE_NOT_FOUND', 404, true, { resource, id });
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, cause?: Error) {
    super(`External call to ${service} failed: ${message}`, 'EXTERNAL_SERVICE_ERROR', 502, true, {
      service,
      originalError: cause?.message,
    });
  }
}
```

---

## 3. Next.js App Router API & Server Action Error Handling

Standardized API route wrapper for Next.js Route Handlers:

```typescript
import { NextResponse } from 'next/server';
import { AppError } from '@/lib/errors';
import { ZodError } from 'zod';

export function withErrorHandler(
  handler: (req: Request, context?: any) => Promise<NextResponse>
) {
  return async (req: Request, context?: any) => {
    try {
      return await handler(req, context);
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            success: false,
            code: 'VALIDATION_ERROR',
            message: 'Invalid request payload',
            issues: error.flatten().fieldErrors,
          },
          { status: 400 }
        );
      }

      if (error instanceof AppError && error.isOperational) {
        return NextResponse.json(
          {
            success: false,
            code: error.code,
            message: error.message,
            details: error.details,
          },
          { status: error.statusCode }
        );
      }

      // Unexpected error - do NOT leak stack traces in production
      console.error('Unhandled System Exception:', error);
      return NextResponse.json(
        {
          success: false,
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred. Please try again later.',
        },
        { status: 500 }
      );
    }
  };
}
```

---

## 4. Exponential Backoff & Retry Pattern

```typescript
interface RetryOptions {
  retries?: number;
  minDelayMs?: number;
  maxDelayMs?: number;
  backoffFactor?: number;
  shouldRetry?: (error: any) => boolean;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    retries = 3,
    minDelayMs = 300,
    maxDelayMs = 5000,
    backoffFactor = 2,
    shouldRetry = () => true,
  } = options;

  let attempt = 0;
  let delay = minDelayMs;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt > retries || !shouldRetry(error)) {
        throw error;
      }
      
      // Add jitter to avoid thundering herd problem
      const jitter = Math.random() * 100;
      const sleepTime = Math.min(delay + jitter, maxDelayMs);
      
      await new Promise((resolve) => setTimeout(resolve, sleepTime));
      delay *= backoffFactor;
    }
  }
}
```

---

## 5. Graceful Degradation Checklist

- [ ] **Fallbacks**: Provide cached or stale data when external services fail.
- [ ] **Circuit Breakers**: Trip the breaker when downstream calls consistently fail to avoid cascading outages.
- [ ] **Timeout Enforcements**: Never allow outgoing requests without explicit AbortController timeouts.
- [ ] **UI Error Boundaries**: Render component-level fallbacks instead of crashing the entire page.

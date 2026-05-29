// src/auth/auth.middleware.ts

import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createHmac, timingSafeEqual } from 'crypto';

const logger = new Logger('AuthMiddleware');

function base64UrlDecode(value: string): string {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    '=',
  );
  return Buffer.from(padded, 'base64').toString('utf8');
}

function base64UrlEncode(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function verifyJwt(token: string, secret: string) {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Malformed JWT');
  }

  const [headerPart, payloadPart, signaturePart] = parts;
  const signingInput = `${headerPart}.${payloadPart}`;
  const expectedSignature = base64UrlEncode(
    createHmac('sha256', secret).update(signingInput).digest(),
  );

  const signatureBuffer = Buffer.from(signaturePart, 'utf8');
  const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    throw new Error('Invalid JWT signature');
  }

  const payloadJson = base64UrlDecode(payloadPart);
  const payload = JSON.parse(payloadJson) as Record<string, any>;
  const now = Math.floor(Date.now() / 1000);

  if (payload.exp && now >= payload.exp) {
    throw new Error('JWT expired');
  }

  if (payload.nbf && now < payload.nbf) {
    throw new Error('JWT not yet active');
  }

  return payload;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, _: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid auth format');
    }

    const secret = process.env.AUTH_JWT_SECRET ?? process.env.CLERK_JWT_SECRET;
    if (!secret) {
      logger.error('JWT secret is not configured for auth middleware');
      throw new UnauthorizedException('Auth configuration error');
    }

    let claims: Record<string, any>;
    try {
      claims = verifyJwt(token, secret);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorTrace = error instanceof Error ? error.stack : undefined;
      logger.error('Token validation failed', errorTrace);
      logger.debug(errorMessage);
      throw new UnauthorizedException('Invalid or expired authorization token');
    }

    const subject =
      claims.sub ?? claims.userId ?? claims.clerkUserId ?? claims.email;
    const clerkUserId = claims.clerkUserId ?? claims.sub ?? claims.userId;

    if (!subject || !clerkUserId) {
      logger.error('JWT missing required subject or clerkUserId claims');
      logger.debug(`Claims payload: ${JSON.stringify(claims)}`);
      throw new UnauthorizedException('Invalid authorization claims');
    }

    req.user = {
      id: subject,
      clerkUserId,
    };

    next();
  }
}

import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { envs } from '../../config';

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.header('x-api-key');

    if (!apiKey) {
      return res.status(401).json({ message: 'Falta clave API' });
    }

    if (apiKey !== envs.internalApiKey) {
      return res.status(403).json({ message: 'Clave API invalida' });
    }

    next();
  }
}

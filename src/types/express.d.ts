// src/types/express.d.ts

import { UserPayload } from './types';

declare global {
  namespace Express {
    export interface Request {
      user?: UserPayload;
    }
  }
}

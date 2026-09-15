import { Router } from 'express';
import { listErrorCodes } from '@manifestpay/error-codes';

export const errorsRouter = Router();

errorsRouter.get('/errors', (_req, res) => {
  res.json({ data: listErrorCodes() });
});

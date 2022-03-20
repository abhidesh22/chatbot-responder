import express = require('express');
import 'express-async-errors';
import { json } from 'body-parser';
import { chatbotRequestRouter } from './routes/chatbot-request';
import { errorHandler, NotFoundError } from '@cygnetops/common';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use('/', chatbotRequestRouter);

app.all('*', async (req: any, res: any) => {
    throw new NotFoundError();
});
app.use(errorHandler);

export { app };

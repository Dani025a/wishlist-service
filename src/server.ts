import app from './app';
import { MESSAGES } from './utils/messages';

const PORT = process.env.PORT || 1007;

app.listen(PORT, () => console.log(MESSAGES.SERVER_RUNNING.replace('{PORT}', PORT.toString())));


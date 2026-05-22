const PORT = process.env.PORT || 5001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;

export { PORT,
  CLIENT_URL,
  SERVER_URL
 };

import express from 'express';
import i18n from 'i18n';
import path from 'path';

// Initialize the express application
const app = express();

// Configure i18n
i18n.configure({
  locales: ['en', 'es'],
  directory: path.join(__dirname, 'i18n'),
  defaultLocale: 'en',
  autoReload: true,
  syncFiles: true,
  cookie: 'lang',
});

// Use i18n middleware
app.use(i18n.init);

// Set up a simple route to demonstrate multilingual support
app.get('/', (req, res) => {
  res.send(req.__('welcome_message')); // Example key for translation
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
# Multilingual Support App

This project implements multilingual support for a web application using TypeScript. It allows users to interact with the application in multiple languages, currently supporting English and Spanish.

## Project Structure

```
multilingual-support-app
├── src
│   ├── app.ts               # Entry point of the application
│   ├── i18n                 # Contains translation files
│   │   ├── en.json          # English translations
│   │   ├── es.json          # Spanish translations
│   │   └── index.ts         # i18n configuration and loading
│   └── types                # Type definitions
│       └── index.ts         # Type definitions for translations
├── package.json             # npm configuration and dependencies
├── tsconfig.json            # TypeScript configuration
└── README.md                # Project documentation
```

## Setup

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd multilingual-support-app
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Run the application:**
   ```
   npm start
   ```

## Usage

The application initializes with multilingual support, allowing users to switch between English and Spanish. The translations are managed through JSON files located in the `src/i18n` directory.

### Adding New Languages

To add support for a new language:

1. Create a new JSON file in the `src/i18n` directory (e.g., `fr.json` for French).
2. Add the corresponding key-value pairs for translations.
3. Update the `src/i18n/index.ts` file to include the new language.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License.
module.exports = {
  plugins: {
    'postcss-import': {
      // Procesar imports primero
    },
    'tailwindcss/nesting': {
      // Habilitar anidamiento CSS
    },
    tailwindcss: {},
    autoprefixer: {},
  },
}

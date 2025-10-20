const { configService } = require('./src/services/configService')

module.exports = async function() {
  try {
    // Load configuration from backend
    const config = await configService.getPrettierConfig()

    return {
      ...config,
      // Override some settings for consistency
      endOfLine: 'lf',
      // Add additional Prettier-specific options
      embeddedLanguageFormatting: 'auto',
      proseWrap: 'preserve',
      htmlWhitespaceSensitivity: 'css',
      vueIndentScriptAndStyle: false,
      // Astro-specific formatting
      astroAllowShorthand: false,
      astroSkipFrontmatter: false,
    }
  } catch (error) {
    console.error('Failed to load Prettier config from backend, using defaults:', error)

    // Fallback configuration
    return {
      printWidth: 100,
      tabWidth: 2,
      useTabs: false,
      semi: true,
      singleQuote: true,
      quoteProps: 'as-needed',
      trailingComma: 'es5',
      bracketSpacing: true,
      bracketSameLine: false,
      arrowParens: 'avoid',
      endOfLine: 'lf',
      embeddedLanguageFormatting: 'auto',
      proseWrap: 'preserve',
      htmlWhitespaceSensitivity: 'css',
      vueIndentScriptAndStyle: false,
      astroAllowShorthand: false,
      astroSkipFrontmatter: false,
    }
  }
}
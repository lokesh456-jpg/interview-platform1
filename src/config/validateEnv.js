const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
];

const optionalEnvVars = {
  PORT: '5000',
  NODE_ENV: 'development',
  CLIENT_URL: 'http://localhost:5173',
  FRONTEND_URL: 'http://localhost:5173',
  AI_PROVIDER: 'gemini',
  JWT_EXPIRES_IN: '7d',
};

function validateEnv() {
  const missing = [];
  
  for (const key of requiredEnvVars) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  // Set defaults for optional vars
  for (const [key, defaultVal] of Object.entries(optionalEnvVars)) {
    if (!process.env[key]) {
      process.env[key] = defaultVal;
    }
  }

  if (missing.length > 0) {
    console.error('\n❌ Missing required environment variables:');
    missing.forEach(k => console.error(`   - ${k}`));
    console.error('\nCopy backend/.env.example to backend/.env and fill in your values.\n');
    process.exit(1);
  }

  // Validate AI provider config
  const aiProvider = process.env.AI_PROVIDER;
  if (aiProvider === 'openai' && !process.env.OPENAI_API_KEY) {
    console.warn('⚠️  AI_PROVIDER=openai but OPENAI_API_KEY is not set. AI features will be disabled.');
  }
  if (aiProvider === 'gemini' && !process.env.GEMINI_API_KEY) {
    console.warn('⚠️  AI_PROVIDER=gemini but GEMINI_API_KEY is not set. AI features will be disabled.');
  }
  if (!process.env.CLOUDINARY_API_KEY) {
    console.warn('⚠️  Cloudinary not configured. Resume file storage will be unavailable.');
  }

  console.log('✅ Environment validated successfully');
}

module.exports = { validateEnv };

const env = process.env.NODE_ENV || 'development';

if (env === 'development' || env === 'test') {
  const config = require('./config.json');
  const envConfig = config[env];

  for (const key in envConfig) {
    process.env[key] = envConfig[key];
  }
} 
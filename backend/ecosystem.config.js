module.exports = {
  apps: [{
    name: 'navigatio-backend',
    script: './server.js',
    instances: 'max',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://ayush199816:jpODnVQiVDGs5Xv4@navigatio.9ure2jk.mongodb.net/',
      JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
      JWT_EXPIRE: '30d',
      GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    time: true
  }]
};

require('dotenv').config();
module.exports = {
  port: process.env.APP_PORT || 8000,
  redisUrl: process.env.REDIS_URL,
  jwtSecret: process.env.JWT_SECRET,
  apiUser: process.env.API_USER,
  apiPass: process.env.API_PASS,
  apiAuthUrl: process.env.API_AUTH_URL,
  apiPosUrl: process.env.API_POS_URL
};

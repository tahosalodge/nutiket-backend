const Joi = require('joi');
require('dotenv').config();

// define validation for all the env vars
const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string()
    .allow(['development', 'production'])
    .default('development'),
  PORT: Joi.number().default(4000),
  JWT_SECRET: Joi.string()
    .required()
    .description('JWT Secret required to sign'),
  MONGO_URL: Joi.string()
    .required()
    .description('Database credentials required.'),
})
  .unknown()
  .required();

const { error, value: env } = Joi.validate(process.env, envVarsSchema);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  env: env.NODE_ENV,
  port: env.PORT,
  jwtSecret: env.JWT_SECRET,
  mongoUrl: env.MONGO_URL,
};

module.exports = config;

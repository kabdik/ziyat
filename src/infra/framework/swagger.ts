import { DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger';

import { ServerConfig } from '../config/server.config';

export const swaggerPath = ServerConfig.apiPrefix;

export const swaggerDocumentOptions = new DocumentBuilder()
  .setTitle('clean-architecture-nest')
  .setDescription(
    '\n\n## Congratulations! Your service resource is ready.' +
      '\n  \nPlease note that all endpoints are secured with JWT Bearer authentication.' +
      '\nBy default, your service resource comes with one user with the username' +
      ' "admin" and password "admin"',
  )
  .setVersion('fhgoc2zq')
  .addBearerAuth()
  .build();

export const swaggerSetupOptions: SwaggerCustomOptions = {
  swaggerOptions: {
    persistAuthorization: true,
  },
  customSiteTitle: 'clean-architecture-nest',
};

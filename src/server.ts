import {
    hasZodFastifySchemaValidationErrors,
    serializerCompiler,
    validatorCompiler,
    type ZodTypeProvider,
} from '@fastify/type-provider-zod';
import { fastify, type FastifyRequest } from 'fastify';
import { transcriptionRoutes } from './routes/transcription-route.ts';
import { type User } from './types/auth.ts';

const app = fastify({
  logger: true,
}).withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.setErrorHandler((error, _, reply) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.code(400).send({
      message: error.message,
      issues: error.validation,
    });
  }

  return reply.status(500).send({ message: 'Internal Server Error', details: (error as Error).message });
});

app.get('/', async (request: FastifyRequest) => {
  return { hello: 'world' };
});

// Register auth-protected routes as a plugin
app.register(async function protectedRoutes(app) {
  app.addHook('preHandler', (request, _, done) => {
     const user: User = {
      id: "123",
      name: "John Doe",
      email: "john.doe@example.com"
    }

    request.user = user;
    done();
  });

  app.register(transcriptionRoutes);
});

const start = async () => {
  try {
    await app.listen({ port: 3000 });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

import swagger from "@fastify/swagger";
import {
  hasZodFastifySchemaValidationErrors,
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "@fastify/type-provider-zod";
import scalarApiReference from "@scalar/fastify-api-reference";
import { fastify } from "fastify";
import { videoRoutes } from "./routes/video-route.ts";
import { ERROR_CODES } from "./schemas/error-schemas.ts";
import { type User } from "./types/auth.ts";
import { isDatabaseError, mapDatabaseError } from "./utils/database-errors.ts";

const app = fastify({
  logger: true,
}).withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(swagger, {
  transform: jsonSchemaTransform,
  openapi: {
    openapi: "3.0.0",
    info: {
      title: "AI Social Media",
      description: "API to manage videos from YouTube.",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
  },
});

app.register(scalarApiReference, {
  routePrefix: "/api/docs",
  openApiDocumentEndpoints: {
    json: "/json",
    yaml: "/yaml",
  },
});

app.setErrorHandler((error, _, reply) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(400).send({
      statusCode: 400,
      message: error.message,
      code: ERROR_CODES.validation,
      issues: error.validation,
    });
  }

  if (isDatabaseError(error)) {
    const mapped = mapDatabaseError(error);
    return reply.status(mapped.statusCode).send(mapped);
  }

  return reply.status(500).send({
    statusCode: 500,
    message: "Internal Server Error",
    code: ERROR_CODES.rootApplication,
    details: (error as Error).message,
  });
});

app.get("/", async () => {
  return { hello: "world" };
});

// Register auth-protected routes as a plugin
app.register(async function protectedRoutes(app) {
  app.addHook("preHandler", (request, _, done) => {
    const user: User = {
      id: "123",
      name: "John Doe",
      email: "john.doe@example.com",
    };

    request.user = user;
    done();
  });

  app.register(videoRoutes);
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

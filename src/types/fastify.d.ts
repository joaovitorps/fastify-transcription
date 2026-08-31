import { User } from "./auth.ts";

declare module 'fastify' {
  interface FastifyRequest {
    user: User;
  }
}

import assert from "assert";
import { type FastifyInstance } from "fastify";

export async function createVideo(
  app: FastifyInstance,
  url: string,
): Promise<{ id: string }> {
  const response = await app.inject({
    method: "POST",
    url: "/api/v2/video",
    payload: { url },
  });

  assert.equal(response.statusCode, 201);
  return response.json();
}

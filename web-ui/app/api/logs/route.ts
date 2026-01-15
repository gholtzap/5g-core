import Docker from "dockerode";
import { NextRequest } from "next/server";
import { Readable } from "stream";

const docker = new Docker({ socketPath: "/var/run/docker.sock" });

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const container = searchParams.get("container");

  if (!container) {
    return new Response("Container name required", { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const dockerContainer = docker.getContainer(container);

        const logStream = (await dockerContainer.logs({
          follow: true,
          stdout: true,
          stderr: true,
          timestamps: true,
          tail: 100,
        })) as unknown as Readable;

        logStream.on("data", (chunk: Buffer) => {
          const message = chunk.toString("utf-8");
          const lines = message.split("\n").filter((line) => line.trim());

          for (const line of lines) {
            const cleanLine = line.replace(/[\x00-\x08]/g, "");
            if (cleanLine.trim()) {
              const data = `data: ${JSON.stringify({
                timestamp: new Date().toISOString(),
                message: cleanLine,
                container,
              })}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
          }
        });

        logStream.on("error", (error: Error) => {
          console.error("Log stream error:", error);
          controller.error(error);
        });

        logStream.on("end", () => {
          controller.close();
        });

        request.signal.addEventListener("abort", () => {
          logStream.destroy();
          controller.close();
        });
      } catch (error) {
        console.error("Failed to attach to container logs:", error);
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

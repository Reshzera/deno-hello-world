import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { join } from "@std/path";

interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

const PORT = Number(Deno.env.get("PORT") ?? "8000");
const NAME = Deno.env.get("NAME") ?? "Deno Fan";

const dataDir = "./todo";

//Deno fs
await Deno.mkdir(dataDir, { recursive: true });
const filePath = join(Deno.cwd(), dataDir, "hello.txt");
const helloText = `Name: ${NAME} \nUUID: ${crypto.randomUUID()}\nTime: ${new Date().toISOString()}\n`;
await Deno.writeTextFile(filePath, helloText, { append: true });
const fileContents = await Deno.readTextFile(filePath);
console.log(fileContents);

//Deno default way to do request
const controller = new AbortController();
const todoUrl = "https://jsonplaceholder.typicode.com/todos/1";
const todoRes = await fetch(todoUrl, { signal: controller.signal });
const todo = await todoRes.json();

//starting a simple server
Deno.serve({ port: PORT }, async (req: Request) => {
  const url = new URL(req.url);

  if (url.pathname === "/health") {
    return new Response("ok", { headers: { "content-type": "text/plain" } });
  }

  if (url.pathname === "/append" && req.method === "POST") {
    const body = await req.text();
    await Deno.writeTextFile(filePath, body + "\n", { append: true });
    return Response.json({ status: "appended", bytes: body.length });
  }

  const file = await Deno.readTextFile(filePath);

  const payload = {
    runtime: {
      deno: Deno.version.deno,
      v8: Deno.version.v8,
      typescript: Deno.version.typescript,
      build: Deno.build,
    },
    env: {
      PORT,
      NAME,
    },
    webApis: {
      uuid: crypto.randomUUID(),
      nowISO: new Date().toISOString(),
    },
    fetchDemo: {
      from: todoUrl,
      todo,
    },
    fileDemo: {
      path: filePath,
      preview: file,
      lines: file.split("\n").length,
    },
    request: {
      url: req.url,
      method: req.method,
      ua: req.headers.get("user-agent"),
    },
  };

  return Response.json(payload, {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
});

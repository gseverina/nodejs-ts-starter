import http from 'node:http';
import { parse } from 'node:url';
import crypto from "node:crypto";
import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLE_NAME } from "./dynamo.js";

console.log('Creating server...');

const server = http.createServer(async (req, res) => {
    try {
        const { pathname, query } = parse(req.url ?? "/", true);
        const method = req.method ?? "GET";

        console.log("Request:", method, pathname);

        // GET /healthz
        if (method == "GET" && pathname == "/healthz") {
            return json(res, 200, { ok: true });
        }

        // GET /hello>name=Gaston
        if (method === "GET" && pathname === "/hello") {
            const name = typeof query.name === "string" ? query.name : "world";
            return json(res, 200, { message: `Hello ${name}` });
        }

        // POST /echo
        if (method === "POST" && pathname === "/echo") {
            const body = await readJson(req);
            return json(res, 200, { received: body });
        }
        // POST /users
        if (method === "POST" && pathname === "/users") {
            const body = await readJson(req) as { name?: string; email?: string };
          
            const id = crypto.randomUUID();
            const item = {
              pk: `USER#${id}`,
              sk: "PROFILE",
              id,
              ...body,
            };
          
            await ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
            return json(res, 201, item);
          }

          // GET /users?id=123
          if (method === "GET" && pathname === "/users") {
            const id = typeof query.id === "string" ? query.id : null;
            if (!id) return json(res, 400, { error: "Missing query param: id" });
          
            const out = await ddb.send(
              new GetCommand({
                TableName: TABLE_NAME,
                Key: { pk: `USER#${id}`, sk: "PROFILE" },
              })
            );
          
            return json(res, 200, { item: out.Item ?? null });
          }

        return json(res, 404, { error: "Not Found" });
    } catch (error) {
        console.error("Handler error:", error);
        return json(res, 500, { error: "Internal Server Error" });
    }
});

server.on('error', (err) => {
    console.error('Server error:', err);
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});

console.log('Server setup complete');

function json(res, status, body) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
}

async function readJson(req) {
    let raw = "";
    for await (const chunk of req) raw += chunk;
    if (!raw) return {};
    return JSON.parse(raw);
}

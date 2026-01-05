# Plain Node.js + TypeScript + DynamoDB Local Starter

## Project Structure

```
.
├── src/
│   ├── server.ts          # HTTP server and routes
│   ├── dynamo.ts          # DynamoDB client configuration
│   └── scripts/
│       └── create-table.ts # Creates DynamoDB tables for local dev
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── .gitignore
├── .dockerignore
└── README.md
```

This is a minimal, framework-free Node.js + TypeScript backend starter with DynamoDB Local.

## Requirements
- Node >= 20
- Docker

## Install
npm install

## Run (recommended: DynamoDB in Docker, app locally)
npm run infra:up
# create table (only needed when DynamoDB Local is empty/in-memory)
npm run ddb:init

# export env (or use your shell / .env loader)
export AWS_REGION=us-east-1
export DYNAMODB_ENDPOINT=http://localhost:8000
export DYNAMODB_TABLE=users
export AWS_ACCESS_KEY_ID=local
export AWS_SECRET_ACCESS_KEY=local

npm run dev

## Run everything in Docker
docker compose up -d
# if DynamoDB is in-memory, init the table in the container:
docker compose exec api sh -lc "npm run ddb:init"

## Build + run production JS
npm run build
npm start
import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from "@aws-sdk/client-dynamodb";

const region = process.env.AWS_REGION ?? "us-east-1";
const endpoint = process.env.DYNAMODB_ENDPOINT ?? "http://localhost:8000";
const table = process.env.DYNAMODB_TABLE ?? "users";

const client = new DynamoDBClient({
  region,
  endpoint,
  credentials: { accessKeyId: "local", secretAccessKey: "local" },
});

async function main(): Promise<void> {
  try {
    await client.send(new DescribeTableCommand({ TableName: table }));
    console.log(`Table already exists: ${table}`);
    return;
  } catch {
    // fallthrough
  }

  await client.send(
    new CreateTableCommand({
      TableName: table,
      BillingMode: "PAY_PER_REQUEST",
      AttributeDefinitions: [
        { AttributeName: "pk", AttributeType: "S" },
        { AttributeName: "sk", AttributeType: "S" },
      ],
      KeySchema: [
        { AttributeName: "pk", KeyType: "HASH" },
        { AttributeName: "sk", KeyType: "RANGE" },
      ],
    })
  );

  console.log(`Created table: ${table}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
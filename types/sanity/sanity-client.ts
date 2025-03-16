import { createClient } from "next-sanity";
const client = createClient({
  projectId: "evw8b7bx",
  dataset: "production",
  apiVersion: "2024-07-23",
  useCdn: true,
});

export default client;

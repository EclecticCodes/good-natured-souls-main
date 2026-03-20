import { defineConfig } from "sanity";
import { visionTool } from "@sanity/vision";
import { defineStructure } from "@sanity/structure"; // Correct way to import structure
import schemas from "./sanity/Schemas";

const config = defineConfig({
  projectId: "evw8b7bx",
  dataset: "production",
  title: "Good Natured Souls",
  basePath: "/admin",
  plugins: [
    visionTool(),
    defineStructure()  // Define your structure here
  ],
  schema: { types: schemas },
});

export default config;

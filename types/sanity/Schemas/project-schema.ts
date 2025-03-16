const project = {
  name: "project",
  title: "Projects",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Name",
      type: "string",
    },
    {
      name: "type",
      type: "string",
      title: "Type",
      options: {
        list: [
          { title: "Album", value: "album" },
          { title: "Single", value: "single" },
        ],
      },
    },
    {
      name: "artist",
      type: "reference",
      to: [{ type: "artist" }],
      title: "Artist",
    },
    {
      name: "featured",
      type: "array",
      of: [{ type: "reference", to: [{ type: "artist" }] }],
      title: "Featured Artists",
    },
    {
      name: "cover",
      title: "Cover",
      type: "image",
      options: { hotspot: true },
      fields: [
        {
          name: "alt",
          title: "Alt",
          type: "string",
        },
      ],
    },
    {
      name: "url",
      title: "URL",
      type: "url",
    },
    {
      name: "releaseYear",
      type: "string",
      title: "Release Year",
    },
  ],
};

export default project;

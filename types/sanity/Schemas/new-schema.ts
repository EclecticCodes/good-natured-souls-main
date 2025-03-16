const news = {
    name: "news",
    title: "News",
    type: "document",
    fields: [
      {
        name: "headline",
        title: "Headline",
        type: "string",
      },
      {
        name: "publishedAt",
        title: "Published At",
        type: "datetime",
      },
    ],
    orderings: [
      {
        title: "Latest First",
        name: "latest",
        by: [{ field: "publishedAt", direction: "desc" }],
      },
    ],
  };
  
  export default news;
  
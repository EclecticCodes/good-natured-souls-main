import { defineType, defineField } from "sanity";

export default defineType({
  name: "show",
  title: "Shows",
  type: "document",
  fields: [
    defineField({
      name: "artist",
      title: "Artist",
      type: "reference",
      to: [{ type: "artist" }],
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "datetime",
    }),
    defineField({
      name: "ticketLink",
      title: "Buy Ticket Link",
      type: "url",
      description: "Link to purchase tickets",
    }),
  ],
});

"use client";

import { NextStudio } from "next-sanity/studio";
import config from "@/types/sanity.config";

type Props = {};

const AdminPage = (props: Props) => {
  return <NextStudio config={config} />;
};

export default AdminPage;

"use client";

import React from "react";
import config from "../../../sanityconfig"
import { NextStudio } from "next-sanity/studio";

type Props = {};

const AdminPage = (props: Props) => {
  return <NextStudio config={config} />;
};

export default AdminPage;

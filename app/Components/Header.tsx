import React from "react";

type Props = {
  children: React.ReactNode;
};

const Header = ({ children }: Props) => {
  return (
    <section className="border-b-2 border-t-2 border-text w-full md:py-6 md:px-8 py-4 px-6">
      {children}
    </section>
  );
};

export default Header;

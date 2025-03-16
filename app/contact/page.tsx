"use client";
import { PageWrapper } from "../Components/PageWrapper";
import Header from "../Components/Header";

export default function contactPage() {
  return (
    <PageWrapper>
      {/* Header Section */}
      <section className="text-center my-8">
        <Header>
          <h1 className="text-4xl font-bold">Contact us</h1>
        </Header>
      </section>

      {/* Main Layout - Image on Left, Text on Right */}
      <main className="max-w-6xl mx-auto p-6 flex flex-col md:flex-row items-center gap-8">
        {/* Left Side - Image Container */}
        <section className="flex-1 flex justify-center">
          <img
            src="images/jumbotronTwo.jpg"
            alt="About Us"
            className="w-full max-w-md rounded-lg shadow-lg"
          />
        </section>

        {/* Right Side - Text Container */}
        <section className="flex-1">
          <h2 className="text-4xl font-bold mb-4">Contact US</h2>
          <p className="text-lg mb-4">
          </p>

          <h3 className="text-2xl font-bold mb-4">Business Inquiries</h3>
          <p className="text-lg">goodnaturedsouls@gmail.com</p>
        </section>
      </main>
    </PageWrapper>
  );
}

{/* add a form document to allow users to input data */}
 

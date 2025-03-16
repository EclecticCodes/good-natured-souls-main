"use client";
import { PageWrapper } from "../Components/PageWrapper";
import Header from "../Components/Header";

export default function AboutPage() {
  return (
    <PageWrapper>
      {/* Header Section */}
      <section className="text-center my-8">
        <Header>
          <h1 className="text-4xl font-bold">About Us</h1>
        </Header>
      </section>

      {/* Main Layout - Image on Left, Text on Right */}
      <main className="max-w-6xl mx-auto p-6 flex flex-col md:flex-row items-center gap-8">
        {/* Left Side - Image Container */}
        <section className="flex-1 flex justify-center">
          <img
            src="/images/jumbotronFive.jpg"
            alt="About Us"
            className="w-full max-w-md rounded-lg shadow-lg"
          />
        </section>

        {/* Right Side - Text Container */}
        <section className="flex-1">
          <h2 className="text-4xl font-bold mb-4">Our Story</h2>
          <p className="text-lg mb-4">
            Welcome to Good Natured Souls, a media company thriving in the cultural epicenter of New York City. We're here to nurture and showcase the vibrant, authentic talent that our city has to offer. Our name reflects our core belief that creativity flourishes best when it’s rooted in kindness, purpose, and a deep connection to the community. Guided by our motto, <strong>"Exist Altruistic,"</strong> we aim to be a beacon of positivity and artistic growth and set the standard for excellence in the music industry.
          </p>

          <h3 className="text-2xl font-bold mb-4">Business Inquiries</h3>
          <p className="text-lg">goodnaturedsouls@gmail.com</p>
        </section>
      </main>
    </PageWrapper>
  );
}

{/* 
  **Link the contact page to the about page 
  ** Add a message to our founder section to the about page
  ** add a scrolling message saying " Good Natured Souls Exist altruistic"
  ** adding contact us today


   */}
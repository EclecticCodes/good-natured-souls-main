import Image from "next/image";
import dvdGif from "../../public/images/dvd.gif";

type Props = {};

const Description = (props: Props) => {
  return (
    <section className="w-full py-20 flex flex-col space-y-8 justify-center items-center">
      <Image src={dvdGif} alt="about" className="h-32 w-32" />
      <article className=" px-8 lg:max-w-screen-lg max-w-screen-sm md:text-3xl text-2xl text-center">
        <span className="font-bold">Good Natured Souls</span> is a New York City
        based independent music label representing up and coming Hip hop and R&B
        acts.
      </article>
      <a
        className="bg-accent hover:bg-accentInteraction transition-colors duration-300 font-bold text-2xl px-8 py-2 rounded-sm"
        href="/about"
      >
        About Us
      </a>
    </section>
  );
};

export default Description;

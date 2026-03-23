import Image from "next/image";
import dvdGif from "../../public/images/dvd.gif";

type Props = {
  bio?: string | null;
};

const Description = ({ bio }: Props) => {
  return (
    <section className="w-full py-16 md:py-20 flex flex-col space-y-6 justify-center items-center px-4">
      <Image src={dvdGif} alt="about" className="h-24 w-24 md:h-32 md:w-32" />
      <article className="max-w-2xl text-xl md:text-3xl text-center leading-relaxed">
        {bio ? (
          <span>{bio}</span>
        ) : (
          <>
            <span className="font-bold">Good Natured Souls</span> is a New York City
            based independent music label representing up and coming Hip hop and R&B acts.
          </>
        )}
      </article>
      <a
        className="bg-accent hover:bg-accentInteraction transition-colors duration-300 font-oswald font-bold text-base md:text-xl tracking-widest px-8 py-3 w-full max-w-xs text-center text-primary"
        href="/about"
      >
        ABOUT US
      </a>
    </section>
  );
};

export default Description;
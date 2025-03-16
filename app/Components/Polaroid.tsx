import { memo } from "react";

type Props = {
  profileImage: string;
  signature: string;
};

const Polaroid = ({ profileImage, signature }: Props) => {
  console.log("Polaroid rendered");

  return (
    <div>
      <div className="bg-white inline-flex flex-col gap-3 p-5">
        <img
          src={profileImage}
          alt="artist"
          className="w-96 h-96 object-cover"
        />
        <p className="text-secondary text-right font-homemadeApple text-3xl pt-8 pb-1">
          {signature}
        </p>
      </div>
    </div>
  );
};

export default memo(Polaroid);

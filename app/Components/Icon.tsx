import React from "react";

export type IconName =
  | "apple"
  | "spotify"
  | "instagram"
  | "twitter"
  | "chevronLeft"
  | "arrowLeft"
  | "arrowRight";

type Props = {
  name: IconName;
  color?: "white" | "black";
};

const Icon = ({ name, color = "white" }: Props) => {
  const hexColor = color === "white" ? "#fff" : "#000";
  // Create a dictionary of icons
  const icons: { [key in IconName]: React.ReactElement } = {
    apple: (
      <svg
        fill="none"
        viewBox="0 0 24 24"
        width="24"
        height="24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clip-rule="evenodd" fill={hexColor} fill-rule="evenodd">
          <path d="m19.1001 19.16c.59-.9.81-1.36 1.26-2.37-3.32-1.26-3.85-5.99-.57-7.80001-1-1.26-2.41-1.98999-3.74-1.98999-.96 0-1.62.25001-2.21.48001-.5.19-.95.35999-1.51.35999-.6 0-1.13-.18999-1.69-.38999-.61-.22-1.25004-.45001-2.05004-.45001-1.49 0-3.07999.91-4.08999 2.47-1.42 2.2-1.17 6.32 1.12 9.84.82 1.26 1.92 2.67 3.35 2.69.6.01.99-.17 1.42003-.36.49-.22 1.02-.46 1.95-.46.93-.01 1.45.24 1.94.46.42.19.8.37 1.39.36 1.45-.02 2.61-1.58 3.43-2.84z" />
          <path d="m15.8404 2c.16 1.1-.29 2.19001-.88 2.95001-.63.82-1.73 1.45999-2.79 1.41999-.19-1.06.3-2.15001.9-2.88001.67-.8 1.8-1.41999 2.77-1.48999z" />
        </g>
      </svg>
    ),
    spotify: (
      <svg
        viewBox="-2 -2 20 20"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
      >
        <path
          d="M8 0c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.56-8-8-8zm3.68 11.56c-.16.24-.44.32-.68.16-1.88-1.16-4.24-1.4-7.04-.76-.28.08-.52-.12-.6-.36-.08-.28.12-.52.36-.6 3.04-.68 5.68-.4 7.76.88.28.12.32.44.2.68zm.96-2.2c-.2.28-.56.4-.84.2-2.16-1.32-5.44-1.72-7.96-.92-.32.08-.68-.08-.76-.4s.08-.68.4-.76c2.92-.88 6.52-.44 9 1.08.24.12.36.52.16.8zm.08-2.24c-2.56-1.52-6.84-1.68-9.28-.92-.4.12-.8-.12-.92-.48-.12-.4.12-.8.48-.92 2.84-.84 7.52-.68 10.48 1.08.36.2.48.68.28 1.04-.2.28-.68.4-1.04.2z"
          fill={hexColor}
        ></path>
      </svg>
    ),
    instagram: (
      <svg
        fill={hexColor}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        data-name="Layer 1"
      >
        <path d="M17.34,5.46h0a1.2,1.2,0,1,0,1.2,1.2A1.2,1.2,0,0,0,17.34,5.46Zm4.6,2.42a7.59,7.59,0,0,0-.46-2.43,4.94,4.94,0,0,0-1.16-1.77,4.7,4.7,0,0,0-1.77-1.15,7.3,7.3,0,0,0-2.43-.47C15.06,2,14.72,2,12,2s-3.06,0-4.12.06a7.3,7.3,0,0,0-2.43.47A4.78,4.78,0,0,0,3.68,3.68,4.7,4.7,0,0,0,2.53,5.45a7.3,7.3,0,0,0-.47,2.43C2,8.94,2,9.28,2,12s0,3.06.06,4.12a7.3,7.3,0,0,0,.47,2.43,4.7,4.7,0,0,0,1.15,1.77,4.78,4.78,0,0,0,1.77,1.15,7.3,7.3,0,0,0,2.43.47C8.94,22,9.28,22,12,22s3.06,0,4.12-.06a7.3,7.3,0,0,0,2.43-.47,4.7,4.7,0,0,0,1.77-1.15,4.85,4.85,0,0,0,1.16-1.77,7.59,7.59,0,0,0,.46-2.43c0-1.06.06-1.4.06-4.12S22,8.94,21.94,7.88ZM20.14,16a5.61,5.61,0,0,1-.34,1.86,3.06,3.06,0,0,1-.75,1.15,3.19,3.19,0,0,1-1.15.75,5.61,5.61,0,0,1-1.86.34c-1,.05-1.37.06-4,.06s-3,0-4-.06A5.73,5.73,0,0,1,6.1,19.8,3.27,3.27,0,0,1,5,19.05a3,3,0,0,1-.74-1.15A5.54,5.54,0,0,1,3.86,16c0-1-.06-1.37-.06-4s0-3,.06-4A5.54,5.54,0,0,1,4.21,6.1,3,3,0,0,1,5,5,3.14,3.14,0,0,1,6.1,4.2,5.73,5.73,0,0,1,8,3.86c1,0,1.37-.06,4-.06s3,0,4,.06a5.61,5.61,0,0,1,1.86.34A3.06,3.06,0,0,1,19.05,5,3.06,3.06,0,0,1,19.8,6.1,5.61,5.61,0,0,1,20.14,8c.05,1,.06,1.37.06,4S20.19,15,20.14,16ZM12,6.87A5.13,5.13,0,1,0,17.14,12,5.12,5.12,0,0,0,12,6.87Zm0,8.46A3.33,3.33,0,1,1,15.33,12,3.33,3.33,0,0,1,12,15.33Z" />
      </svg>
    ),
    twitter: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        fill={hexColor}
      >
        <path d="M23.953 4.569c-.885.392-1.83.656-2.825.775 1.017-.61 1.798-1.572 2.163-2.719-.951.564-2.005.974-3.127 1.195-.896-.955-2.17-1.554-3.582-1.554-2.71 0-4.916 2.205-4.916 4.92 0 .385.043.76.127 1.124-4.083-.205-7.693-2.159-10.126-5.13-.425.729-.667 1.577-.667 2.485 0 1.71.869 3.215 2.188 4.096-.807-.026-1.566-.248-2.23-.616v.061c0 2.393 1.697 4.378 3.946 4.827-.413.111-.849.171-1.293.171-.316 0-.624-.031-.927-.089.624 1.947 2.438 3.357 4.587 3.397-1.68 1.318-3.808 2.104-6.115 2.104-.397 0-.79-.023-1.18-.069 2.188 1.403 4.775 2.223 7.564 2.223 9.053 0 14.002-7.497 14.002-13.986 0-.21-.005-.42-.014-.63.962-.696 1.8-1.564 2.464-2.548z" />
      </svg>
    ),
    chevronLeft: (
      <svg
        width="24"
        height="24"
        viewBox="2 2 16 16"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 16a.997.997 0 01-.707-.293l-5-5a.999.999 0 010-1.414l5-5a.999.999 0 111.414 1.414L8.414 10l4.293 4.293A.999.999 0 0112 16z"
          fill={hexColor}
        />
      </svg>
    ),
    arrowLeft: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M17 9H5.414l3.293-3.293a.999.999 0 10-1.414-1.414l-5 5a.999.999 0 000 1.414l5 5a.997.997 0 001.414 0 .999.999 0 000-1.414L5.414 11H17a1 1 0 100-2z"
          fill={hexColor}
        />
      </svg>
    ),
    arrowRight: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M17.707 9.293l-5-5a.999.999 0 10-1.414 1.414L14.586 9H3a1 1 0 100 2h11.586l-3.293 3.293a.999.999 0 101.414 1.414l5-5a.999.999 0 000-1.414z"
          fill={hexColor}
        />
      </svg>
    ),
  };

  // Conditional rendering
  const IconComponent = icons[name] || <div>Icon not found</div>;

  return <>{IconComponent}</>;
};

export default Icon;

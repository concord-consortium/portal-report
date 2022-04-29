import * as React from "react";

const kDefaultHeight = "32px";
const kDefaultWidth = "32px";

export interface IAudioIconProps {
  className?: string;
  height?: string;
  width?: string;
}

export const AudioIcon = (props: IAudioIconProps) => {
  const className = props.className ? props.className : "";
  const height = props.height ? props.height : kDefaultHeight;
  const width = props.width ? props.width : kDefaultWidth;

  return(
    <svg
      className={className}
      height={height}
      viewBox="0 0 32 32"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12,24C5.4,24,0,18.6,0,12S5.4,0,12,0s12,5.4,12,12S18.6,24,12,24z M12,10.3c0.9,0,1.7,0.8,1.7,1.7s-0.8,1.7-1.7,1.7V16 c2.2,0,4-1.8,4-4s-1.8-4-4-4V10.3z M12,3.4v2.3c3.4,0,6.3,2.9,6.3,6.3s-2.9,6.3-6.3,6.3v2.3c4.7,0,8.6-3.9,8.6-8.6S16.7,3.4,12,3.4z"/>
    </svg>
  );
};

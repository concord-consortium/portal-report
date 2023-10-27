import * as React from "react";

const kDefaultHeight = "24";
const kDefaultWidth = "24";

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
      viewBox={`0 0 45 45`}
      width={width}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M22.5 5C32.165 5 40 12.835 40 22.5c0 9.131-6.993 16.629-15.916 17.43v-5.873c5.193-.76 9.5-5.225 9.5-10.64h-2.692c0 4.75-4.022 8.075-8.392 8.075-4.37 0-8.392-3.325-8.392-8.075h-2.691c0 5.399 4.306 9.864 9.5 10.64v5.872C11.992 39.13 5 31.631 5 22.5 5 12.835 12.835 5 22.5 5zm0 4.167a4.744 4.744 0 0 0-4.75 4.75v9.5a4.744 4.744 0 0 0 4.75 4.75 4.73 4.73 0 0 0 4.734-4.75l.016-9.5a4.744 4.744 0 0 0-4.75-4.75z" />
    </svg>
  );
};

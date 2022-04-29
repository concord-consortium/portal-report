import * as React from "react";

const kDefaultHeight = "32px";
const kDefaultWidth = "32px";

export interface IQOpenResponseIconProps {
  className?: string;
  height?: string;
  width?: string;
}

export const QOpenResponseIcon = (props: IQOpenResponseIconProps) => {
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
      <g>
          <path d="M20 0L20 20 0 20 0 0z" transform="translate(5 5)"/>
          <path fill="#FFF" d="M18 2L2 2 2 18 18 18z" transform="translate(5 5)"/>
          <path d="M12 13v2H5v-2h7zm3-4v2H5V9h10zm0-4v2H5V5h10z" transform="translate(5 5)"/>
      </g>
    </svg>
  );
};

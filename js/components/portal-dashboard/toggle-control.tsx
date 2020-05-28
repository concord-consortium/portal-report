import React, { useState } from "react";

import css from "../../../css/portal-dashboard/toggle-control.less";

interface IProps {
  onToggle?: (value: boolean) => void;
}

export const ToggleControl: React.FC<IProps> = (props) => {
  const [toggleOn, setToggleOn] = useState(false);

  const handleToggle = () => {
    props.onToggle && props.onToggle(!toggleOn);
    setToggleOn(!toggleOn);
  };

  const onClass = toggleOn ? css.toggleOn : "";

  return (
    <div className={css.toggle} onClick={handleToggle}>
      <div className={`${css.track} ${onClass}`}/>
      <div className={`${css.ball} ${onClass}`}/>
    </div>
  );
};

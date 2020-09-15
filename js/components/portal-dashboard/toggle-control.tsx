import React, { useState, useEffect } from "react";

import css from "../../../css/portal-dashboard/toggle-control.less";

interface IProps {
  onToggle?: (value: boolean) => void;
  toggleState?: boolean;
}

export const ToggleControl: React.FC<IProps> = (props) => {
  const [toggleOn, setToggleOn] = useState(false);

  useEffect(() => {
    if (props.toggleState !== undefined) {
      setToggleOn(props.toggleState);
    }
  }, [props.toggleState]);

  const handleToggle = () => {
    props.onToggle && props.onToggle(!toggleOn);
    if (props.toggleState === undefined) {
      setToggleOn(!toggleOn);
    }
  };

  const onClass = toggleOn ? css.toggleOn : "";

  return (
    <div className={css.toggle} onClick={handleToggle} data-cy="toggle-control">
      <div className={`${css.track} ${onClass}`}/>
      <div className={`${css.ball} ${onClass}`}/>
    </div>
  );
};

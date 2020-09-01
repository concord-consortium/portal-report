import React, { useState }  from "react";
// TODO: replace with new model
import ImageAnswerModal from "../../report/image-answer-modal";
import { MagnifyIcon } from "./magnify-icon";
import useResizeObserver from "@react-hook/resize-observer";

import css from "../../../../css/portal-dashboard/answers/image-answer.less";

interface IProps {
  answer: Map<any, any>;
  staticSize?: boolean;
}

const kStaticHeight = 250;
const kStaticWidth = 250;

export const ImageAnswer: React.FC<IProps> = (props) => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleShowModal = (show: boolean) => () => {
    setModalOpen(show);
  };

  const { answer, staticSize } = props;
  const imgAnswer = answer.get("answer");

  // cf. https://www.npmjs.com/package/@react-hook/resize-observer
  const useSize = (target: any) => {
    const [size, setSize] = React.useState();

    React.useLayoutEffect(() => {
      setSize(target.current.getBoundingClientRect());
    }, [target]);

    useResizeObserver(target, (entry: any) => setSize(entry.contentRect));
    return size;
  };

  const divTarget = React.useRef(null);
  const divSize: any = useSize(divTarget);
  const containerHeight: number = staticSize ? kStaticHeight: divSize && divSize.height;
  const containerWidth: number = staticSize ? kStaticWidth : divSize && divSize.width;

  const [naturalWidth, setNaturalWidth] = useState(0);
  const [naturalHeight, setNaturalHeight] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(0);


  let imgWidth = 0;
  let imgHeight = 0;
  if (aspectRatio > 0) {
    if (naturalWidth / containerWidth >= naturalHeight / containerHeight) {
      // constrain along width
      imgWidth = containerWidth;
      imgHeight = containerWidth / aspectRatio;
    } else {
      // constrain along height
      imgHeight = containerHeight;
      imgWidth = containerHeight / aspectRatio;
    }
  }

  const onImgLoad = ({ target: img }: any) => {
    setAspectRatio(img.naturalWidth / img.naturalHeight);
    setNaturalHeight(img.naturalHeight);
    setNaturalWidth(img.naturalWidth);
  };

  return (
    <React.Fragment>
      <div className={css.imageAnswer}>
        <div className={`${css.contentContainer} ${!staticSize ? css.center : ""}`} ref={divTarget}>
          <div className={css.imageContainer} style={{height: imgHeight, width: imgWidth}}>
            <img src={imgAnswer.get("imageUrl")} data-cy="answer-image" onLoad={onImgLoad} />
            <MagnifyIcon onClick={handleShowModal(true)} />
          </div>
        </div>
        <div className={css.imageAnswerNote}>{imgAnswer.get("text")}</div>
      </div>
      <ImageAnswerModal answer={answer} show={modalOpen} onHide={handleShowModal(false)} />
    </React.Fragment>
  );
};

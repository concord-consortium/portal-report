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
  const { answer, staticSize } = props;
  const imgAnswer = answer.get("answer");

  const [modalOpen, setModalOpen] = useState(false);
  const handleShowModal = (show: boolean) => () => {
    setModalOpen(show);
  };

  // get the native dimensions and aspect ratio of the image
  const [naturalWidth, setNaturalWidth] = useState(0);
  const [naturalHeight, setNaturalHeight] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(0);
  const onImgLoad = ({ target: img }: any) => {
    setAspectRatio(img.naturalWidth / img.naturalHeight);
    setNaturalHeight(img.naturalHeight);
    setNaturalWidth(img.naturalWidth);
  };

  // cf. https://www.npmjs.com/package/@react-hook/resize-observer
  const useSize = (target: any) => {
    const [size, setSize] = React.useState(new DOMRect(0, 0, 0, 0));
    React.useLayoutEffect(() => {
      setSize(target.current.getBoundingClientRect());
    }, [target]);
    useResizeObserver(target, (entry: any) => setSize(entry.contentRect));
    return size;
  };

  const divTarget = React.useRef(null);
  const divSize: DOMRect | DOMRectReadOnly = useSize(divTarget);

  // get the container size - can be static or dynamic
  const containerHeight: number = staticSize ? kStaticHeight: divSize?.height;
  const containerWidth: number = staticSize ? kStaticWidth : divSize?.width;

  // compute final image size from the container size and image aspect ratio
  const constrainX = naturalWidth / containerWidth >= naturalHeight / containerHeight;
  const imgWidth = aspectRatio > 0 ? (constrainX ? containerWidth : containerHeight / aspectRatio) : 0;
  const imgHeight = aspectRatio > 0 ? (constrainX ? containerWidth / aspectRatio : containerHeight) : 0;

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

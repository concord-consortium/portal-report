import React, { useCallback } from "react";
import { Map, List } from "immutable";

import { localDateTime } from "../../util/datetime";

import PlaybackIcon from '../../../img/svg-icons/playback-icon.svg';

import css from '../../../css/portal-dashboard/interactive-state-history-range-input.less';

interface InteractiveStateHistoryMarker {
  id: string;
  createdAt: Date;
}

interface IProps {
  answer: Map<string, any>;
  interactiveStateHistory?: List<Map<string, any>>;
  interactiveStateHistoryId?: string;
  setInteractiveStateHistoryId: (newId?: string) => void;
}

const minDisplayValueWidth = 70;

export const InteractiveStateHistoryRangeInput: React.FC<IProps> = (props) => {
  const { answer, interactiveStateHistory, interactiveStateHistoryId, setInteractiveStateHistoryId } = props;

  // if this is an old answer without interactive state history, don't create any markers
  const currentHistoryId = answer.get("interactiveStateHistoryId");
  const markers: InteractiveStateHistoryMarker[] = [];
  if (currentHistoryId && interactiveStateHistory) {
    interactiveStateHistory
      .toJS()
      .forEach((entry: any) => {
        const { id, createdAt } = entry;
        markers.push({ id, createdAt: new Date(createdAt.seconds * 1000) });
      });
  }

  const maxIndex = markers.length > 0 ? markers.length - 1 : 0;

  // default to using the latest marker if none is selected
  let currentIndex = markers.findIndex(marker => marker.id === interactiveStateHistoryId);
  if (currentIndex === -1) {
    currentIndex = maxIndex;
  }

  const progress = maxIndex === 0 ? 0 : (currentIndex / maxIndex) * 100;
  const thumbPosition = `calc(${progress}% - 12px)`;
  const currentMarker = markers[currentIndex];
  const displayValues = localDateTime(currentMarker && currentMarker.createdAt);

  const markerDots = markers.map((_, index) => {
    const positionPercent = maxIndex === 0 ? 0 : (index / maxIndex) * 100;
    return (
      <div
        key={index}
        className={css.rangeMarker}
        style={{ left: `${positionPercent}%` }}
      />
    );
  });

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    // value can be a float while dragging (since step is 0.01), so we round it to the nearest integer
    const rawValue = parseFloat(event.target.value);
    const newIndex = Math.round(rawValue);

    if (newIndex >= 0 && newIndex < markers.length) {
      const newMarker = markers[newIndex];
      const isLastMarker = newMarker.id === markers[markers.length - 1].id;
      if (isLastMarker) {
        // if it's the last marker, we clear the selection (to show the current state)
        setInteractiveStateHistoryId(undefined);
        return;
      }
      setInteractiveStateHistoryId(newMarker.id);
    }
  }, [markers, setInteractiveStateHistoryId]);

  if (markers.length <= 1) {
    return null;
  }

  return (
    <div className={css.rangeContainer}>
      <div className={css.rangeIcon}>
        <PlaybackIcon />
      </div>

      <div className={css.rangeSliderWrap}>
        <div className={css.rangeTrackBar}></div>
        <div className={css.rangeProgressBar} style={{ width: `${progress}%` }} />
        {markerDots}

        {/* this is a hidden input for accessibility */}
        <input
          type="range"
          min={0}
          max={maxIndex}
          // The step is 0.01 to allow smooth dragging, but we snap to the nearest index on change
          step={0.01}
          value={currentIndex}
          onChange={handleInputChange}
          className={css.rangeInput}
        />

        <div className={css.rangeThumb} style={{ left: thumbPosition }} />
      </div>

      <div className={css.rangeDatetime} style={{ minWidth: minDisplayValueWidth }}>
        <div>{displayValues.date}</div>
        <div>{displayValues.time}</div>
      </div>
    </div>
  );
};


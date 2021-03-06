import React, { useState, useEffect } from "react";
import useConstant from "use-constant";
import { motion, useTransform, useMotionValue } from "framer-motion";
import { withResizeDetector } from "react-resize-detector";
import CloseIcon from "@material-ui/icons/Close";
import FlareIcon from "@material-ui/icons/Flare";
import LockIcon from "@material-ui/icons/Lock";
import LockOpenIcon from "@material-ui/icons/LockOpen";

import MinimizeIcon from "@material-ui/icons/Minimize";
import FillContainer from "../../../../Components/Containers/FillContainer/FillContainer";
import FillContent from "../../../../Components/Containers/FillContainer/FillContent";
import FillHeader from "../../../../Components/Containers/FillContainer/FillHeader";
import DragHandle from "../../../../Components/Functional/DragHandle/";
import Utils from "../../../../Utils/";
import useCachedSize from "../../../../Utils/useSizeCache";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import "./DragWindow.scss";
const {
  getNestedValue,
  isDefNested,
  classes,
  setImmutableValue,
  isFunc,
  isDef,
  isTruthy,
  els,
} = Utils;
let ef = () => {}; // empty function


/* ======================================
 *
 *    Please excuse the mess.... LOL
 * 
 * ======================================
 */

const DragWindow = withResizeDetector(function(props) {
  let CONFIG = {
    state: {
      write: true,
    },
  };

  let {
    window = {},
    containerSize,
    classNames = [],
    minSize = {},
    title = "Untitled",
    snapIndicator = {},
    children,
    actions,
    windowManager,
  } = props;
  let {
    onSet = ef,
    onSetFocus = ef,
    onSetSize = ef,
    onSetPosition = ef,
    onClose = ef,
    onDown: handleOnDown = ef,
    onUp: handleOnUp = ef,
    onToggleWindow: handleOnToggleWindow,
    setSnapIndicator = ef,
  } = props;
  const [menuAnchorElement, setMenuAnchorElement] = useState(null);
  const [cachedDragHandleContents, setCachedDragHandleContents] = useState();

  let isTitleHidden = getNestedValue(window, "isTitleHidden", false);
  let visibility = getNestedValue(window, "visibility", "solid");



  const zIndex = getNestedValue(window, "zIndex", 0);

  const isFocused = getNestedValue(window, "isFocused", false);

  const isTempDisablePointerEvents = getNestedValue(
    window,
    "isTempDisablePointerEvents",
    false
  );
  const disablePointerEventsOnBlur = getNestedValue(
    window,
    "disablePointerEventsOnBlur",
    false
  );

  // Use motion values to store anything which needs to update faster than the state
  const motionValue = {
    isFullSize: useMotionValue(window.isFullSize),
    isDragging: useMotionValue(window.isDragging),
    backgroundColor: useMotionValue("transparent"), // used to set the background color before the state has a chance to refresh
    isChangingLocation: useMotionValue(false),
  };

  let isFullSize = motionValue.isFullSize.get();
  const setFullSize = (newValue) => {
    if (isFullSize !== newValue) {
      motionValue.isFullSize.set(newValue);

      if (newValue) {
        // set to full screen

        // Cache the previous window size
        let preSize = { ...window.size };
        setSize({ ...containerSize });
        onSet("prevSize", preSize);
        window = windowManager.getWindow(window.id);
      } else {
        // return to normal size
        if (isDef(window.prevSize)) {
          setSize(window.prevSize);
          onSet("prevSize", null);
        }
      }
      onSet("isFullSize", newValue);
    }
  };

  const isDragDisabled = getNestedValue(window, "isDragDisabled", false);
  const setDragDisabled = (value) => {
    onSet("isDragDisabled", value);
  };

  const isResizeDisabled =
    isFullSize || getNestedValue(window, "isResizeDisabled", false);
  const setResizeDisabled = (value) => {
    onSet("isResizeDisabled", value);
  };
  const toggleResizeDisabled = () => {
    setResizeDisabled(!isResizeDisabled);
  };

  const getIsDragging = () => {
    return motionValue.isDragging.get();
  };

  /** /////////////////////////////////////////////////////////
   *  isChangingLocation
   *  =========================================================
   *  If the container is resizing or if the window is resizing
   *  Alter the state so that buggy re-rendering
   *  (like brower background blur)
   *  is mitigated
   */
  const lastChangedId = useMotionValue(0);
  const [lastChangedTime, setLastChangedTime] = useState(null);
  const getIsChangingLocation = () => {
    return motionValue.isChangingLocation.get();
  };
  const getCurrentTime = () => {
    return new Date().getTime();
  };
  // Return the state to an non-activly changing state
  const debouncedsSetNotChanging = () => {
    let timeout = 500;
    function makeCheckInactive(currentCheckId) {
      return function() {
        let isCurrentlyChanging = motionValue.isChangingLocation.get();
        if (isCurrentlyChanging) {
          // detect if is the most recent call of the method... to acheive the debounce effect
          let isLastExecution = currentCheckId === lastChangedId.get();
          if (isLastExecution) {
            let delta = getCurrentTime() - lastChangedTime;
            if (isDef(lastChangedTime) && delta >= timeout) {
              setLastChangedTime(null);
              motionValue.isChangingLocation.set(false);
              setIsChangingLocation(false);
            }
          }
        }
      };
    }
    let newId = lastChangedId.get() + 1;
    lastChangedId.set(newId);
    setTimeout(makeCheckInactive(newId), timeout);
  };

  const setIsChangingLocation = (value) => {
    motionValue.isChangingLocation.set(value);
    if (value) {
      setLastChangedTime(getCurrentTime());
      if (value) {
        debouncedsSetNotChanging();
      }
      motionValue.backgroundColor.set("#000");
    } else {
      motionValue.backgroundColor.set("transparent");
    }
  };

  // end isChangingLocation ////////////////////////////////////////////

  let isMouseEventsDisabled = getIsDragging();

  const getMinSize = () => {
    return {
      height: getNestedValue(minSize, "height", 100),
      width: getNestedValue(minSize, "width", 250),
    };
  };





  
  let windowPos = window.position || null;
  if (isFunc(window.dynamicPosition)) {
    let args = {
      position: windowPos, 
      window, 
      windowManager, 
      containerSize
    };
    let temp = window.dynamicPosition(args)
    if(isDef(temp)){
      windowPos = temp
    }
  }
  windowPos = windowPos || {left: 0, top: 0};
  const anchorPosY = useMotionValue(windowPos.top);
  const anchorPosX = useMotionValue(windowPos.left);
  const getPosition = () => {
    let currentPos = {
      left: anchorPosX.get(),
      top: anchorPosY.get(),
    }
    return currentPos;
  };
  const setPosition = (newValue) => {
    if(anchorPosY.get() !== newValue.top){
      anchorPosY.set(newValue.top);
    }
    if(anchorPosX.get() !== newValue.left){
      anchorPosX.set(newValue.left);
    }   
    onSetPosition(newValue);
  };






  let windowSize = window.size || null;
  if (isFunc(window.dynamicSize)) {
    let args = {
      position: windowSize, 
      window, 
      windowManager, 
      containerSize
    };
    let temp = window.dynamicSize(args)
    if(isDef(temp)){
      windowSize = temp;
    }
  }
  windowSize = windowSize || {width: 0, height: 0};
  const winSizeY = useMotionValue(windowSize.height);
  const winSizeX = useMotionValue(windowSize.width);
  const getSize = () => {
    return {
      height: winSizeY.get(),
      width: winSizeX.get(),
    };
  };
  const setSize = (newValue) => {
    if(winSizeY.get() !== newValue.height){
      winSizeY.set(newValue.height);
    }
    if(winSizeX.get() !== newValue.width){
      winSizeX.set(newValue.width);
    }
    onSetSize(newValue);
  };







  const setFocused = (newValue) => {
    onSetFocus(newValue);
  };

  const initialSize = getSize();

  // Set the position if not defined on original object

  const toggleDragEnabled = () => {
    setDragDisabled(!isDragDisabled);
  };

  // Handle full size so values are always correct
  if (isFullSize) {
    let changed = {
      position: false,
      size: false,
    };

    // Update position for full size
    let currentPos = getPosition();
    if (currentPos.left !== 0) {
      changed.position = true;
      currentPos.left = 0;
    }
    if (currentPos.top !== 0) {
      changed.position = true;
      currentPos.top = 0;
    }
    if (changed.position) {
      setPosition(currentPos);
    }

    // Update size for full size
    let currentSize = getSize();
    if (currentSize.width !== containerSize.width) {
      changed.size = true;
      currentSize.width = containerSize.width;
    }
    if (currentSize.height !== containerSize.height) {
      changed.size = true;
      currentSize.height = containerSize.height;
    }
    if (changed.size) {
      setSize(currentSize);
    }
  }

  // Dont allow to resize outside of bounds
  function restrictAxis(
    pos,
    posField,
    size,
    sizeField,
    minSize,
    containerSize
  ) {
    // Limit drag position
    if (pos[posField] < 0) pos[posField] = 0;

    if (containerSize[sizeField] < size[sizeField])
      size[sizeField] = containerSize[sizeField];

    let limitBounds;
    let difference;
    limitBounds = pos[posField] + size[sizeField];
    if (limitBounds > containerSize[sizeField]) {
      if (pos[posField] > 0) {
        difference = limitBounds - containerSize[sizeField];
        if (difference < pos[posField]) {
          pos[posField] -= difference;
        } else {
          pos[posField] = 0;
        }
      } else {
        limitBounds = pos[posField] + size[sizeField];
        difference = limitBounds - containerSize[sizeField];
        if (difference > 0) {
          size[sizeField] = containerSize[sizeField];
        }
      }
    }

    if (size[sizeField] < minSize[sizeField])
      size[sizeField] = minSize[sizeField];
  }

  // Side effect: will mutate the input values
  const updatePosAndSize = (newPos, newSize, minSize, containerSize) => {
    restrictAxis(newPos, "top", newSize, "height", minSize, containerSize);
    restrictAxis(newPos, "left", newSize, "width", minSize, containerSize);
    anchorPosY.set(newPos.top);
    anchorPosX.set(newPos.left);

    setIsChangingLocation(true);

    // If has specific function for position calculate and override value
    if (isFunc(window.dynamicPosition)) {
      let args = {
        position: newPos, 
        window, 
        windowManager, 
        containerSize
      };
      let temp = window.dynamicPosition(args)
      if(isDef(temp)){
        newPos = temp
      }
    }
    setPosition(newPos);


    // If dynamic size override size 
    if (isFunc(window.dynamicSize)) {
      let args = {
        position: newPos, 
        window, 
        windowManager, 
        containerSize
      };
      let temp = window.dynamicSize(args)
      if(isDef(temp)){
        newSize = temp;
      }
    }
    setSize(newSize);


    //*
    let boundaries = {
      w: newPos.left,
      e: newPos.left + newSize.width,
      n: newPos.top,
      s: newPos.top + newSize.height,
    };

    let isWithinRange = {
      w: newPos.left < 4,
      e: containerSize.width - boundaries.e < 4,
      n: newPos.top < 4,
      s: containerSize.height - boundaries.s < 4,
    };

    let indicators = {
      w: els(snapIndicator.w, false),
      e: els(snapIndicator.e, false),
      n: els(snapIndicator.n, false),
      s: els(snapIndicator.s, false),
    };

    // left indicator active
    if (isWithinRange.w && !indicators.w) {
      setSnapIndicator("w", true);
    }
    if (!isWithinRange.w && indicators.w) {
      setSnapIndicator("w", false);
    }

    // right indicator active
    if (isWithinRange.e && !indicators.e) {
      setSnapIndicator("e", true);
    }
    if (!isWithinRange.e && indicators.e) {
      setSnapIndicator("e", false);
    }

    // right indicator active
    if (isWithinRange.n && !indicators.n) {
      setSnapIndicator("n", true);
    }
    if (!isWithinRange.n && indicators.n) {
      setSnapIndicator("n", false);
    }

    // right indicator active
    if (isWithinRange.s && !indicators.s) {
      setSnapIndicator("s", true);
    }
    if (!isWithinRange.s && indicators.s) {
      setSnapIndicator("s", false);
    }
    //*/
  };

  const computePosAndSize = (info) => {};

  const onDrag = (e, info) => {
    if (!isDragDisabled) {
      if (isFullSize) {
        setFullSize(false);
      }

      setIsChangingLocation(true);

      let delta = info.delta;
      if (delta.x !== 0 || delta.y !== 0) {
        const newPos = {
          left: anchorPosX.get() + delta.x,
          top: anchorPosY.get() + delta.y,
        };
        const newSize = {
          height: winSizeY.get(),
          width: winSizeX.get(),
        };
        if (isTruthy(CONFIG.state.write)) {
          updatePosAndSize(newPos, newSize, getMinSize(), containerSize);
          setFocused(true);
        }
      }
    }
  };

  const onDown = () => {
    if (!getIsDragging()) {
      onSet("isDragging", true);
      // let the parent know the window is being interacted with
    }

    handleOnDown(window);
  };

  const onResizeDown = () => {
    let newResizingValue = false;
    if (!isResizeDisabled) {
      newResizingValue = true;
    }
    if (!isFocused) {
      setFocused(true);
    }
    onSet("isResizing", newResizingValue);
    onDown();
  };

  const onUp = (e, info) => {
    onSet("isResizing", false);
    onSet("isDragging", false);
    setIsChangingLocation(false);

    // let the parent know the window is no longer being interacted with
    handleOnUp(window);
  };

  // Resize window
  const makeOnDragReize = (key) => {
    return function(e, info) {
      let delta = info.delta;
      if (!isResizeDisabled) {
        const size = {
          height: winSizeY.get(),
          width: winSizeX.get(),
        };
        setIsChangingLocation(true);

        if (delta.x !== 0 || delta.y !== 0) {
          let originalWidth = getNestedValue(size, "width", null);
          if (Number.isNaN(originalWidth)) originalWidth = initialSize.width;

          let originalHeight = getNestedValue(size, "height", null);
          if (Number.isNaN(originalHeight)) originalHeight = initialSize.height;

          let newPos = getPosition();

          // Make sure values are defined
          let newSize = size;
          if (Number.isNaN(size.height)) {
            newSize = setImmutableValue(newSize, "height", originalHeight);
          }
          if (Number.isNaN(size.width)) {
            newSize = setImmutableValue(newSize, "width", originalWidth);
          }

          // Right side
          if (["e", "se", "ne"].includes(key)) {
            newSize = setImmutableValue(
              newSize,
              "width",
              originalWidth + delta.x
            );
          }

          // Left side
          if (["w", "sw", "nw"].includes(key)) {
            newSize = setImmutableValue(
              newSize,
              "width",
              originalWidth - delta.x
            );
            newPos = setImmutableValue(newPos, "left", newPos.left + delta.x);
          }

          // Top side
          if (["n", "ne", "nw"].includes(key)) {
            newSize = setImmutableValue(
              newSize,
              "height",
              originalHeight - delta.y
            );
            newPos = setImmutableValue(newPos, "top", newPos.top + delta.y);
          }

          // Bottom side
          if (["s", "se", "sw"].includes(key)) {
            newSize = setImmutableValue(
              newSize,
              "height",
              originalHeight + delta.y
            );
          }

          if (isTruthy(CONFIG.state.write)) {
            updatePosAndSize(newPos, newSize, getMinSize(), containerSize);
          }
        }
      }
    };
  };

  // Refresh size of model screen resized
  useEffect(() => {
    let newPos = { ...getPosition() };
    let newSize = { ...getSize() };
    if (isTruthy(CONFIG.state.write)) {
      updatePosAndSize(newPos, newSize, getMinSize(), containerSize);
      setIsChangingLocation(true);
    }
  }, [containerSize.width, containerSize.height]);

  let dragHandleContents = null;

  if (true || isDef(cachedDragHandleContents)) {
    // Drag handles
    dragHandleContents = (
      <>
        <DragHandle
          onDrag={makeOnDragReize("e")}
          onDown={onResizeDown}
          onUp={onUp}
          disabled={isResizeDisabled}
          classNames={["resize-handle", "resize-handle-e"]}
        />
        <DragHandle
          onDrag={makeOnDragReize("w")}
          onDown={onResizeDown}
          onUp={onUp}
          disabled={isResizeDisabled}
          classNames={["resize-handle", "resize-handle-w"]}
        />
        <DragHandle
          onDrag={makeOnDragReize("n")}
          onDown={onResizeDown}
          onUp={onUp}
          disabled={isResizeDisabled}
          classNames={["resize-handle", "resize-handle-n"]}
        />
        <DragHandle
          onDrag={makeOnDragReize("s")}
          onDown={onResizeDown}
          onUp={onUp}
          disabled={isResizeDisabled}
          classNames={["resize-handle", "resize-handle-s"]}
        />
        <DragHandle
          onDrag={makeOnDragReize("se")}
          onDown={onResizeDown}
          onUp={onUp}
          disabled={isResizeDisabled}
          classNames={["resize-handle-corner", "resize-handle-se"]}
        />
        <DragHandle
          onDrag={makeOnDragReize("ne")}
          onDown={onResizeDown}
          onUp={onUp}
          disabled={isResizeDisabled}
          classNames={["resize-handle-corner", "resize-handle-ne"]}
        />
        <DragHandle
          onDrag={makeOnDragReize("nw")}
          onDown={onResizeDown}
          onUp={onUp}
          disabled={isResizeDisabled}
          classNames={["resize-handle-corner", "resize-handle-nw"]}
        />
        <DragHandle
          onDrag={makeOnDragReize("sw")}
          onDown={onResizeDown}
          onUp={onUp}
          disabled={isResizeDisabled}
          classNames={["resize-handle-corner", "resize-handle-sw"]}
        />
      </>
    );
  }

  const toggleFullSize = () => {
    setFullSize(!isFullSize);
  };

  const childArgs = {
    window: windowManager.getWindow(window.id),
    windowManager: windowManager,
    containerSize,
    size: getSize(),
    position: getPosition(),
    do: {
      close: onClose,
      minimize: handleOnToggleWindow,
      maxamize: toggleFullSize,
    },
  };

  const handleMenuClick = (event) => {
    setMenuAnchorElement(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setMenuAnchorElement(null);
  };
  // Define the contents of the UI
  let headerContents = "";
  let titleContents = (
    <DragHandle
      onDrag={onDrag}
      onDown={() => onDown()}
      onUp={onUp}
      onClick={() => setFocused()}
      classNames={["title", isDragDisabled ? "not-allowed" : ""]}
    >
      {isDef(title) ? (isFunc(title) ? title(childArgs) : title) : ""}
    </DragHandle>
  );
  let leftHeaderActionContents = (
    <div {...classes("actions", "row")}>
      <div {...classes("button")} title="Close" onClick={() => onClose()}>
        <div {...classes("circle red")} />
      </div>

      <div {...classes("button")} onClick={() => handleOnToggleWindow()}>
        <div {...classes("circle yellow")} />
      </div>

      <div
        {...classes("button")}
        onClick={toggleFullSize}
        title={isFullSize ? "Restore size" : "Maximize size"}
      >
        <div {...classes("circle green")} />
      </div>
    </div>
  );

  let lockDragLabel = isDragDisabled ? "Drag disabled" : "Drag enabled";
  let lockResizeLabel = isResizeDisabled ? "Resize disabled" : "Resize enabled";

  let rightHeaderActionContents = (
    <div {...classes("actions", "row", "right")} style={{ width: "102px" }}>
      <div {...classes("button")} onClick={handleMenuClick}>
        <MoreVertIcon />
      </div>

      <Menu
        id="simple-menu"
        anchorEl={menuAnchorElement}
        keepMounted
        open={Boolean(menuAnchorElement)}
        onClose={handleCloseMenu}
      >
        <MenuItem
          onClick={handleCloseMenu}
          onClick={() => {
            toggleDragEnabled();
          }}
        >
          <ListItemIcon>
            {!isDragDisabled ? <LockOpenIcon /> : <LockIcon />}
          </ListItemIcon>{" "}
          {lockDragLabel}
        </MenuItem>

        <MenuItem
          onClick={() => {
            toggleResizeDisabled();
          }}
        >
          <ListItemIcon>
            {!isResizeDisabled ? <LockOpenIcon /> : <LockIcon />}
          </ListItemIcon>
          {lockResizeLabel}
        </MenuItem>
      </Menu>
    </div>
  );

  const size = getSize();
  if (size.width > 300) {
    headerContents = (
      <div {...classes("header", "no-select")}>
        <div {...classes("row")}>
          {leftHeaderActionContents}
          {titleContents}
          {rightHeaderActionContents}
        </div>
      </div>
    );
  } else {
    headerContents = (
      <div {...classes("header", "no-select")}>
        <div {...classes("row")}>
          {leftHeaderActionContents}
          <DragHandle
            onDrag={onDrag}
            onDown={() => onDown()}
            onUp={onUp}
            onClick={() => setFocused()}
            classNames={["title", isDragDisabled ? "not-allowed" : ""]}
          />
          {rightHeaderActionContents}
        </div>
        <div {...classes("row")}>{titleContents}</div>
      </div>
    );
  }

  let childContents = "";
  const contentsSize = useCachedSize();
  const [childCacheProp, setChildCacheProp] = useState();
  const [childCacheValue, setChildCachevalue] = useState();
  if (isDef(children)) {
    // If children is function/component wrap with ResizeDetector
    if (isFunc(children)) {
      // Convert function to component
      let Temp = children;
      // Wrap child component in size cache component
      let Temp2 = ({ width, height, ...otherProps }) => {
        //let cachedSize = contentsSize.process({width, height});
        return <Temp contentSize={{ width, height }} {...otherProps} />;
      };
      // Feed the component the it's size
      let Child = withResizeDetector(Temp2);
      childContents = <Child {...childArgs} />;
    } else {
      // Children is static content
      childContents = children;
    }
  }

  //------------------------------------
  // Window animation
  let animateState;
  if (window.isOpen) {
    animateState = "visible";
  } else {
    animateState = "hidden";
  }

  if(visibility == "hidden") {
    animateState = "hidden";
  }
  const variants = {
    hidden: {
      opacity: 0,
      y: 100,
      transition: "linear",
      transitionEnd: {
        display: "none",
      },
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: "linear",
      display: "flex",
    },
  };

  let disablePointerEvents =
    isMouseEventsDisabled ||
    isTempDisablePointerEvents ||
    (disablePointerEventsOnBlur && !isFocused);

  const maxWindowSize = getSize();
  let top = anchorPosY;
  let left = anchorPosX;
  let width = winSizeX;
  let height = winSizeY;




  let windowVisibilityClasses = ( 
      visibility === "solid" 
      ? ["solid"] 
      : visibility === "semi-solid" 
      ? ["semi-solid"] 
      : [""]
    );



  // Draw Window
  return (
    <motion.div
      onAnimationStart={() => {
        setIsChangingLocation(true);
      }}
      onAnimationComplete={() => {
        setIsChangingLocation(false);
      }}
      {...classes(
        "window",
        ...windowVisibilityClasses,
        classNames,
        getIsChangingLocation() ? "dragging" : ""
      )}
      onMouseDown={() => {
        if (!isFocused) setFocused(true);
      }}
      onMouseDown={() => {
        if (!isFocused) setFocused(true);
      }}
      onTapStart={() => {
        if (!isFocused) setFocused(true);
      }}
      variants={variants}
      initial="hidden"
      exit="hidden"
      animate={animateState}
      style={{
        top,
        left,
        position: "absolute",
        zIndex: zIndex,

        ...(isFullSize
          ? {
              height: containerSize.height,
              width: containerSize.width,
              maxHeight: containerSize.height,
              maxWidth: containerSize.width,
            }
          : {
              width,
              height,
              maxHeight: maxWindowSize.height,
              maxWidth: maxWindowSize.width,
            }),
      }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      <div {...classes("window-inner", "relative")}>
        <motion.div
          {...classes("full", "fade-background", "relative")}
          style={{
            backgroundColor: motionValue.backgroundColor,
          }}
        >
          <div {...classes("window-shell", "grow", ...windowVisibilityClasses)}>
            {dragHandleContents}
            <div {...classes(["inner-content", "grow", "column"])}>
              <FillContainer>
                {!isTitleHidden && <FillHeader>{headerContents}</FillHeader>}

                <FillContent
                  classNames={[
                    "overflow-hidden",
                    "relative",
                    "column",
                    "grow",
                    disablePointerEvents && "disable-pointer-events",
                  ]}
                >
                  {childContents}
                </FillContent>

                {isDef(actions)
                  ? isFunc(actions)
                    ? actions(childArgs)
                    : actions
                  : ""}
              </FillContainer>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
});

export default DragWindow;

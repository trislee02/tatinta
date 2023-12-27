import React, { useState, useEffect } from "react";
import Emoji from "react-emoji-render";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import "./styles.css"

const useHover = () => {
  const [isHover, setIsHover] = useState(false);

  const handleMouseMove = () => {
    setIsHover(true);
  };

  const handleMouseLeave = () => {
    setIsHover(false);
  };

  return {
    isHover,
    handleMouseMove,
    handleMouseLeave,
  };
};

const ResponseMessage = ({ content}) => {
  const { isHover, handleMouseLeave, handleMouseMove } = useHover();
  const [isReactionActive, setIsReactionActive] = useState(false);

  return (
  <div
    className="box"
    onMouseMove={handleMouseMove}
    onMouseLeave={handleMouseLeave}
    style={{
      backgroundColor: "inherit",
      height: "fit-content",
      paddingBottom: "10px"
    }}
  >
    <div className="responseText">
      <Emoji>{content}</Emoji>
      {(isReactionActive || isHover) && (
        <div
          className="iconHeart"
          onClick={() => {
            setIsReactionActive((prev) => !prev);
          }}
        >
          {isReactionActive ? (
            <FavoriteIcon className="icon-active" style={{ marginBottom: 5}}/>
          ) : (
            <FavoriteBorderIcon />
          )}
        </div>
      )}
    </div>
  </div>);
};

const PromptMessage = ({ content, state }) => {
  const { isHover, handleMouseLeave, handleMouseMove } = useHover();
  const [isReactionActive, setIsReactionActive] = useState(false);

  useEffect(() => {
    if (state === "reacted") {
      if (!isReactionActive) {
        let interval = setInterval(() => {
          setIsReactionActive(true);
        }, 500);

        return () => {
          clearInterval(interval);
        };
      }
    }
    //eslint-disable-next-line
  }, [state]);

  return (
    <div
      className="box"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        flexDirection: "column",
        alignItems: "flex-end",
        backgroundColor: "inherit",
        display: "flex",
        height: "fit-content",
        paddingBottom: "12px",
        overflowX: "hidden",
        paddingRight: "10px"
      }}
    >
      <div className="promptText" style={{ marginBottom: 0 }}>
        <Emoji>{content}</Emoji>
        {(isReactionActive || isHover) && (
          <div className="iconHeart">
            {isReactionActive ? (
              <FavoriteIcon className="icon-active" />
            ) : (
              <FavoriteBorderIcon />
            )}
          </div>
        )}
      </div>
      {state !== "reacted" && <div style={{ border: 0 }}>{state}</div>}
    </div>
  );
};

const Message = ({ role, content, state="" }) => {
  return (
    <>
      {role === "human" && <PromptMessage content={content} state={state}/>}
      {role === "prev-chat" && <ResponseMessage content={content}/>}
    </>
  );
};

export default Message;

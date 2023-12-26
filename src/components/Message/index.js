import React, { useState, useEffect } from "react";
import { makeStyles } from "@mui/styles";
import Emoji from "react-emoji-render";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

const useStyles = makeStyles(() => ({
  promptText: {
    padding: 10,
    backgroundColor: "#2d3552",
    color: "#f6f6f6",
    width: "fit-content",
    borderRadius: 15,
    maxWidth: "80%",
    position: "relative",
    marginBottom: 10,
    marginTop: 5,
  },
  responseText: {
    backgroundColor: "#fff",
    color: "#2d3552",
    padding: 10,
    width: "fit-content",
    overflowWrap: "break-word",
    borderRadius: 15,
    maxWidth: "80%",
    position: "relative",
  },
  box: {
    display: "flex",
    flexDirection: "row",
    border: "none",
    width: "100%",
    position: "relative",
  },
  iconHeart: {
    position: "absolute",
    right: -10,
    bottom: -20,
    border: "none",
    cursor: "pointer",
    zIndex: 10,
    color: "#FF6961",
  },
}));

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

const ResponseMessage = ({ content }) => {
  const styles = useStyles();
  const { isHover, handleMouseLeave, handleMouseMove } = useHover();
  const [isReactionActive, setIsReactionActive] = useState(false);

  return (
    <div
      className={styles.box}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        backgroundColor: "inherit",
      }}
    >
      <div className={styles.responseText}>
        <Emoji>{content}</Emoji>
        {(isReactionActive || isHover) && (
          <div
            className={styles.iconHeart}
            onClick={() => {
              setIsReactionActive((prev) => !prev);
            }}
          >
            {isReactionActive ? (
              <FavoriteIcon className="icon-active" />
            ) : (
              <FavoriteBorderIcon />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const PromptMessage = ({ content, state }) => {
  const styles = useStyles();
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
      className={styles.box}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        flexDirection: "column",
        // justifyContent: "flex-end",
        alignItems: "flex-end",
        backgroundColor: "inherit",
        display: "flex",
      }}
    >
      <div className={styles.promptText} style={{ marginBottom: 0 }}>
        <Emoji>{content}</Emoji>
        {(isReactionActive || isHover) && (
          <div className={styles.iconHeart}>
            {isReactionActive ? (
              <FavoriteIcon className="icon-active" />
            ) : (
              <FavoriteBorderIcon />
            )}
          </div>
        )}
      </div>
      {state !== "reacted" && <div>{state}</div>}
    </div>
  );
};

const Message = ({ role, content, state="" }) => {
  return (
    <>
      {role === "human" && <PromptMessage content={content} state={state}/>}
      {role === "prev-chat" && <ResponseMessage content={content} />}
    </>
  );
};

export default Message;

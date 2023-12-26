import React, { useEffect, useRef, useState } from "react";

import { IconButton, TextField } from "@mui/material";
import { makeStyles } from "@mui/styles";

import SendIcon from "@mui/icons-material/Send";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import CloseIcon from "@mui/icons-material/Close";

import Message from "../../components/Message";
import axios from "axios";

const useStyles = makeStyles(() => ({
  container: {
    position: "fixed",
    bottom: "2rem",
    right: "2rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    border: "none",
    gap: "1rem",
  },
  chat: {
    width: "24rem",
    height: "32rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    backgroundColor: "#f4f4f4",
  },
  header: {
    backgroundColor: "#2d3552",
    color: "#f6f6f6",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: "8px 16px",
    fontWeight: "bold",
    border: "none",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  box: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    gap: 5,
    overflowY: "hidden",
    borderRadius: 0,
    borderBottomColor: "transparent",
    backgroundColor: "inherit",
    borderColor: "#318fb5",
  },
  form: {
    display: "grid",
    gridTemplateColumns: "auto 60px",
    columnGap: 10,
    padding: "8px 16px",
    border: "1px solid #318fb5",
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
}));

const TypingAnimation = ({ staticText, text, delay }) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText(prevText => prevText + text[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, delay);
  
      return () => clearTimeout(timeout);
    }
    else {
      setCurrentText('');
      setCurrentIndex(0);
    }
  }, [currentIndex, delay, text]);

  return <span>{staticText} {currentText}</span>;
};

const ChatBox = ({ children }) => {
  const styles = useStyles();

  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState([]); // Array of conversation with
  // role 'prev-chat' as response from chat-box, 'human', and hidden role 'tantinta' (original response content from server)
  const [prevChat, setPrevChat] = useState([]); // Using prevChat as stack and push to Chat with speed calculation by CPM
  const [prompt, setPrompt] = useState("");
  const [msgState, setMsgState] = useState(""); // A sent message has following states: "sent", "delivered", "seen", "reacted" 

  const scrollRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (prompt !== "") {
      setMsgState("sent");
      const newConversation = [
        ...conversation,
        { role: "human", content: prompt, metadata: { state: "sent" } },
      ];

      setPrompt("");
      setConversation(newConversation);

      const { data } = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/api/v1/chat`,
        {
          content: [
            ...newConversation.filter(
              (conversation) => conversation.role !== "prev-chat"
            ),
          ],
        }
      );
      
      setMsgState("seen");
      if (data.content) {
        const lastMessage = data.content.slice(-1)[0];
        
        if (lastMessage.role === "tatinta") {
          let interval = setInterval(() => {
            setPrevChat(
              lastMessage.metadata.sent.map((msg) => ({
                role: "prev-chat",
                content: msg,
              }))
            );
            setMsgState("reacted");
            clearInterval(interval);
          }, 1000);

          setConversation((prev) => [...prev, ...data.content.slice(-1)]);
        }
      }
    }
  };

  useEffect(() => {
    if (msgState === "sent") {
      let interval = setInterval(() => {
        if (msgState === "sent") setMsgState("delivered");
        clearInterval(interval);
      }, process.env.DELAY_DELIVERED);
    }
    else if (msgState === "delivered") {
      let interval = setInterval(() => {
        if (msgState === "delivered") setMsgState("seen");
        clearInterval(interval);
      }, process.env.DELAY_SEEN);
    }

    setConversation((prev) =>
        prev.map((msg) => {
          if (msg.role === "human" && msg.metadata.state !== "reacted") {
            return { ...msg, metadata: { state: msgState } };
          } else return { ...msg };
        })
      );
    
  }, [msgState])

  // Auto scroll to bottom of conversation
  useEffect(() => {
    if (conversation.length || isLoading) {
      scrollRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [conversation.length, isLoading]);

  // Push respectively prevChat to the conversation
  useEffect(() => {
    if (prevChat.length > 0) {
      setIsLoading(true);
      const _dump = prevChat[0];

      const timeInterval =
        (_dump.content.length / process.env.REACT_APP_CPM) * 60 * 1000;

        let interval = setInterval(() => {
        setConversation((prev) => [...prev, _dump]);
        setPrevChat((prev) => prev.slice(1));
        setIsLoading(false);
      }, timeInterval);

      return () => {
        clearInterval(interval);
      };
    }
  }, [prevChat]);

  return (
    <div className={styles.chat}>
      {children}
      <div className={styles.box}>
        <div
          style={{
            overflowY: "scroll",
            border: "none",
            overflowX: "visible",
            padding: 10,
            backgroundColor: "inherit",
          }}
        >
          {conversation.map((msg, idx) => (
            <Message
              role={msg.role}
              content={msg.content}
              key={idx}
              state={msg.metadata?.state}
            />
          ))}
          {isLoading && (
            <TypingAnimation staticText="Tatinta is typing" text="..." delay={300}/>
          )}
          <div
            style={{ border: "none", float: "left", clear: "both" }}
            ref={scrollRef}
          />
        </div>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <TextField
          value={prompt}
          placeholder="Nhập câu hỏi"
          onChange={(e) => setPrompt(e.target.value)}
          fullWidth
          focused
          sx={{
            input: {
              color: "#2d3552",
              backgroundColor: "white",
              height: "inherit",
            },
          }}
          disabled={isLoading}
        />
        <IconButton style={{ color: "#318fb5" }}>
          <SendIcon color="inherit" />
        </IconButton>
      </form>
    </div>
  );
};

const Chat = () => {
  const styles = useStyles();
  const [active, setActive] = useState(true);

  return (
    <div className={styles.container}>
      {active && (
        <ChatBox>
          <div className={styles.header}>
            Tantinta
            <IconButton
              size="small"
              onClick={() => {
                setActive(false);
              }}
            >
              <CloseIcon color="info" />
            </IconButton>
          </div>
        </ChatBox>
      )}
      <IconButton
        onClick={() => {
          setActive(true);
        }}
        size="large"
        color="info"
      >
        <QuestionAnswerIcon />
      </IconButton>
    </div>
  );
};

export default Chat;

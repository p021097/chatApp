import React, { useContext, useEffect, useState } from "react";
import "./ChatBox.css";
import assets from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { toast } from "react-toastify";
import upload from "../../lib/upload";

const ChatBox = () => {
  const {
    userData,
    messages,
    setMessages,
    messegesId,
    chatUser,
    chatVisible,
    setChatVisible,
  } = useContext(AppContext);
  const [input, setinput] = useState("");

  const sendMessage = async () => {
    try {
      if (input && messegesId) {
        await updateDoc(doc(db, "messages", messegesId), {
          messages: arrayUnion({
            sId: userData.id,
            text: input,
            createdAt: new Date(),
          }),
        });
      }

      const userIdDs = [chatUser.rId, userData.id];

      userIdDs.forEach(async (id) => {
        const userChatRefs = doc(db, "chats", id);
        const userChatsSanpshot = await getDoc(userChatRefs);
        if (userChatsSanpshot.exists()) {
          const userChatData = userChatsSanpshot.data();
          const chatIndex = userChatData.chatsData.findIndex(
            (c) => c.messageId === messegesId
          );
          if (chatIndex !== -1) {
            userChatData.chatsData[chatIndex].lastMessage = input.slice(0, 30);
            userChatData.chatsData[chatIndex].updatedAt = Date.now();
            if (userChatData.chatsData[chatIndex].rId === userData.id) {
              userChatData.chatsData[chatIndex].messageSeen = false;
            }
          }

          await updateDoc(userChatRefs, {
            chatsData: userChatData.chatsData,
          });
        }
      });
    } catch (error) {
      toast.error(error.message);
    }
    setinput("");
  };

  const convertTimeStamp = (timeStamp) => {
    let date = timeStamp.toDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    if (hour > 12) {
      return hour - 12 + ":" + minute + " PM";
    } else {
      return hour + ":" + minute + " AM";
    }
  };

  const sendImage = async (e) => {
    try {
      const fileurl = await upload(e.target.files[0]);
      if (fileurl && messegesId) {
        await updateDoc(doc(db, "messages", messegesId), {
          messages: arrayUnion({
            sId: userData.id,
            image: fileurl,
            createdAt: new Date(),
          }),
        });
        const userIdDs = [chatUser.rId, userData.id];

        userIdDs.forEach(async (id) => {
          const userChatRefs = doc(db, "chats", id);
          const userChatsSanpshot = await getDoc(userChatRefs);
          if (userChatsSanpshot.exists()) {
            const userChatData = userChatsSanpshot.data();
            const chatIndex = userChatData.chatsData.findIndex(
              (c) => c.messageId === messegesId
            );
            userChatData.chatsData[chatIndex].lastMessage = "Image";
            userChatData.chatsData[chatIndex].updatedAt = Date.now();
            if (userChatData.chatsData[chatIndex].rId === userData.id) {
              userChatData.chatsData[chatIndex].messageSeen = false;
            }
            await updateDoc(userChatRefs, {
              chatsData: userChatData.chatsData,
            });
          }
        });
      }
    } catch (error) {
      toast.error(error.message);
    }
  };


  const handleKeyDown = (e) => {
    if(e.key === "Enter" & input.trim()){
      e.preventDefault()
      sendMessage()
    }
  }

  useEffect(() => {
    if (messegesId) {
      const unSub = onSnapshot(doc(db, "messages", messegesId), (res) => {
        setMessages(res.data().messages.reverse());
        console.log(res.data().messages.reverse());
      });
      return () => {
        unSub();
      };
    }
  }, [messegesId]);

  return chatUser ? (
    <div className={`chat-box ${chatVisible ? "" : "hidden"}`}>
      <div className="chat-user">
        <img src={chatUser.userData.avatar} alt="" />
        <p>
          {chatUser.userData.name}{" "}
          {Date.now() - chatUser.userData.lastSeen <= 70000 ? (
            <img className="dot" src={assets.green_dot} alt="" />
          ) : null}
        </p>
        <img src={assets.help_icon} className="help" alt="" />
        <img
          onClick={() => setChatVisible(false)}
          src={assets.arrow_icon}
          className="arrow"
          alt=""
        />
      </div>

      <div className="chat-msg">
        {messages.map((msg, idx) => (
          <div
            className={msg.sId === userData.id ? "s-msg" : "r-msg"}
            key={idx}
          >
            {msg["image"] ? (
              <img className="msg-img" src={msg.image} alt="" />
            ) : (
              <p className="msg">{msg.text}</p>
            )}

            <div>
              <img
                src={
                  msg.sId === userData.id
                    ? userData.avatar
                    : chatUser.userData.avatar
                }
                alt=""
              />
              <p>{convertTimeStamp(msg.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          onChange={(e) => setinput(e.target.value)}
          value={input}
          type="text"
          placeholder="Send a message"
          onKeyDown={handleKeyDown}
        />
        <input
          onChange={sendImage}
          type="file"
          id="image"
          accept="image/png, image/jpeg"
          hidden
        />
        <label htmlFor="image">
          <img src={assets.gallery_icon} alt="" />
        </label>
        <img onClick={sendMessage} src={assets.send_button} alt="" />
      </div>
    </div>
  ) : (
    <div className={`chat-welcome ${chatVisible ? "" : "hidden"}`}>
      <img src={assets.logo_icon} alt="" />
      <p>Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatBox;

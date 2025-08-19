import React, { useEffect, useState, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import { FaArrowLeft, FaPhotoVideo } from "react-icons/fa";
import { useGlobalContext } from "../context/ContextProvider";
import { fileUpload, getChats } from "../server/homePage";

const IndiChats = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const phrase = location.state?.phrase;

  const {
    state,
    dispatch,
    state: {
      socket,
      user,
      chats: { activeChats },
    },
  } = useGlobalContext();

  const bottomRef = useRef();
  const [msg, setMsg] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get latest chatData
  const chatData = useMemo(
    () => activeChats.find((chat) => chat.phrase === phrase),
    [activeChats, phrase]
  );

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chatData?.messages]);

  // Auto-scroll also when viewport resizes (keyboard open/close on mobile)
  useEffect(() => {
    const handleResize = () => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch chats
  useEffect(() => {
    (async () => {
      const res = await getChats();
      dispatch({
        type: "POPULATE_NEW_CHATS",
        value: res.data.data.activeChats,
      });
    })();
  }, []);

  // Join/leave socket room
  useEffect(() => {
    if (!chatData) return navigate("/chats");

    socket.emit("join_room", { roomPhrase: chatData.phrase });

    const handleNewMessage = async (data) => {
      if (data.phrase === chatData.phrase) {
        const res = await getChats();
        dispatch({
          type: "POPULATE_NEW_CHATS",
          value: res.data.data.activeChats,
        });
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.emit("leaveRoom", chatData.phrase);
      socket.off("newMessage", handleNewMessage);
    };
  }, [chatData]);

  // Send Text or Image(s)
  const handleSend = () => {
    if (!msg.trim() && images.length === 0) return;

    const messageData = {
      text: msg || "",
      images: images.length > 0 ? images : null,
      sender: {
        _id: user._id,
        username: user.username,
      },
      phrase: chatData.phrase,
      createdAt: new Date(),
    };

    socket.emit("send_message", messageData);
    setMsg("");
    setImages([]);
  };

  // Handle File Upload
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setLoading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fileUpload(formData);
        if (res.data.data.success && res.data?.data?.cloudinary?.url) {
          return res.data.data.cloudinary.url;
        } else {
          return null;
        }
      });

      const uploadedUrls = (await Promise.all(uploadPromises)).filter(Boolean);
      setImages(uploadedUrls);
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`h-[100dvh] w-full bg-[#121c26] text-white flex flex-col p-3 sm:p-4 relative ${
        loading ? "pointer-events-none" : "pointer-events-auto"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <FaArrowLeft
          className="cursor-pointer text-xl text-green-400"
          onClick={() => navigate(-1)}
        />
        <h1 className="text-lg sm:text-2xl font-semibold text-green-400 truncate">
          {chatData?.phrase}
        </h1>
      </div>

      <p className="text-xs sm:text-sm text-gray-400 mb-3 truncate">
        Created at: {moment(chatData?.createdAt).format("MMM Do YYYY, h:mm A")}
      </p>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto noScroll bg-[#1f2a37] p-3 rounded-lg">
        {chatData?.messages?.map((message, i) => {
          const isOwn = message?.sender?._id === user._id;
          return (
            <div
              key={i}
              className={`px-4 py-2 mb-2 max-w-[85%] sm:max-w-xs break-words ${
                isOwn
                  ? "bg-green-600 ml-auto rounded-2xl rounded-br-sm"
                  : "bg-[#2c3e50] mr-auto rounded-2xl rounded-bl-sm"
              }`}
            >
              {message.images &&
                Array.isArray(message.images) &&
                message.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt="shared"
                    className="mt-2 rounded-lg max-w-full cursor-pointer"
                    onClick={() => window.open(img, "_blank")}
                  />
                ))}

              {message.image && (
                <img
                  src={message.image}
                  alt="shared"
                  className="mt-2 rounded-lg max-w-full cursor-pointer"
                  onClick={() => window.open(message.image, "_blank")}
                />
              )}

              {message.text && (
                <p className="text-white break-words">{message.text}</p>
              )}
              <p className="text-gray-300 text-xs italic mt-1">
                {isOwn ? "You" : message?.sender?.username || "Other"} •{" "}
                {moment(message.createdAt).format("h:mm A")}
              </p>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input Box */}
      <div className="mt-3 flex gap-2 items-center">
        <label className="cursor-pointer bg-[#1f2a37] p-3 rounded-lg border border-[#2b3b4e]">
          <FaPhotoVideo className="text-green-400" />
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        <input
          type="text"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="flex-1 bg-[#1f2a37] text-white p-3 rounded-lg border border-[#2b3b4e] outline-none text-sm"
        />
        <button
          onClick={handleSend}
          className="bg-green-500 hover:bg-green-600 cursor-pointer px-4 py-2 rounded-lg text-white font-semibold text-sm whitespace-nowrap"
        >
          Send
        </button>
      </div>

      {/* Preview Modal for multiple images */}
      {images.length > 0 && !loading && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1f2a37] p-6 rounded-2xl shadow-xl w-[95%] max-w-2xl flex flex-col gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
              {images.map((img, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={img}
                    alt="preview"
                    className="h-40 w-full object-cover rounded-lg"
                  />
                  <button
                    onClick={() =>
                      setImages(images.filter((_, i) => i !== idx))
                    }
                    className="absolute top-1 right-1 bg-red-600 text-white px-2 py-1 rounded-full text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <input
              type="text"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Add a caption..."
              className="w-full bg-[#121c26] border border-[#2b3b4e] text-white p-3 rounded-lg outline-none text-sm"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setImages([]);
                  setMsg("");
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white text-sm font-medium"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Modal */}
      {loading && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1f2a37]/90 p-6 rounded-xl flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-green-400 font-semibold">Uploading...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndiChats;

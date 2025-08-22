import React, { useEffect, useState, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import { FaArrowLeft, FaPhotoVideo, FaTimes } from "react-icons/fa";
import { useGlobalContext } from "../context/ContextProvider";
import { fileUpload, getChats } from "../server/homePage";

const IndiChats = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const phrase = location.state?.phrase;

  const {
    state: {
      socket,
      user,
      chats: { activeChats },
    },
    dispatch,
  } = useGlobalContext();

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const [msg, setMsg] = useState("");
  // Preview items: { id, file, localUrl, uploading, uploadedUrl, error }
  const [previewFiles, setPreviewFiles] = useState([]);

  // Pull current chat data
  const chatData = useMemo(
    () => activeChats.find((chat) => chat.phrase === phrase),
    [activeChats, phrase]
  );

  /** Auto-scroll helper */
  const scrollToBottom = () => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 80);
  };

  // Scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [chatData?.messages]);

  // Scroll on viewport changes (e.g., mobile keyboard)
  useEffect(() => {
    const handleResize = () => scrollToBottom();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Scroll when focusing the input
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.addEventListener("focus", scrollToBottom);
    return () => el.removeEventListener("focus", scrollToBottom);
  }, []);

  // Fetch chats on mount
  useEffect(() => {
    (async () => {
      const res = await getChats();
      dispatch({ type: "POPULATE_NEW_CHATS", value: res.data.data.activeChats });
    })();
  }, [dispatch]);

  // Join/leave room + refresh on new messages
  useEffect(() => {
    if (!chatData) return navigate("/chats");

    socket.emit("join_room", { roomPhrase: chatData.phrase });

    const handleNewMessage = async (data) => {
      if (data.phrase === chatData.phrase) {
        const res = await getChats();
        dispatch({ type: "POPULATE_NEW_CHATS", value: res.data.data.activeChats });
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => {
      socket.emit("leaveRoom", chatData.phrase);
      socket.off("newMessage", handleNewMessage);
    };
  }, [chatData, socket, dispatch, navigate]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      previewFiles.forEach((p) => p?.localUrl && URL.revokeObjectURL(p.localUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Compute send availability */
  const anyUploading = previewFiles.some((p) => p.uploading);
  const uploadedUrls = previewFiles.map((p) => p.uploadedUrl).filter(Boolean);
  const canSend = !anyUploading && (msg.trim().length > 0 || uploadedUrls.length > 0);

  /** Send text + uploaded images only */
  const handleSend = () => {
    if (!canSend) return;

    const messageData = {
      text: msg.trim() || "",
      images: uploadedUrls.length > 0 ? uploadedUrls : null,
      sender: { _id: user._id, username: user.username },
      phrase: chatData.phrase,
      createdAt: new Date(),
    };

    socket.emit("send_message", messageData);

    // reset composer
    previewFiles.forEach((p) => p?.localUrl && URL.revokeObjectURL(p.localUrl));
    setMsg("");
    setPreviewFiles([]);
    scrollToBottom();
  };

  /** Handle file selection (per-photo loader, no global loader) */
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Add local previews immediately with uploading=true
    const now = Date.now();
    const newPreviews = files.map((f, i) => ({
      id: `${now}_${i}_${f.name}`,
      file: f,
      localUrl: URL.createObjectURL(f),
      uploading: true,
      uploadedUrl: null,
      error: false,
    }));

    setPreviewFiles((prev) => [...prev, ...newPreviews]);
    scrollToBottom();

    // Upload each and patch its state by id
    await Promise.all(
      newPreviews.map(async (p) => {
        try {
          const formData = new FormData();
          formData.append("file", p.file);
          const res = await fileUpload(formData);
          const url = res?.data?.data?.cloudinary?.url || null;

          setPreviewFiles((prev) =>
            prev.map((item) =>
              item.id === p.id
                ? { ...item, uploading: false, uploadedUrl: url, error: !url }
                : item
            )
          );
        } catch (err) {
          console.error("Upload error:", err);
          setPreviewFiles((prev) =>
            prev.map((item) =>
              item.id === p.id ? { ...item, uploading: false, uploadedUrl: null, error: true } : item
            )
          );
        }
      })
    );

    e.target.value = null;
  };

  /** Remove a preview (revoke URL, drop entry) */
  const removePreview = (id) => {
    setPreviewFiles((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target?.localUrl) URL.revokeObjectURL(target.localUrl);
      return prev.filter((p) => p.id !== id);
    });
  };

  return (
    <div className="h-[93dvh] w-full bg-[#121c26] text-white flex flex-col p-3 sm:p-4 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3 flex-shrink-0">
        <FaArrowLeft className="cursor-pointer text-xl text-green-400" onClick={() => navigate(-1)} />
        <h1 className="text-lg sm:text-2xl font-semibold text-green-400 truncate">
          {chatData?.phrase}
        </h1>
      </div>

      <p className="text-xs sm:text-sm text-gray-400 mb-3 truncate flex-shrink-0">
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
              {Array.isArray(message.images) &&
                message.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt="shared"
                    className="mt-2 rounded-lg max-w-full cursor-pointer"
                    onClick={() => window.open(img, "_blank")}
                  />
                ))}

              {message.text && <p className="text-white break-words">{message.text}</p>}

              <p className="text-gray-300 text-xs italic mt-1">
                {isOwn ? "You" : message?.sender?.username || "Other"} •{" "}
                {moment(message.createdAt).format("h:mm A")}
              </p>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* WhatsApp-like preview strip */}
      {previewFiles.length > 0 && (
        <div className="bg-[#1f2a37] p-2 border-t border-[#2b3b4e] flex gap-2 overflow-x-auto rounded-lg mt-2">
          {previewFiles.map((p) => (
            <div
              key={p.id}
              className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-gray-600"
            >
              <img src={p.localUrl} alt="preview" className="w-full h-full object-cover" />

              {/* Per-photo loader */}
              {p.uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {/* Upload error badge (optional) */}
              {!p.uploading && !p.uploadedUrl && p.error && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-xs bg-red-600 px-2 py-0.5 rounded">Failed</span>
                </div>
              )}

              <button
                className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-white"
                onClick={() => removePreview(p.id)}
                title="Remove"
              >
                <FaTimes size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Composer */}
      <div className="mt-3 flex gap-2 items-center flex-shrink-0">
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
          ref={inputRef}
          type="text"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && canSend && handleSend()}
          placeholder="Type a message..."
          className="flex-1 bg-[#1f2a37] text-white p-3 rounded-lg border border-[#2b3b4e] outline-none text-sm"
        />

        <button
          onClick={handleSend}
          disabled={!canSend}
          className={`px-4 py-2 rounded-lg text-white font-semibold text-sm whitespace-nowrap
            ${canSend ? "bg-green-500 hover:bg-green-600 cursor-pointer" : "bg-green-500/50 cursor-not-allowed"}`}
          title={anyUploading ? "Please wait for uploads to finish" : "Send"}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default IndiChats;

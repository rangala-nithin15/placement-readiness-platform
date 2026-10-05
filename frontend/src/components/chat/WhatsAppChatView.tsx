import {
  AlertCircle,
  CheckCheck,
  GraduationCap,
  RefreshCw,
  Send,
  ShieldCheck,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import {
  type ChatGroupInfo,
  type ChatMessage,
  connectChatWebSocket,
  fetchChatGroup,
  fetchChatMessages,
  sendChatMessage,
} from "../../services/chatService";

interface WhatsAppChatViewProps {
  userRole: "STUDENT" | "MENTOR";
}

export default function WhatsAppChatView({ userRole }: WhatsAppChatViewProps) {
  const [group, setGroup] = useState<ChatGroupInfo | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const pollingTimerRef = useRef<number | null>(null);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  };

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchChatGroup();
      setGroup(data.group);
      setMessages(data.messages);
      setCurrentUserId(data.current_user_id);
    } catch (err: any) {
      setError(err?.message || "Failed to load mentorship group chat.");
    } finally {
      setLoading(false);
      setTimeout(() => scrollToBottom(false), 100);
    }
  };

  // Initial load
  useEffect(() => {
    loadInitialData();
  }, []);

  // Connect WebSocket when group room is available
  useEffect(() => {
    if (!group?.room_id) return;

    const ws = connectChatWebSocket(
      group.room_id,
      (newMsg: ChatMessage) => {
        setMessages((prev) => {
          // Avoid duplicate by id
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        setTimeout(() => scrollToBottom(true), 50);
      },
      () => {
        setIsConnected(true);
      },
      () => {
        setIsConnected(false);
      }
    );

    wsRef.current = ws;

    // Background polling fallback every 4 seconds in case WS is interrupted
    pollingTimerRef.current = window.setInterval(async () => {
      try {
        setMessages((prev) => {
          const lastMsg = prev[prev.length - 1];
          const since = lastMsg?.created_at;
          fetchChatMessages(since)
            .then((res) => {
              if (res.messages && res.messages.length > 0) {
                setMessages((current) => {
                  const existingIds = new Set(current.map((m) => m.id));
                  const newItems = res.messages.filter((m) => !existingIds.has(m.id));
                  if (newItems.length === 0) return current;
                  setTimeout(() => scrollToBottom(true), 50);
                  return [...current, ...newItems];
                });
              }
            })
            .catch(() => {});
          return prev;
        });
      } catch {
        // quiet fallback
      }
    }, 4000);

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
      }
    };
  }, [group?.room_id]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || sending) return;

    setSending(true);
    try {
      const res = await sendChatMessage(trimmed);
      setInputText("");
      // Add message immediately if not already present
      setMessages((prev) => {
        if (prev.some((m) => m.id === res.message.id)) return prev;
        return [...prev, res.message];
      });
      setTimeout(() => scrollToBottom(true), 50);
    } catch (err: any) {
      alert(err?.message || "Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessageTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const formatMessageDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  if (loading) {
    return (
      <div className="flex h-[75vh] items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm font-medium text-slate-600">
            Connecting to your Mentorship Group...
          </p>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="flex h-[75vh] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <AlertCircle size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-800">
          Mentorship Group Unavailable
        </h3>
        <p className="mt-2 max-w-md text-sm text-slate-600">
          {error ||
            "You are not assigned to a mentor group yet. Please contact your college administrator to complete your mentor assignment."}
        </p>
        <button
          onClick={loadInitialData}
          className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
        >
          <RefreshCw size={16} />
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-[82vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* CHAT MAIN CONTAINER */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* WHATSAPP-STYLE HEADER */}
        <div className="flex h-18 items-center justify-between border-b border-slate-200 bg-slate-50/90 px-6 backdrop-blur">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* AVATAR */}
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white font-bold text-base shadow-sm">
              {group.mentor_name.charAt(0) || "M"}
            </div>

            {/* GROUP DETAILS */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-base font-bold text-slate-900">
                  {group.mentor_name}'s Mentorship Group
                </h2>
                <span className="shrink-0 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                  {group.department}
                </span>
              </div>
              <p className="truncate text-xs text-slate-500">
                Mentor: {group.mentor_code} • {group.member_count} Members
              </p>
            </div>
          </div>

          {/* ACTION BUTTONS & STATUS */}
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                isConnected
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-slate-100 text-slate-600 border border-slate-200"
              }`}
              title={isConnected ? "Real-time WebSocket Active" : "Polling Sync Active"}
            >
              {isConnected ? (
                <>
                  <Wifi size={13} className="text-emerald-600" />
                  <span>Live</span>
                </>
              ) : (
                <>
                  <WifiOff size={13} className="text-slate-500" />
                  <span>Syncing</span>
                </>
              )}
            </div>

            <button
              onClick={() => setShowMembers(!showMembers)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              title="View Group Members"
            >
              <Users size={15} />
              <span className="hidden sm:inline">Members</span>
            </button>
          </div>
        </div>

        {/* CHAT MESSAGES AREA (WhatsApp-Style Background Pattern) */}
        <div className="relative flex-1 overflow-y-auto bg-slate-100/70 p-4 sm:p-6">
          {/* Subtle watermark / pattern */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:16px_16px]" />

          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Users size={28} />
              </div>
              <h4 className="mt-3 text-base font-semibold text-slate-800">
                Welcome to the Mentorship Group!
              </h4>
              <p className="mt-1 max-w-sm text-xs text-slate-500">
                This group is exclusively for {group.mentor_name} and assigned
                mentees. Send a message to start communicating!
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {messages.map((msg, index) => {
                const isOwnMessage =
                  msg.sender_id === currentUserId ||
                  (userRole === "STUDENT" &&
                    msg.sender_register_number &&
                    msg.sender_role === "STUDENT" &&
                    msg.sender_id === currentUserId);

                const isMentorMsg = msg.sender_role === "MENTOR";

                // Group date header
                const showDateHeader =
                  index === 0 ||
                  formatMessageDate(messages[index - 1].created_at) !==
                    formatMessageDate(msg.created_at);

                return (
                  <React.Fragment key={msg.id || index}>
                    {showDateHeader && (
                      <div className="flex justify-center my-3">
                        <span className="rounded-full bg-slate-200/90 px-3.5 py-1 text-[11px] font-semibold text-slate-600 shadow-2xs">
                          {formatMessageDate(msg.created_at)}
                        </span>
                      </div>
                    )}

                    <div
                      className={`flex ${
                        isOwnMessage ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-xs ${
                          isOwnMessage
                            ? "bg-emerald-600 text-white rounded-br-xs"
                            : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs"
                        }`}
                      >
                        {/* SENDER INFO (if not own message) */}
                        {!isOwnMessage && (
                          <div className="mb-1 flex items-center gap-1.5">
                            <span
                              className={`text-xs font-bold ${
                                isMentorMsg
                                  ? "text-indigo-600"
                                  : "text-emerald-700"
                              }`}
                            >
                              {msg.sender_name}
                            </span>
                            {isMentorMsg ? (
                              <span className="inline-flex items-center gap-0.5 rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700">
                                <ShieldCheck size={11} />
                                Mentor
                              </span>
                            ) : (
                              msg.sender_register_number && (
                                <span className="inline-flex items-center gap-0.5 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                                  <GraduationCap size={11} />
                                  {msg.sender_register_number}
                                </span>
                              )
                            )}
                          </div>
                        )}

                        {/* MESSAGE CONTENT */}
                        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                          {msg.message}
                        </p>

                        {/* TIMESTAMP & STATUS */}
                        <div
                          className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                            isOwnMessage ? "text-emerald-100" : "text-slate-400"
                          }`}
                        >
                          <span>{formatMessageTime(msg.created_at)}</span>
                          {isOwnMessage && (
                            <CheckCheck size={13} className="text-emerald-200" />
                          )}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* INPUT BAR */}
        <form
          onSubmit={handleSend}
          className="flex items-center gap-3 border-t border-slate-200 bg-white p-3.5 sm:px-6"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message to your mentorship group..."
            disabled={sending}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
          />

          <button
            type="submit"
            disabled={sending || !inputText.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? (
              <RefreshCw size={17} className="animate-spin" />
            ) : (
              <Send size={17} />
            )}
          </button>
        </form>
      </div>

      {/* MEMBERS SIDE DRAWER */}
      {showMembers && (
        <div className="w-72 shrink-0 border-l border-slate-200 bg-slate-50 p-5 overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-800">Group Members</h3>
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
              {group.member_count}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {/* MENTOR CARD */}
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                  {group.mentor_name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-indigo-950">
                    {group.mentor_name}
                  </p>
                  <p className="truncate text-[11px] text-indigo-700">
                    {group.mentor_code} • Faculty Mentor
                  </p>
                </div>
              </div>
            </div>

            {/* MENTEES LIST */}
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Assigned Students ({group.members.length})
              </p>
              {group.members.map((member) => (
                <div
                  key={member.user_id}
                  className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-2.5 shadow-2xs"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                    {member.name.charAt(0) || "S"}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-800">
                      {member.name}
                    </p>
                    <p className="truncate text-[10px] text-slate-500">
                      {member.register_number || "Student"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

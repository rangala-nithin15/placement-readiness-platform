import { apiRequest } from "./api";
import { getStoredToken } from "./authStorage";

export interface ChatMember {
  user_id: string;
  name: string;
  register_number?: string;
  role: "STUDENT" | "MENTOR";
}

export interface ChatGroupInfo {
  room_id: string;
  mentor_id: string;
  mentor_name: string;
  mentor_code: string;
  department: string;
  members: ChatMember[];
  member_count: number;
}

export interface ChatMessage {
  id: string;
  mentor_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: "MENTOR" | "STUDENT";
  sender_register_number?: string | null;
  sender_mentor_id?: string | null;
  message: string;
  created_at: string;
}

export interface ChatGroupResponse {
  group: ChatGroupInfo;
  messages: ChatMessage[];
  current_user_id: string;
}

export async function fetchChatGroup(): Promise<ChatGroupResponse> {
  const token = getStoredToken();
  return apiRequest<ChatGroupResponse>("/chat/group", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function fetchChatMessages(since?: string): Promise<{ messages: ChatMessage[] }> {
  const token = getStoredToken();
  const query = since ? `?since=${encodeURIComponent(since)}` : "";
  return apiRequest<{ messages: ChatMessage[] }>(`/chat/messages${query}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function sendChatMessage(message: string): Promise<{ message: ChatMessage }> {
  const token = getStoredToken();
  return apiRequest<{ message: ChatMessage }>("/chat/messages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message }),
  });
}

export function connectChatWebSocket(
  roomId: string,
  onMessage: (message: ChatMessage) => void,
  onOpen?: () => void,
  onClose?: () => void
): WebSocket | null {
  const token = getStoredToken();
  if (!token || !roomId) return null;

  try {
    const wsUrl = `ws://127.0.0.1:8000/api/chat/ws/${roomId}?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      if (onOpen) onOpen();
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "chat_message" && payload.message) {
          onMessage(payload.message);
        }
      } catch (err) {
        console.error("Failed to parse incoming WS message:", err);
      }
    };

    ws.onclose = () => {
      if (onClose) onClose();
    };

    ws.onerror = () => {
      if (onClose) onClose();
    };

    return ws;
  } catch (err) {
    console.error("Failed to establish WebSocket connection:", err);
    return null;
  }
}

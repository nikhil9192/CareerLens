import { useCallback, useEffect, useRef, useState } from "react";
import {
  clearAiHistory,
  fetchAiHistory,
  fetchAiSuggestions,
  sendAiMessage,
  sendAiVoice,
  type AiChatMessage,
} from "../services/ai.api";
import { getStudentName } from "../services/auth";

const MAX_CHARS = 500;
const COUNTER_THRESHOLD = 400;
const MAX_RECORDING_SECONDS = 60;

function pickRecorderMimeType(): string {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg",
  ];
  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return "";
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      resolve(dataUrl.slice(dataUrl.indexOf(",") + 1));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatTime(iso?: string): string {
  if (!iso) {
    return new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildWelcomeMessage(studentName: string): string {
  return `Namaste ${studentName}! 👋
Main CareerLens AI hoon — tumhara personal career counsellor.
Tumhare marks, quiz results, aur teacher feedback — sab mujhe pata hai.
Koi bhi career ya padhai ka sawaal poochho, main help karunga!`;
}

function getErrorMessage(err: unknown): { text: string; type: "rate" | "network" | "api" } {
  const status = (err as { response?: { status?: number } })?.response?.status;
  const errorText =
    (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "";

  if (status === 0) {
    return { text: "Please check your connection", type: "network" };
  }
  if (status === 429) {
    return {
      text: "You have reached today's limit of 20 messages. Come back tomorrow!",
      type: "rate",
    };
  }
  if (status === 503) {
    return {
      text:
        errorText ||
        "AI service is temporarily busy. Please wait 30 seconds and try again.",
      type: "api",
    };
  }
  if (errorText) {
    return { text: errorText, type: "api" };
  }
  return {
    text: "Could not get an AI response. Please try again in a moment.",
    type: "api",
  };
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
        style={{ background: "var(--accent-purple)" }}
      >
        CL
      </div>
      <div className="card max-w-[85%] rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <span className="typing-dot h-2 w-2 rounded-full bg-[var(--accent-cyan)]" />
            <span className="typing-dot typing-dot-delay-1 h-2 w-2 rounded-full bg-[var(--accent-cyan)]" />
            <span className="typing-dot typing-dot-delay-2 h-2 w-2 rounded-full bg-[var(--accent-cyan)]" />
          </div>
          <span className="text-xs text-[var(--text-secondary)]">
            CareerLens AI is thinking...
          </span>
        </div>
      </div>
    </div>
  );
}

function UserBubble({
  message,
  initials,
  time,
}: {
  message: string;
  initials: string;
  time: string;
}) {
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-end justify-end gap-2">
        <div
          className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md px-4 py-3 text-sm text-[#0A0F1E]"
          style={{
            background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))",
          }}
        >
          {message}
        </div>
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-[#0A0F1E]"
          style={{ background: "var(--accent-cyan)" }}
        >
          {initials}
        </div>
      </div>
      <span className="pr-10 text-[10px] text-[var(--text-secondary)]">{time}</span>
    </div>
  );
}

function AiBubble({ message, time }: { message: string; time: string }) {
  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex items-end gap-2">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ background: "var(--accent-purple)" }}
        >
          CL
        </div>
        <div className="card max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-md px-4 py-3 text-sm text-[var(--text-primary)]">
          {message}
        </div>
      </div>
      <span className="pl-10 text-[10px] text-[var(--text-secondary)]">{time}</span>
    </div>
  );
}

export default function AiChat() {
  const studentName = getStudentName() ?? "Student";
  const studentInitials = getInitials(studentName);

  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showWelcome, setShowWelcome] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<number | null>(null);
  const cancelRecordingRef = useRef(false);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErrorBanner(null);

      const [historyResult, suggestionsResult] = await Promise.allSettled([
        fetchAiHistory(),
        fetchAiSuggestions(),
      ]);

      if (historyResult.status === "fulfilled") {
        const history = historyResult.value;
        if (history.length > 0) {
          setMessages(history);
          setShowWelcome(false);
        } else {
          setShowWelcome(true);
        }
      } else {
        setShowWelcome(true);
        console.warn("Could not load chat history:", historyResult.reason);
      }

      if (suggestionsResult.status === "fulfilled") {
        setSuggestions(suggestionsResult.value);
      } else {
        setSuggestions([
          "Which stream should I choose after Class 10?",
          "How do I take the career quiz?",
          "How do I improve my marks?",
          "How do I explain my career choice to my parents?",
        ]);
      }

      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending, showWelcome, scrollToBottom]);

  async function handleSend(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setErrorBanner(null);
    setShowWelcome(false);
    setSending(true);

    const userMsg: AiChatMessage = {
      role: "user",
      message: trimmed,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const result = await sendAiMessage(trimmed);
      const aiMsg: AiChatMessage = {
        role: "assistant",
        message: result.response,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m !== userMsg));
      const { text: errText } = getErrorMessage(err);
      setErrorBanner(errText);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  }

  function stopRecordTimer() {
    if (recordTimerRef.current !== null) {
      window.clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    setRecordSeconds(0);
  }

  async function sendVoiceMessage(audioBlob: Blob, mimeType: string) {
    setErrorBanner(null);
    setShowWelcome(false);
    setSending(true);

    try {
      const audioBase64 = await blobToBase64(audioBlob);
      const result = await sendAiVoice(audioBase64, mimeType);

      const userMsg: AiChatMessage = {
        role: "user",
        message: result.transcript,
        created_at: new Date().toISOString(),
      };
      const aiMsg: AiChatMessage = {
        role: "assistant",
        message: result.response,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg, aiMsg]);
    } catch (err) {
      const { text: errText } = getErrorMessage(err);
      setErrorBanner(errText);
    } finally {
      setSending(false);
    }
  }

  async function startRecording() {
    if (sending || recording) return;

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setErrorBanner("Voice input is not supported in this browser.");
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setErrorBanner("Microphone permission denied. Allow mic access and try again.");
      return;
    }

    const mimeType = pickRecorderMimeType();
    const recorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream);

    audioChunksRef.current = [];
    cancelRecordingRef.current = false;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        audioChunksRef.current.push(e.data);
      }
    };

    recorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      setRecording(false);
      stopRecordTimer();

      if (cancelRecordingRef.current) return;

      const type = recorder.mimeType || mimeType || "audio/webm";
      const blob = new Blob(audioChunksRef.current, { type });
      if (blob.size < 1000) {
        setErrorBanner("Recording was too short. Tap the mic and speak your question.");
        return;
      }
      void sendVoiceMessage(blob, type);
    };

    mediaRecorderRef.current = recorder;
    recorder.start();
    setRecording(true);
    setErrorBanner(null);
    setRecordSeconds(0);

    recordTimerRef.current = window.setInterval(() => {
      setRecordSeconds((prev) => {
        if (prev + 1 >= MAX_RECORDING_SECONDS) {
          mediaRecorderRef.current?.stop();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
  }

  function cancelRecording() {
    cancelRecordingRef.current = true;
    mediaRecorderRef.current?.stop();
  }

  useEffect(() => {
    return () => {
      cancelRecordingRef.current = true;
      mediaRecorderRef.current?.stop();
      if (recordTimerRef.current !== null) {
        window.clearInterval(recordTimerRef.current);
      }
    };
  }, []);

  async function handleClearChat() {
    setShowClearConfirm(false);
    try {
      await clearAiHistory();
      setMessages([]);
      setShowWelcome(true);
      setErrorBanner(null);
    } catch (err) {
      const { text } = getErrorMessage(err);
      setErrorBanner(text);
    }
  }

  const charCount = input.length;
  const welcomeText = buildWelcomeMessage(studentName);

  return (
    <div className="flex h-[calc(100dvh-3.5rem-4.5rem)] flex-col bg-[var(--bg-primary)] md:h-[calc(100dvh-3.5rem)]">
      {/* Chat header */}
      <header
        className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b px-4 py-3"
        style={{
          background: "var(--navbar-bg)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ background: "var(--accent-purple)" }}
          >
            CL
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--text-primary)]">
              CareerLens AI
            </p>
            <p className="text-xs text-[var(--text-secondary)]">Career Counsellor</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--success)]" />
            <span className="text-xs text-[var(--success)]">Online</span>
          </div>
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="rounded-lg p-2 text-[var(--text-secondary)] transition hover:bg-[var(--bg-card-hover)] hover:text-[var(--error)]"
            aria-label="Clear chat"
            title="Clear chat"
          >
            🗑️
          </button>
        </div>
      </header>

      {/* Error banner */}
      {errorBanner && (
        <div
          role="alert"
          className="shrink-0 px-4 py-2 text-center text-sm text-[var(--error)]"
          style={{ backgroundColor: "var(--color-error-bg)" }}
        >
          {errorBanner}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
        {loading ? (
          <div className="space-y-4">
            <div className="skeleton-bone h-16 w-3/4 rounded-2xl" />
            <div className="skeleton-bone ml-auto h-12 w-1/2 rounded-2xl" />
          </div>
        ) : (
          <div className="space-y-4">
            {showWelcome && messages.length === 0 && (
              <>
                <AiBubble message={welcomeText} time={formatTime()} />
                {suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 pl-10">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        disabled={sending}
                        onClick={() => handleSend(suggestion)}
                        className="rounded-full border border-[var(--accent-cyan)] bg-[rgba(0,212,255,0.08)] px-3 py-1.5 text-left text-xs text-[var(--accent-cyan)] transition hover:bg-[rgba(0,212,255,0.15)] disabled:opacity-50"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {messages.map((msg, index) =>
              msg.role === "user" ? (
                <UserBubble
                  key={`${msg.created_at ?? index}-user`}
                  message={msg.message}
                  initials={studentInitials}
                  time={formatTime(msg.created_at)}
                />
              ) : (
                <AiBubble
                  key={`${msg.created_at ?? index}-ai`}
                  message={msg.message}
                  time={formatTime(msg.created_at)}
                />
              )
            )}

            {sending && <TypingIndicator />}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div
        className="sticky bottom-0 shrink-0 border-t px-4 py-3 pb-[env(safe-area-inset-bottom)] md:pb-3"
        style={{
          background: "var(--navbar-bg)",
          borderColor: "var(--border)",
        }}
      >
        {charCount > COUNTER_THRESHOLD && !recording && (
          <p className="mb-1 text-right text-xs text-[var(--text-secondary)]">
            {charCount}/{MAX_CHARS}
          </p>
        )}
        {recording ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={cancelRecording}
              className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--bg-card-hover)]"
            >
              Cancel
            </button>
            <div className="flex flex-1 items-center justify-center gap-2">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[var(--error)]" />
              <span className="text-sm font-semibold text-[var(--text-primary)]">
                Recording... {recordSeconds}s
              </span>
              <span className="text-xs text-[var(--text-secondary)]">
                / {MAX_RECORDING_SECONDS}s
              </span>
            </div>
            <button
              type="button"
              onClick={stopRecording}
              className="btn-primary flex h-11 items-center justify-center gap-2 rounded-xl px-4"
              aria-label="Stop and send voice message"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
              <span className="text-sm font-semibold">Send</span>
            </button>
          </div>
        ) : (
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                if (e.target.value.length <= MAX_CHARS) {
                  setInput(e.target.value);
                }
              }}
              onKeyDown={handleKeyDown}
              disabled={sending}
              placeholder="Apna sawaal likho ya mic dabao..."
              rows={1}
              className="input-dark max-h-32 min-h-[44px] flex-1 resize-none py-2.5 text-sm disabled:opacity-60"
            />
            <button
              type="button"
              onClick={startRecording}
              disabled={sending}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--accent-cyan)] transition hover:bg-[var(--bg-card-hover)] disabled:opacity-50"
              aria-label="Record voice message"
              title="Speak your question"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => handleSend(input)}
              disabled={sending || !input.trim()}
              className="btn-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-xl p-0 disabled:opacity-50"
              aria-label="Send message"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Clear confirmation */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="auth-card w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              Clear chat?
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Are you sure? This will delete all chat history.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 rounded-xl border border-[var(--border)] py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--bg-card-hover)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearChat}
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition"
                style={{ backgroundColor: "var(--error)" }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

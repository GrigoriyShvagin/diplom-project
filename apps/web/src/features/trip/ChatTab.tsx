import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/shared/lib/auth-context";
import { UserAvatar, UserAvatarStack } from "@/shared/ui/UserAvatar";
import { listMessages, sendMessage, type ApiAuthor, type ApiMessage } from "@/shared/api/chat";
import { getTrip } from "@/shared/api/trips";

const iconBtn: CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 999,
  background: "transparent",
  border: "none",
  color: "var(--ink-2)",
  fontSize: 16,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

const GUIDE_RE = /@гид(?![а-яА-ЯёЁ])/i;

export function ChatTab({ tripId }: { tripId: string }) {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const messagesKey = ["trips", tripId, "messages"] as const;

  const messagesQuery = useQuery({
    queryKey: messagesKey,
    queryFn: () => listMessages(tripId),
  });
  const tripQuery = useQuery({
    queryKey: ["trips", tripId] as const,
    queryFn: () => getTrip(tripId),
  });

  const messages = useMemo(
    () => messagesQuery.data ?? [],
    [messagesQuery.data],
  );
  const tripMembers = tripQuery.data?.members ?? [];

  const [input, setInput] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [railOpen, setRailOpen] = useState(false);
  const [transientError, setTransientError] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, thinking]);

  const sendMutation = useMutation({
    mutationFn: (text: string) => sendMessage(tripId, text),
    onSuccess: (result) => {
      queryClient.setQueryData<ApiMessage[]>(messagesKey, (prev) =>
        prev ? [...prev, ...result.messages] : result.messages,
      );
      if (result.aiError) {
        setTransientError(result.aiError);
        setTimeout(() => setTransientError(null), 6000);
      }
    },
    onError: (err: unknown) => {
      setTransientError(err instanceof Error ? err.message : "Не удалось отправить сообщение");
    },
    onSettled: () => setThinking(false),
  });

  const send = async () => {
    const txt = input.trim();
    if (!txt || sendMutation.isPending) return;
    setInput("");
    setTransientError(null);
    if (GUIDE_RE.test(txt)) setThinking(true);
    sendMutation.mutate(txt);
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  const onChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setInput(v);
    setShowMentions(v.endsWith("@"));
  };

  const insertMention = (handle: string) => {
    setInput((prev) => prev.replace(/@$/, "@" + handle + " "));
    setShowMentions(false);
  };

  type Entry = ApiMessage | { divider: string; id: string };
  const grouped: Entry[] = [];
  let lastDate: string | null = null;
  for (const m of messages) {
    const label = dateLabel(m.createdAt);
    if (label !== lastDate) {
      grouped.push({ divider: label, id: `div-${label}-${m.id}` });
      lastDate = label;
    }
    grouped.push(m);
  }

  const myId = auth.user?.id;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 64px)",
        margin: "-32px -40px",
        background: "var(--paper-2)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 24px",
          background: "var(--paper)",
          borderBottom: "1px solid var(--line)",
          flexShrink: 0,
          zIndex: 2,
        }}
      >
        <span
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--terracotta), oklch(0.50 0.10 30))",
            color: "var(--paper)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-display)",
            fontSize: 16,
            fontStyle: "italic",
            flexShrink: 0,
          }}
        >
          {(tripQuery.data?.title?.slice(0, 2) ?? "Гр").trim()}
        </span>
        <div style={{ flex: 1, minWidth: 0, lineHeight: 1.2 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>
            {tripQuery.data?.title ?? "Чат поездки"}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--ink-3)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>{tripMembers.length} участников</span>
            <span
              style={{
                width: 3,
                height: 3,
                borderRadius: 999,
                background: "var(--ink-3)",
              }}
            />
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: "oklch(0.70 0.15 145)",
                }}
              />
              @гид онлайн
            </span>
          </div>
        </div>
        <UserAvatarStack users={tripMembers.map((m) => m.user)} size={24} max={5} />
        {!railOpen && (
          <button onClick={() => setRailOpen(true)} title="Контекст гида" style={iconBtn}>
            ☰
          </button>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: railOpen ? "minmax(0, 1fr) 300px" : "minmax(0, 1fr)",
          flex: 1,
          minHeight: 0,
          transition: "grid-template-columns 0.25s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            overflow: "hidden",
            background: "var(--paper-2)",
          }}
        >
          <div
            ref={listRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px 24px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {messagesQuery.isLoading && (
              <div
                className="mono"
                style={{
                  textAlign: "center",
                  color: "var(--ink-3)",
                  fontSize: 12,
                  padding: 24,
                }}
              >
                загрузка истории…
              </div>
            )}

            {messagesQuery.isSuccess && messages.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 24px",
                  color: "var(--ink-3)",
                  fontSize: 13,
                }}
              >
                Чат пустой. Напишите первое сообщение или попросите{" "}
                <span style={{ color: "var(--terracotta)", fontFamily: "var(--font-mono)" }}>
                  @гид
                </span>{" "}
                подсказать что-нибудь.
              </div>
            )}

            {grouped.map((entry) =>
              "divider" in entry ? (
                <div
                  key={entry.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    margin: "8px 0",
                  }}
                >
                  <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
                  <span
                    className="mono"
                    style={{
                      fontSize: 10,
                      color: "var(--ink-3)",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    {entry.divider}
                  </span>
                  <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
                </div>
              ) : (
                <Message key={entry.id} m={entry} isMe={Boolean(myId) && entry.author?.id === myId} />
              ),
            )}
            {thinking && <BotThinking />}
            {transientError && (
              <div
                className="field-error"
                style={{
                  textAlign: "center",
                  padding: "8px 12px",
                  background: "oklch(from var(--terracotta) l c h / 0.08)",
                  borderRadius: "var(--r-md)",
                }}
              >
                {transientError}
              </div>
            )}
          </div>

          <div
            style={{
              borderTop: "1px solid var(--line)",
              padding: "10px 16px",
              position: "relative",
              background: "var(--paper)",
            }}
          >
            {showMentions && (
              <MentionPopup
                tripMembers={tripMembers.map((m) => m.user)}
                onPick={insertMention}
              />
            )}
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              {auth.user && <UserAvatar user={auth.user} size={32} ring={false} />}
              <div style={{ flex: 1, position: "relative" }}>
                <textarea
                  value={input}
                  onChange={onChange}
                  onKeyDown={onKey}
                  placeholder="Напишите сообщение или @гид для подсказки…"
                  rows={1}
                  disabled={sendMutation.isPending}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    paddingRight: 90,
                    border: "1px solid var(--line)",
                    borderRadius: "var(--r-md)",
                    resize: "none",
                    fontSize: 14,
                    fontFamily: "var(--font-body)",
                    background: "var(--paper-2)",
                    color: "var(--ink)",
                    minHeight: 44,
                    maxHeight: 140,
                    lineHeight: 1.5,
                    opacity: sendMutation.isPending ? 0.6 : 1,
                  }}
                />
                <div style={{ position: "absolute", right: 10, bottom: 8, display: "flex", gap: 4 }}>
                  <button
                    onClick={() => {
                      setInput((prev) => prev + "@гид ");
                      setShowMentions(false);
                    }}
                    title="Спросить гида"
                    style={{
                      padding: "5px 10px",
                      borderRadius: 999,
                      background: "oklch(from var(--terracotta) l c h / 0.15)",
                      color: "var(--terracotta)",
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      letterSpacing: "0.04em",
                    }}
                  >
                    @гид
                  </button>
                </div>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => void send()}
                disabled={sendMutation.isPending || !input.trim()}
                style={{
                  padding: "10px 16px",
                  opacity: !input.trim() || sendMutation.isPending ? 0.4 : 1,
                }}
              >
                {sendMutation.isPending ? "…" : "Отправить"}
              </button>
            </div>
            <div
              className="mono"
              style={{
                fontSize: 10,
                color: "var(--ink-3)",
                marginTop: 8,
                letterSpacing: "0.04em",
              }}
            >
              ↵ отправить · shift+↵ перенос строки · @гид помнит контекст последних
              сообщений и поездки
            </div>
          </div>
        </div>

        {railOpen && <ContextRail messages={messages} onClose={() => setRailOpen(false)} />}
      </div>
    </div>
  );
}

function MentionPopup({
  tripMembers,
  onPick,
}: {
  tripMembers: ApiAuthor[];
  onPick: (handle: string) => void;
}) {
  const items: { id: string; handle: string; sub: string }[] = [
    { id: "bot", handle: "гид", sub: "AI-помощник · решения, места, бюджет" },
    ...tripMembers.map((u) => ({ id: u.id, handle: u.name.split(/\s+/)[0] ?? u.name, sub: "" })),
  ];
  return (
    <div
      style={{
        position: "absolute",
        bottom: "calc(100% - 4px)",
        left: 16,
        background: "var(--paper)",
        border: "1px solid var(--line)",
        borderRadius: "var(--r-md)",
        boxShadow: "var(--shadow-md)",
        overflow: "hidden",
        minWidth: 220,
        zIndex: 5,
      }}
    >
      <div className="eyebrow" style={{ padding: "8px 12px", borderBottom: "1px solid var(--line)" }}>
        упомянуть
      </div>
      {items.map((o) => (
        <button
          key={o.id}
          onClick={() => onPick(o.handle)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 12px",
            width: "100%",
            textAlign: "left",
            transition: "background 0.12s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--paper-2)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          {o.id === "bot" ? (
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: 8,
                background: "var(--terracotta)",
                color: "var(--paper)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              Г
            </span>
          ) : (
            <UserAvatar
              user={{ id: o.id, name: o.handle, avatarUrl: null }}
              size={26}
              ring={false}
            />
          )}
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>@{o.handle}</div>
            {o.sub && (
              <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>
                {o.sub}
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

function Message({ m, isMe }: { m: ApiMessage; isMe: boolean }) {
  const time = timeOf(m.createdAt);

  if (m.isBot) {
    return (
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
          padding: 16,
          background:
            "linear-gradient(180deg, oklch(from var(--terracotta) l c h / 0.06), transparent)",
          borderRadius: "var(--r-md)",
          border: "1px solid oklch(from var(--terracotta) l c h / 0.18)",
        }}
      >
        <BotAvatar />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Гид</span>
            <span
              className="badge"
              style={{ color: "var(--terracotta)", padding: "2px 8px", fontSize: 9 }}
            >
              <span className="dot" />
              AI
            </span>
            <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
              {time}
            </span>
          </div>
          <BotMessage text={m.text} />
        </div>
      </div>
    );
  }

  const authorName = m.author?.name ?? "?";
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "flex-end",
        flexDirection: isMe ? "row-reverse" : "row",
      }}
    >
      {!isMe && m.author && <UserAvatar user={m.author} size={28} ring={false} />}
      {isMe && <span style={{ width: 28 }} />}
      <div
        style={{
          maxWidth: "70%",
          padding: "6px 12px",
          background: isMe ? "var(--terracotta)" : "var(--paper)",
          color: isMe ? "var(--paper)" : "var(--ink)",
          borderRadius: 14,
          borderBottomRightRadius: isMe ? 4 : 14,
          borderBottomLeftRadius: isMe ? 14 : 4,
          fontSize: 14,
          lineHeight: 1.4,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          boxShadow: "0 1px 1px oklch(0.18 0.02 30 / 0.06)",
          border: isMe ? "none" : "1px solid var(--line)",
        }}
      >
        {!isMe && (
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--terracotta)",
              marginBottom: 1,
            }}
          >
            {authorName}
          </div>
        )}
        <span>{renderInlineMentions(m.text)}</span>
        <span
          className="mono"
          style={{
            fontSize: 10,
            color: isMe ? "oklch(1 0 0 / 0.7)" : "var(--ink-3)",
            marginLeft: 8,
            float: "right",
            marginTop: 4,
          }}
        >
          {time}
        </span>
      </div>
    </div>
  );
}

function BotAvatar() {
  return (
    <span
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        background: "var(--terracotta)",
        color: "var(--paper)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        position: "relative",
      }}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M16 9 L13 12 L16 15 M8 9 L11 12 L8 15"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function BotThinking() {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "8px 16px" }}>
      <BotAvatar />
      <div
        style={{
          display: "flex",
          gap: 4,
          padding: "10px 14px",
          background: "var(--paper-2)",
          borderRadius: "var(--r-md)",
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--terracotta)",
              animation: `chat-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
              display: "inline-block",
            }}
          />
        ))}
      </div>
      <style>{`@keyframes chat-bounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-4px); opacity: 1; } }`}</style>
    </div>
  );
}

function BotMessage({ text }: { text: string }) {
  const blocks = parseBlocks(text);
  return (
    <div style={{ fontSize: 14, lineHeight: 1.55, color: "var(--ink)" }}>
      {blocks.map((b, i) => {
        if (b.type === "list") {
          return (
            <ul
              key={i}
              style={{
                margin: "6px 0",
                paddingLeft: 18,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {b.items.map((it, j) => (
                <li key={j}>{renderBold(it)}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} style={{ margin: "6px 0" }}>
            {renderBold(b.text)}
          </p>
        );
      })}
    </div>
  );
}

type Block = { type: "para"; text: string } | { type: "list"; items: string[] };

function parseBlocks(text: string): Block[] {
  const lines = text.split("\n");
  const blocks: Block[] = [];
  let buf: string[] = [];
  let listBuf: string[] = [];
  const flushBuf = () => {
    if (buf.length) {
      blocks.push({ type: "para", text: buf.join(" ") });
      buf = [];
    }
  };
  const flushList = () => {
    if (listBuf.length) {
      blocks.push({ type: "list", items: listBuf });
      listBuf = [];
    }
  };
  for (const line of lines) {
    const tr = line.trim();
    if (tr.startsWith("- ")) {
      flushBuf();
      listBuf.push(tr.slice(2));
      continue;
    }
    flushList();
    if (tr === "") {
      flushBuf();
      continue;
    }
    buf.push(tr);
  }
  flushBuf();
  flushList();
  return blocks;
}

function renderBold(s: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let rest = s;
  let key = 0;
  while (rest.length) {
    const m = rest.match(/\*\*([^*]+)\*\*/);
    if (!m || m.index === undefined) {
      parts.push(<span key={key++}>{rest}</span>);
      break;
    }
    parts.push(<span key={key++}>{rest.slice(0, m.index)}</span>);
    parts.push(
      <strong key={key++} style={{ color: "var(--ink)", fontWeight: 600 }}>
        {m[1]}
      </strong>,
    );
    rest = rest.slice(m.index + m[0].length);
  }
  return parts;
}

function renderInlineMentions(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let rest = text;
  let key = 0;
  while (rest.length) {
    const m = rest.match(/@([\wа-яА-ЯёЁ]+)/u);
    if (!m || m.index === undefined) {
      parts.push(<span key={key++}>{rest}</span>);
      break;
    }
    parts.push(<span key={key++}>{rest.slice(0, m.index)}</span>);
    const isBot = /гид/i.test(m[1] ?? "");
    parts.push(
      <span
        key={key++}
        style={{
          color: isBot ? "var(--terracotta)" : "oklch(0.78 0.04 220)",
          fontWeight: 500,
          background: isBot
            ? "oklch(from var(--terracotta) l c h / 0.18)"
            : "oklch(0.78 0.04 220 / 0.2)",
          padding: "1px 6px",
          borderRadius: 999,
          fontSize: "0.92em",
        }}
      >
        @{m[1]}
      </span>,
    );
    rest = rest.slice(m.index + m[0].length);
  }
  return parts;
}

function ContextRail({
  messages,
  onClose,
}: {
  messages: ApiMessage[];
  onClose: () => void;
}) {
  const pinned = messages.filter((m) => m.isBot).slice(-1);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        minHeight: 0,
        overflow: "auto",
        position: "relative",
        padding: "12px 16px 16px",
      }}
    >
      <button
        onClick={onClose}
        title="Скрыть"
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 2,
          width: 24,
          height: 24,
          borderRadius: 999,
          background: "var(--paper-2)",
          border: "1px solid var(--line)",
          color: "var(--ink-2)",
          fontSize: 14,
          lineHeight: 1,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ×
      </button>
      <div
        className="card"
        style={{ padding: 16, background: "var(--ink)", color: "var(--paper)", border: "none" }}
      >
        <div className="eyebrow" style={{ color: "oklch(0.65 0.012 65)", marginBottom: 10 }}>
          что знает гид
        </div>
        <ul
          style={{
            margin: 0,
            paddingLeft: 16,
            fontSize: 12,
            lineHeight: 1.6,
            color: "oklch(0.85 0.012 65)",
          }}
        >
          <li>состав группы и роли</li>
          <li>маршрут (дни, время, пункты)</li>
          <li>бюджет и кто за что платил</li>
          <li>последние ~12 сообщений в чате</li>
        </ul>
      </div>

      <div className="card" style={{ padding: 16 }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>
          последняя идея от гида
        </div>
        {pinned.length > 0 ? (
          <div
            style={{
              fontSize: 12,
              lineHeight: 1.5,
              color: "var(--ink-2)",
              maxHeight: 240,
              overflow: "auto",
            }}
          >
            {pinned[0]!.text.slice(0, 400)}
            {pinned[0]!.text.length > 400 && "…"}
          </div>
        ) : (
          <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
            пока нет
          </div>
        )}
      </div>

      <div className="card" style={{ padding: 16 }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>
          попробуйте спросить
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            "@гид что сделать в дождливый день?",
            "@гид что съесть кроме хинкали?",
            "@гид сколько займёт дорога Тбилиси → Казбеги?",
            "@гид найди винодельни в Кахетии",
          ].map((s) => (
            <button
              key={s}
              style={{
                padding: "8px 10px",
                borderRadius: "var(--r-sm)",
                background: "var(--paper-2)",
                color: "var(--ink-2)",
                fontSize: 12,
                textAlign: "left",
                lineHeight: 1.4,
                border: "1px solid var(--line)",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function timeOf(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function dateLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) return "сегодня";
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  const isYesterday =
    d.getFullYear() === y.getFullYear() &&
    d.getMonth() === y.getMonth() &&
    d.getDate() === y.getDate();
  if (isYesterday) return "вчера";
  const months = [
    "янв",
    "фев",
    "мар",
    "апр",
    "мая",
    "июн",
    "июл",
    "авг",
    "сен",
    "окт",
    "ноя",
    "дек",
  ];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

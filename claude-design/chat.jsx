/* global React, useT, Avatar, AvatarStack, Modal, MEMBERS, ACTIVE_TRIP */
const { useState, useRef, useEffect } = React;

/* ============================================================
   CHAT TAB — group chat with AI guide ("@гид")
   ============================================================ */

const SEED_MESSAGES = [
  { id: "s1", author: "m1", time: "09:12", date: "вчера",
    text: "ребята, как насчёт ночёвки в Сигнахи на второй день? там вино и виды" },
  { id: "s2", author: "m2", time: "09:14", date: "вчера",
    text: "за 🍷" },
  { id: "s3", author: "m3", time: "09:21", date: "вчера",
    text: "@гид что можно успеть посмотреть в Сигнахи за полдня и где недорого поесть?" },
  { id: "s4", author: "bot", time: "09:21", date: "вчера", isBot: true,
    text: "В Сигнахи за полдня успеете прогуляться по крепостной стене и дойти до монастыря Бодбе. Это около 4–5 часов с обедом.\n\n**Места:**\n- Крепостная стена Сигнахи — закат отсюда самый красивый\n- Монастырь Бодбе и могила Святой Нино — 15 мин на машине\n- Смотровая на дом-музей Пиросмани\n\n**Поесть до 600₽/чел:**\n- Pheasant's Tears — авторская кухня, винодельня при ресторане\n- Кахетинский Дом — домашняя кухня, хинкали и мцвади\n- Bistro Old Signagi — лёгкий обед на главной\n\nПо бюджету — закладывайте ≈3 200₽ на четверых на обед и ≈1 200₽ на дегустацию." },
  { id: "s5", author: "me", time: "10:02", date: "вчера",
    text: "🔥 беру Pheasant's Tears на радар" },
  { id: "s6", author: "m4", time: "11:48", date: "вчера",
    text: "к слову — чьё-то такси из аэропорта 1 800₽ помните положить в общий?" },
  { id: "s7", author: "m1", time: "12:30", date: "вчера",
    text: "да, я добавлю в бюджет вечером" },
  { id: "s8", author: "m2", time: "08:05", date: "сегодня",
    text: "@гид по 4 ужинам в Тбилиси — где НЕ туристично, чтоб не потратить 5к на человека? и предложи на чём сэкономить" },
  { id: "s9", author: "bot", time: "08:05", date: "сегодня", isBot: true,
    text: "Глядя на ваш текущий бюджет (38 540₽ на 4 человек на 3 дня — это ~3 211₽/чел/день, что ок), могу подсказать как пройти 4 ужина и не разогнаться:\n\n**Ужины без туристической наценки:**\n- Самикитно на Мейдане — местные туда ходят, средний чек 800₽\n- Шавi Lomi — современная грузинская, но в районе Сабуртало\n- Хинкальная Велиаминова — у вас уже в плане, держите ✓\n- Винный бар Vino Underground — тапас + бокал, 700–900₽/чел\n\n**Где можно срезать:**\n- Вместо такси из аэропорта — автобус 37, 60₽/чел вместо 1 800₽ на всех\n- Купить sim-карту Beeline в первый день — 200₽ вместо роуминга\n- Завтраки в гестхаусе или хачапури в кафе — экономия ≈400₽/чел/день\n\nИтого можно сэкономить около **6 000₽ на группу** за 3 дня." },
  { id: "s10", author: "m3", time: "08:14", date: "сегодня",
    text: "автобус 37 — golden tip 🚌" },
];

function ChatTab() {
  const { t } = useT();
  const [messages, setMessages] = useState(SEED_MESSAGES);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [railOpen, setRailOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const inviteAnchorRef = useRef(null);

  useEffect(() => {
    if (!inviteOpen) return;
    const onDocDown = (e) => {
      if (inviteAnchorRef.current && !inviteAnchorRef.current.contains(e.target)) {
        setInviteOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [inviteOpen]);

  const inviteLink = "journey.app/j/tk-3b9f";
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(inviteLink); } catch (e) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, thinking]);

  const send = async () => {
    const txt = input.trim();
    if (!txt || thinking) return;
    const time = new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
    const myMsg = { id: `m${Date.now()}`, author: "me", time, date: "сейчас", text: txt };
    setMessages(prev => [...prev, myMsg]);
    setInput("");

    if (/@гид\b/i.test(txt)) {
      setThinking(true);
      try {
        const reply = await askGuide(txt, [...messages, myMsg]);
        const botTime = new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
        setMessages(prev => [...prev, { id: `b${Date.now()}`, author: "bot", time: botTime, date: "сейчас", isBot: true, text: reply }]);
      } catch (e) {
        setMessages(prev => [...prev, {
          id: `b${Date.now()}`, author: "bot", time: "—", date: "сейчас", isBot: true,
          text: "Связь не дошла до меня — попробуйте ещё раз через минуту."
        }]);
      } finally {
        setThinking(false);
      }
    }
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const onChange = (e) => {
    const v = e.target.value;
    setInput(v);
    setShowMentions(v.endsWith("@"));
  };

  const insertMention = (handle) => {
    setInput(prev => prev.replace(/@$/, "@" + handle + " "));
    setShowMentions(false);
  };

  // Group by date for the date dividers
  const grouped = [];
  let lastDate = null;
  messages.forEach(m => {
    if (m.date !== lastDate) { grouped.push({ divider: m.date }); lastDate = m.date; }
    grouped.push(m);
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)", margin: "-32px -40px", background: "var(--paper-2)" }}>
      {/* Telegram-style slim header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 24px",
        background: "var(--paper)",
        borderBottom: "1px solid var(--line)",
        flexShrink: 0,
        zIndex: 2,
      }}>
        <span style={{
          width: 38, height: 38, borderRadius: "50%",
          background: "linear-gradient(135deg, var(--terracotta), oklch(0.50 0.10 30))",
          color: "var(--paper)",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-display)", fontSize: 16, fontStyle: "italic",
          flexShrink: 0,
        }}>Гр</span>
        <div style={{ flex: 1, minWidth: 0, lineHeight: 1.2 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>Поездка в Грузию</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)", display: "flex", alignItems: "center", gap: 6 }}>
            <span>4 участника</span>
            <span style={{ width: 3, height: 3, borderRadius: 999, background: "var(--ink-3)" }} />
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: "oklch(0.70 0.15 145)" }} />
              @гид онлайн
            </span>
          </div>
        </div>
        <div ref={inviteAnchorRef} style={{ position: "relative" }}>
          <button onClick={() => setInviteOpen(v => !v)} title="Участники и приглашение"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "4px 8px 4px 6px", borderRadius: 999,
              background: inviteOpen ? "var(--paper-2)" : "transparent",
              transition: "background 0.12s",
            }}
            onMouseEnter={e => { if (!inviteOpen) e.currentTarget.style.background = "var(--paper-2)"; }}
            onMouseLeave={e => { if (!inviteOpen) e.currentTarget.style.background = "transparent"; }}
          >
            <AvatarStack ids={["m1","m2","m3","m4","me"]} size={24} max={5} />
            <span style={{ fontSize: 11, color: "var(--ink-3)", marginLeft: 2 }}>▾</span>
          </button>

          {inviteOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0,
              width: 300, zIndex: 10,
              background: "var(--paper)", border: "1px solid var(--line)",
              borderRadius: 12, boxShadow: "var(--shadow-md)",
              overflow: "hidden",
            }}>
              {/* Members list */}
              <div style={{ padding: "10px 6px 6px" }}>
                <div style={{ padding: "0 10px 6px", fontSize: 11, color: "var(--ink-3)", display: "flex", justifyContent: "space-between" }}>
                  <span>Участники</span>
                  <span>{["m1","m2","m3","m4","me"].length}</span>
                </div>
                {[
                  { id: "m1", role: "организатор" },
                  { id: "m2", role: "участник" },
                  { id: "m3", role: "участник" },
                  { id: "m4", role: "участник" },
                  { id: "me", role: "вы" },
                ].map(p => {
                  const m = MEMBERS.find(x => x.id === p.id) || {};
                  return (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 10px", borderRadius: 8 }}>
                      <Avatar id={p.id} size={26} ring={false} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: "var(--ink)" }}>{m.name}</div>
                        <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{p.role}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ height: 1, background: "var(--line)" }} />

              {/* Invite actions */}
              <div style={{ padding: "10px", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 11, color: "var(--ink-3)", padding: "0 2px" }}>Пригласить друга</div>
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 6px 6px 10px",
                  background: "var(--paper-2)", borderRadius: 8,
                  border: "1px solid var(--line)",
                }}>
                  <span className="mono" style={{ flex: 1, fontSize: 12, color: "var(--ink-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inviteLink}</span>
                  <button onClick={copyLink}
                    style={{
                      padding: "5px 10px", borderRadius: 6,
                      background: copied ? "var(--moss)" : "var(--ink)",
                      color: "var(--paper)", fontSize: 11, fontWeight: 500,
                      transition: "background 0.15s",
                    }}>{copied ? "Скопировано ✓" : "Копировать"}</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  <button style={inviteShareBtn}>Telegram</button>
                  <button style={inviteShareBtn}>Email</button>
                </div>
                <button style={{
                  ...inviteShareBtn,
                  background: "var(--terracotta)", color: "var(--paper)", border: "none",
                  marginTop: 2,
                }}>+ Добавить по имени</button>
              </div>
            </div>
          )}
        </div>
        {!railOpen && (
          <button onClick={() => setRailOpen(true)} title="Контекст гида"
            style={iconBtn}>☰</button>
        )}
        <button title="Настройки" style={iconBtn}>⋯</button>
      </div>

      {/* Body — chat + side context panel */}
      <div style={{ display: "grid", gridTemplateColumns: railOpen ? "minmax(0, 1fr) 300px" : "minmax(0, 1fr)", flex: 1, minHeight: 0, transition: "grid-template-columns 0.25s ease" }}>
        {/* MESSAGE STREAM */}
        <div style={{ display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden", background: "var(--paper-2)" }}>
          <div ref={listRef} style={{ flex: 1, overflowY: "auto", padding: "16px 24px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
            {grouped.map((entry, i) => entry.divider ? (
              <div key={`d-${i}`} style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0" }}>
                <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
                <span className="mono" style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{entry.divider}</span>
                <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
              </div>
            ) : (
              <Message key={entry.id} m={entry} />
            ))}
            {thinking && <BotThinking />}
          </div>

          {/* Composer */}
          <div style={{ borderTop: "1px solid var(--line)", padding: "10px 16px", position: "relative", background: "var(--paper)" }}>
            {showMentions && (
              <div style={{
                position: "absolute", bottom: "calc(100% - 4px)", left: 16,
                background: "var(--paper)", border: "1px solid var(--line)",
                borderRadius: "var(--r-md)", boxShadow: "var(--shadow-md)",
                overflow: "hidden", minWidth: 220, zIndex: 5,
              }}>
                <div className="eyebrow" style={{ padding: "8px 12px", borderBottom: "1px solid var(--line)" }}>упомянуть</div>
                {[
                  { id: "bot",  handle: "гид",   sub: "AI-помощник · решения, места, бюджет" },
                  { id: "m1",   handle: "Аня",   sub: "организатор" },
                  { id: "m2",   handle: "Лёша",  sub: "" },
                  { id: "m3",   handle: "Маша",  sub: "" },
                ].map(o => (
                  <button key={o.id} onClick={() => insertMention(o.handle)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 12px", width: "100%", textAlign: "left",
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--paper-2)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <Avatar id={o.id} size={26} ring={false} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>@{o.handle}</div>
                      {o.sub && <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{o.sub}</div>}
                    </div>
                  </button>
                ))}
              </div>
            )}
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <Avatar id="me" size={32} ring={false} />
              <div style={{ flex: 1, position: "relative" }}>
                <textarea
                  value={input}
                  onChange={onChange}
                  onKeyDown={onKey}
                  placeholder="Напишите сообщение или @гид для подсказки…"
                  rows={1}
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
                  }}
                />
                <div style={{ position: "absolute", right: 10, bottom: 8, display: "flex", gap: 4 }}>
                  <button onClick={() => { setInput(prev => prev + "@гид "); setShowMentions(false); }}
                    title="Спросить гида"
                    style={{
                      padding: "5px 10px",
                      borderRadius: 999,
                      background: "oklch(from var(--terracotta) l c h / 0.15)",
                      color: "var(--terracotta)",
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      letterSpacing: "0.04em",
                    }}>@гид</button>
                </div>
              </div>
              <button className="btn btn-primary" onClick={send} disabled={thinking || !input.trim()}
                style={{ padding: "10px 16px", opacity: (!input.trim() || thinking) ? 0.4 : 1 }}>
                {thinking ? "…" : "Отправить"}
              </button>
            </div>
            <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 8, letterSpacing: "0.04em" }}>
              ↵ отправить · shift+↵ перенос строки · @гид помнит контекст последних сообщений и поездки
            </div>
          </div>
        </div>

        {/* CONTEXT RAIL */}
        {railOpen && <ContextRail messages={messages} onClose={() => setRailOpen(false)} />}
      </div>
    </div>
  );
}

function Message({ m }) {
  const member = MEMBERS.find(x => x.id === m.author) || { name: "Гид", initials: "Г" };
  const isMe = m.author === "me";
  const isBot = m.isBot;

  if (isBot) {
    return (
      <div style={{
        display: "flex", gap: 12, alignItems: "flex-start",
        padding: 16,
        background: "linear-gradient(180deg, oklch(from var(--terracotta) l c h / 0.06), transparent)",
        borderRadius: "var(--r-md)",
        border: "1px solid oklch(from var(--terracotta) l c h / 0.18)",
      }}>
        <BotAvatar />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Гид</span>
            <span className="badge" style={{ color: "var(--terracotta)", padding: "2px 8px", fontSize: 9 }}>
              <span className="dot" />AI
            </span>
            <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{m.time}</span>
          </div>
          <BotMessage text={m.text} />
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button style={pillBtn}>👍 полезно</button>
            <button style={pillBtn}>📌 закрепить</button>
            <button style={pillBtn}>↗ в маршрут</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexDirection: isMe ? "row-reverse" : "row" }}>
      {!isMe && <Avatar id={m.author} size={28} ring={false} />}
      {isMe && <span style={{ width: 28 }} />}
      <div style={{
        maxWidth: "70%",
        padding: "6px 12px 6px 12px",
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
      }}>
        {!isMe && (
          <div style={{ fontSize: 12, fontWeight: 600, color: member.color || "var(--terracotta)", marginBottom: 1 }}>
            {member.name}
          </div>
        )}
        <span>{renderInlineMentions(m.text)}</span>
        <span className="mono" style={{
          fontSize: 10,
          color: isMe ? "oklch(1 0 0 / 0.7)" : "var(--ink-3)",
          marginLeft: 8,
          float: "right",
          marginTop: 4,
        }}>{m.time}</span>
      </div>
    </div>
  );
}

function BotAvatar() {
  return (
    <span style={{
      width: 32, height: 32, borderRadius: 8,
      background: "var(--terracotta)",
      color: "var(--paper)",
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
      position: "relative",
    }}>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path d="M16 9 L13 12 L16 15 M8 9 L11 12 L8 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function BotThinking() {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "8px 16px" }}>
      <BotAvatar />
      <div style={{ display: "flex", gap: 4, padding: "10px 14px", background: "var(--paper-2)", borderRadius: "var(--r-md)" }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "var(--terracotta)",
            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            display: "inline-block",
          }} />
        ))}
      </div>
      <style>{`@keyframes bounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-4px); opacity: 1; } }`}</style>
    </div>
  );
}

function BotMessage({ text }) {
  // Light formatting: **bold**, lines starting with `- ` become bullets, blank lines → paragraph break
  const blocks = parseBlocks(text);
  return (
    <div style={{ fontSize: 14, lineHeight: 1.55, color: "var(--ink)" }}>
      {blocks.map((b, i) => {
        if (b.type === "list") {
          return (
            <ul key={i} style={{ margin: "6px 0", paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
              {b.items.map((it, j) => <li key={j}>{renderBold(it)}</li>)}
            </ul>
          );
        }
        if (b.type === "para") {
          return <p key={i} style={{ margin: "6px 0" }}>{renderBold(b.text)}</p>;
        }
        return null;
      })}
    </div>
  );
}

function parseBlocks(text) {
  const lines = text.split("\n");
  const blocks = [];
  let buf = [];
  let listBuf = [];
  const flushBuf = () => { if (buf.length) { blocks.push({ type: "para", text: buf.join(" ") }); buf = []; } };
  const flushList = () => { if (listBuf.length) { blocks.push({ type: "list", items: listBuf }); listBuf = []; } };
  for (const line of lines) {
    const tr = line.trim();
    if (tr.startsWith("- ")) { flushBuf(); listBuf.push(tr.slice(2)); continue; }
    flushList();
    if (tr === "") { flushBuf(); continue; }
    buf.push(tr);
  }
  flushBuf(); flushList();
  return blocks;
}

function renderBold(s) {
  const parts = [];
  let rest = s;
  let key = 0;
  while (rest.length) {
    const m = rest.match(/\*\*([^*]+)\*\*/);
    if (!m) { parts.push(<span key={key++}>{rest}</span>); break; }
    parts.push(<span key={key++}>{rest.slice(0, m.index)}</span>);
    parts.push(<strong key={key++} style={{ color: "var(--ink)", fontWeight: 600 }}>{m[1]}</strong>);
    rest = rest.slice(m.index + m[0].length);
  }
  return parts;
}

function renderInlineMentions(text) {
  // Highlight @гид and @<name>
  const parts = [];
  let rest = text;
  let key = 0;
  while (rest.length) {
    const m = rest.match(/@([\wа-яА-ЯёЁ]+)/u);
    if (!m) { parts.push(<span key={key++}>{rest}</span>); break; }
    parts.push(<span key={key++}>{rest.slice(0, m.index)}</span>);
    const isBot = /гид/i.test(m[1]);
    parts.push(
      <span key={key++} style={{
        color: isBot ? "var(--terracotta)" : "oklch(0.78 0.04 220)",
        fontWeight: 500,
        background: isBot ? "oklch(from var(--terracotta) l c h / 0.18)" : "oklch(0.78 0.04 220 / 0.2)",
        padding: "1px 6px",
        borderRadius: 999,
        fontSize: "0.92em",
      }}>@{m[1]}</span>
    );
    rest = rest.slice(m.index + m[0].length);
  }
  return parts;
}

function ContextRail({ messages, onClose }) {
  const pinned = messages.filter(m => m.isBot).slice(-1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, minHeight: 0, overflow: "auto", position: "relative" }}>
      <button
        onClick={onClose}
        title="Скрыть"
        aria-label="Скрыть панель"
        style={{
          position: "absolute", top: 8, right: 8, zIndex: 2,
          width: 24, height: 24, borderRadius: 999,
          background: "var(--paper-2)", border: "1px solid var(--line)",
          color: "var(--ink-2)", fontSize: 14, lineHeight: 1,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}>×</button>
      <div className="card" style={{ padding: 16, background: "var(--ink)", color: "var(--paper)", border: "none" }}>
        <div className="eyebrow" style={{ color: "oklch(0.65 0.012 65)", marginBottom: 10 }}>что знает гид</div>
        <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, lineHeight: 1.6, color: "oklch(0.85 0.012 65)" }}>
          <li>текущий маршрут (3 дня запланировано)</li>
          <li>состав группы (4 человека)</li>
          <li>бюджет: 38 540₽ потрачено</li>
          <li>последние 20 сообщений в чате</li>
        </ul>
      </div>

      <div className="card" style={{ padding: 16 }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>идеи от гида</div>
        {pinned.length > 0 ? (
          <div style={{ fontSize: 12, lineHeight: 1.5, color: "var(--ink-2)" }}>
            <div style={{ fontWeight: 500, color: "var(--ink)", marginBottom: 6 }}>Срезать ≈6 000₽ за 3 дня</div>
            <div>автобус 37 из аэропорта вместо такси · sim Beeline · завтраки в гестхаусе</div>
            <button style={{ ...pillBtn, marginTop: 10 }}>применить к бюджету →</button>
          </div>
        ) : (
          <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>пока нет</div>
        )}
      </div>

      <div className="card" style={{ padding: 16 }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>попробуйте спросить</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            "@гид что сделать в дождливый день?",
            "@гид раздели расход 4 800₽ только между Аней и Лёшей",
            "@гид найди винодельни рядом с Сигнахи",
            "@гид что не успеваем, если убрать день в Кахетии?",
          ].map((s, i) => (
            <button key={i} style={{
              padding: "8px 10px",
              borderRadius: "var(--r-sm)",
              background: "var(--paper-2)",
              color: "var(--ink-2)",
              fontSize: 12,
              textAlign: "left",
              lineHeight: 1.4,
              border: "1px solid var(--line)",
              transition: "background 0.12s, border-color 0.12s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--terracotta)"; e.currentTarget.style.color = "var(--ink)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.color = "var(--ink-2)"; }}
            >{s}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

const inviteShareBtn = {
  padding: "7px 10px", borderRadius: 6,
  background: "var(--paper-2)", border: "1px solid var(--line)",
  color: "var(--ink)", fontSize: 12,
};

const iconBtn = {
  width: 32, height: 32, borderRadius: 999,
  background: "transparent", border: "none",
  color: "var(--ink-2)", fontSize: 16,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer",
};

const pillBtn = {
  padding: "5px 10px",
  borderRadius: 999,
  background: "var(--paper-2)",
  border: "1px solid var(--line)",
  color: "var(--ink-2)",
  fontSize: 11,
  fontFamily: "var(--font-mono)",
  letterSpacing: "0.04em",
};

/* ============================================================
   askGuide — calls Claude with context from chat + trip
   ============================================================ */
async function askGuide(question, recentMessages) {
  const recent = recentMessages.slice(-12).map(m => {
    const author = m.isBot ? "Гид" : (MEMBERS.find(x => x.id === m.author)?.name || "?");
    return `${author}: ${m.text}`;
  }).join("\n");

  const tripCtx = `
Поездка: ${ACTIVE_TRIP.title} (${ACTIVE_TRIP.subtitle}).
Маршрут (запланировано):
${ACTIVE_TRIP.itinerary.map(d => `· День ${d.day} ${d.date} ${d.city}: ${d.items.length} пунктов`).join("\n")}
Бюджет: ${ACTIVE_TRIP.expenses.reduce((a,b)=>a+b.amount,0).toLocaleString("ru")}₽ потрачено, делим на 4.
`.trim();

  const system = `Ты — Гид, дружелюбный AI-помощник в чате группы друзей, планирующих путешествие.
Контекст поездки:
${tripCtx}

Последние сообщения в чате:
${recent}

Правила:
- Отвечай на русском, в дружеском тоне, как в чате.
- Будь конкретен: предлагай реальные места, давай суммы в рублях, оценивай время.
- Используй короткие маркированные списки (строки с "- ") когда уместно.
- Можешь выделять ключевое **жирным** (используй ** **).
- 3–8 коротких предложений или 1 список + короткий итог.
- Помни предыдущие сообщения и не повторяйся.`;

  const messages = [{ role: "user", content: question.replace(/@гид/gi, "").trim() }];
  const reply = await window.claude.complete({ system, messages });
  return typeof reply === "string" ? reply.trim() : "Не удалось разобрать ответ.";
}

window.ChatTab = ChatTab;

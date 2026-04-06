/* global React */
const { useState, useEffect, useRef, useMemo, createContext, useContext } = React;

/* ============================================================
   I18n — minimal translator with RU/EN dictionaries
   ============================================================ */
const TR = {
  ru: {
    // Nav / common
    "nav.login": "Войти",
    "nav.signup": "Регистрация",
    "nav.create": "Создать путешествие",
    "nav.dashboard": "Мои поездки",
    "nav.back": "Назад",
    "common.email": "Электронная почта",
    "common.password": "Пароль",
    "common.name": "Имя",
    "common.cancel": "Отмена",
    "common.save": "Сохранить",
    "common.add": "Добавить",
    "common.invite": "Пригласить",
    "common.confirm": "Подтвердить",
    "common.search": "Поиск",
    "common.placeholder.dest": "Куда едем?",
    "common.from": "от",
    "common.to": "до",
    "common.date": "Даты",
    "common.title": "Название",

    // Landing
    "land.eyebrow": "Платформа для совместных путешествий",
    "land.hero.a": "Планируйте поездки",
    "land.hero.b": "вместе с друзьями",
    "land.hero.sub": "Карта, маршрут, голосования и расходы — в одном месте. Для групп от двух до шести человек, которые любят свободу.",
    "land.cta.primary": "Создать путешествие",
    "land.cta.secondary": "Войти",
    "land.scroll": "пролистай",

    "land.feat.eyebrow": "Что умеет",
    "land.feat.h": "Всё для группы — без хаоса в чате",
    "land.feat.f1.t": "Совместное планирование",
    "land.feat.f1.d": "Один маршрут на всех. Любой участник добавляет точку, согласует время и оставляет заметки.",
    "land.feat.f2.t": "Карта маршрута",
    "land.feat.f2.d": "Mapbox с кастомным стилем. Дни в разных цветах, пины с подписями, расстояние и время в пути.",
    "land.feat.f3.t": "Голосования",
    "land.feat.f3.d": "Не можем выбрать ресторан или хостел? Запустите голосование — победитель попадает в маршрут.",
    "land.feat.f4.t": "Бюджет и расходы",
    "land.feat.f4.d": "Кто за кого платил, кто кому должен. Сумма автоматически делится между участниками.",

    "land.how.eyebrow": "Как это работает",
    "land.how.h": "Три шага до первой поездки",
    "land.how.s1.t": "Создай поездку",
    "land.how.s1.d": "Назови её, выбери даты и направление. Можно добавить обложку.",
    "land.how.s2.t": "Пригласи друзей",
    "land.how.s2.d": "Отправь ссылку — друзья присоединятся за один клик.",
    "land.how.s3.t": "Планируйте вместе",
    "land.how.s3.d": "Добавляйте места, голосуйте, делите расходы. Платформа считает за вас.",

    "land.foot.tag": "Поехали туда, где нас ещё не было.",
    "land.foot.product": "Продукт",
    "land.foot.company": "Компания",
    "land.foot.legal": "Юридическое",

    // Auth
    "auth.login.h": "С возвращением",
    "auth.login.sub": "Войдите, чтобы продолжить планирование.",
    "auth.login.cta": "Войти",
    "auth.login.alt": "Ещё нет аккаунта?",
    "auth.login.altLink": "Создать аккаунт",
    "auth.signup.h": "Создайте аккаунт",
    "auth.signup.sub": "Начните планировать путешествие за минуту.",
    "auth.signup.cta": "Создать аккаунт",
    "auth.signup.alt": "Уже есть аккаунт?",
    "auth.signup.altLink": "Войти",
    "auth.err.email": "Введите корректный email",
    "auth.err.pwd": "Минимум 8 символов",
    "auth.err.name": "Укажите имя",
    "auth.aside.q": "«Лучшее путешествие — то, которое спланировано вместе.»",
    "auth.aside.author": "— наша команда",

    // Dashboard
    "dash.greet": "Добрый день",
    "dash.sub": "У вас {n} поездок в работе.",
    "dash.empty.h": "Здесь пока пусто",
    "dash.empty.d": "Создайте первое путешествие — позовите друзей и начните планировать.",
    "dash.filter.all": "Все",
    "dash.filter.planning": "Планируется",
    "dash.filter.active": "В пути",
    "dash.filter.done": "Завершено",
    "dash.tab.upcoming": "Предстоящие",
    "dash.tab.archive": "Архив",
    "dash.create.h": "Новое путешествие",
    "dash.create.sub": "Заполните несколько полей — детали добавите внутри.",
    "dash.create.dest": "Направление",
    "dash.create.cover": "Обложка",
    "dash.create.cover.hint": "необязательно",
    "dash.create.cta": "Создать поездку",

    // Trip detail
    "trip.tab.map": "Карта",
    "trip.tab.itin": "Маршрут",
    "trip.tab.votes": "Голосования",
    "trip.tab.budget": "Бюджет",
    "trip.tab.members": "Участники",
    "trip.share": "Поделиться",
    "trip.day": "День",
    "trip.itin.add": "Добавить пункт",
    "trip.votes.cta": "Проголосовать",
    "trip.votes.voted": "Вы проголосовали",
    "trip.votes.resolved": "Решено",
    "trip.votes.add": "Создать голосование",
    "trip.budget.add": "Добавить расход",
    "trip.budget.total": "Всего потрачено",
    "trip.budget.perPerson": "на человека",
    "trip.budget.balance": "Баланс группы",
    "trip.budget.youOwe": "вы должны",
    "trip.budget.owesYou": "вам должны",
    "trip.budget.settled": "Все рассчитались",
    "trip.budget.expense": "Расход",
    "trip.budget.amount": "Сумма (₽)",
    "trip.budget.payer": "Кто платил",
    "trip.budget.split": "Поделить между",
    "trip.members.role.owner": "Организатор",
    "trip.members.role.member": "Участник",
    "trip.members.invite": "Пригласить друга",

    // Status
    "status.planning": "Планируется",
    "status.active": "В пути",
    "status.done": "Завершено",
  },
  en: {
    "nav.login": "Sign in",
    "nav.signup": "Sign up",
    "nav.create": "Create trip",
    "nav.dashboard": "My trips",
    "nav.back": "Back",
    "common.email": "Email",
    "common.password": "Password",
    "common.name": "Name",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.add": "Add",
    "common.invite": "Invite",
    "common.confirm": "Confirm",
    "common.search": "Search",
    "common.placeholder.dest": "Where to?",
    "common.from": "from",
    "common.to": "to",
    "common.date": "Dates",
    "common.title": "Title",

    "land.eyebrow": "A platform for travelling together",
    "land.hero.a": "Plan trips",
    "land.hero.b": "with your friends",
    "land.hero.sub": "Map, itinerary, votes and expenses — all in one place. For groups of two to six who love freedom.",
    "land.cta.primary": "Create a trip",
    "land.cta.secondary": "Sign in",
    "land.scroll": "scroll",

    "land.feat.eyebrow": "What it does",
    "land.feat.h": "Everything for the group — without chat chaos",
    "land.feat.f1.t": "Co-planning",
    "land.feat.f1.d": "One itinerary for everyone. Any member adds a stop, sets the time, and leaves notes.",
    "land.feat.f2.t": "Route map",
    "land.feat.f2.d": "Mapbox with a custom style. Days colour-coded, captioned pins, distance and travel time.",
    "land.feat.f3.t": "Voting",
    "land.feat.f3.d": "Can't agree on a restaurant or a hostel? Start a vote — the winner lands on the route.",
    "land.feat.f4.t": "Budget & splitting",
    "land.feat.f4.d": "Who paid for whom, who owes whom. Amounts are split automatically.",

    "land.how.eyebrow": "How it works",
    "land.how.h": "Three steps to the first trip",
    "land.how.s1.t": "Create a trip",
    "land.how.s1.d": "Give it a name, dates and a destination. A cover photo is optional.",
    "land.how.s2.t": "Invite friends",
    "land.how.s2.d": "Share a link — friends join in one click.",
    "land.how.s3.t": "Plan together",
    "land.how.s3.d": "Add stops, vote, split expenses. The platform does the math.",

    "land.foot.tag": "Let's go where we've never been.",
    "land.foot.product": "Product",
    "land.foot.company": "Company",
    "land.foot.legal": "Legal",

    "auth.login.h": "Welcome back",
    "auth.login.sub": "Sign in to keep planning.",
    "auth.login.cta": "Sign in",
    "auth.login.alt": "No account yet?",
    "auth.login.altLink": "Create one",
    "auth.signup.h": "Create your account",
    "auth.signup.sub": "Start planning a trip in a minute.",
    "auth.signup.cta": "Sign up",
    "auth.signup.alt": "Already have an account?",
    "auth.signup.altLink": "Sign in",
    "auth.err.email": "Enter a valid email",
    "auth.err.pwd": "Minimum 8 characters",
    "auth.err.name": "Tell us your name",
    "auth.aside.q": "\u201CThe best trip is the one you plan together.\u201D",
    "auth.aside.author": "\u2014 our team",

    "dash.greet": "Hello",
    "dash.sub": "{n} trips in progress.",
    "dash.empty.h": "Nothing here yet",
    "dash.empty.d": "Create your first trip — invite friends and start planning.",
    "dash.filter.all": "All",
    "dash.filter.planning": "Planning",
    "dash.filter.active": "Travelling",
    "dash.filter.done": "Completed",
    "dash.tab.upcoming": "Upcoming",
    "dash.tab.archive": "Archive",
    "dash.create.h": "New trip",
    "dash.create.sub": "Just a few fields — fill in the rest inside.",
    "dash.create.dest": "Destination",
    "dash.create.cover": "Cover",
    "dash.create.cover.hint": "optional",
    "dash.create.cta": "Create trip",

    "trip.tab.map": "Map",
    "trip.tab.itin": "Itinerary",
    "trip.tab.votes": "Votes",
    "trip.tab.budget": "Budget",
    "trip.tab.members": "Members",
    "trip.share": "Share",
    "trip.day": "Day",
    "trip.itin.add": "Add stop",
    "trip.votes.cta": "Vote",
    "trip.votes.voted": "You voted",
    "trip.votes.resolved": "Resolved",
    "trip.votes.add": "Start a vote",
    "trip.budget.add": "Add expense",
    "trip.budget.total": "Total spent",
    "trip.budget.perPerson": "per person",
    "trip.budget.balance": "Group balance",
    "trip.budget.youOwe": "you owe",
    "trip.budget.owesYou": "owe you",
    "trip.budget.settled": "All settled up",
    "trip.budget.expense": "Expense",
    "trip.budget.amount": "Amount (₽)",
    "trip.budget.payer": "Paid by",
    "trip.budget.split": "Split between",
    "trip.members.role.owner": "Owner",
    "trip.members.role.member": "Member",
    "trip.members.invite": "Invite a friend",

    "status.planning": "Planning",
    "status.active": "Travelling",
    "status.done": "Completed",
  }
};

const I18nCtx = createContext({ lang: "ru", t: (k) => k, setLang: () => {} });
function I18nProvider({ children }) {
  const [lang, setLang] = useState("ru");
  const t = (k, vars) => {
    let s = (TR[lang] && TR[lang][k]) || TR.ru[k] || k;
    if (vars) Object.keys(vars).forEach(v => { s = s.replace("{" + v + "}", vars[v]); });
    return s;
  };
  return <I18nCtx.Provider value={{ lang, t, setLang }}>{children}</I18nCtx.Provider>;
}
function useT() { return useContext(I18nCtx); }

/* ============================================================
   Demo data
   ============================================================ */
const MEMBERS = [
  { id: "m1", name: "Аня",   initials: "АК", color: "oklch(0.78 0.10 60)" },
  { id: "m2", name: "Лёша",  initials: "ЛП", color: "oklch(0.72 0.10 200)" },
  { id: "m3", name: "Маша",  initials: "МР", color: "oklch(0.75 0.10 145)" },
  { id: "m4", name: "Дима",  initials: "ДВ", color: "oklch(0.70 0.10 30)" },
  { id: "m5", name: "Вика",  initials: "ВС", color: "oklch(0.74 0.10 320)" },
  { id: "me", name: "Вы",    initials: "Я",  color: "oklch(0.62 0.135 40)" },
  { id: "bot", name: "Гид",  initials: "Г",  color: "oklch(0.62 0.135 40)" },
];

const TRIPS = [
  {
    id: "t1",
    title: "Грузия: вино и горы",
    dest: "Тбилиси → Кахетия → Казбеги",
    dates: "12 — 22 июня",
    status: "planning",
    members: ["me", "m1", "m2", "m3"],
    cover: "грузинские горы — сверху",
    days: 10,
  },
  {
    id: "t2",
    title: "Северный Байкал",
    dest: "Иркутск → Ольхон → Северобайкальск",
    dates: "3 — 14 августа",
    status: "active",
    members: ["me", "m4", "m5"],
    cover: "байкальский лёд",
    days: 11,
  },
  {
    id: "t3",
    title: "Карпаты, осень",
    dest: "Львов → Яремче → Говерла",
    dates: "5 — 11 октября",
    status: "planning",
    members: ["me", "m1", "m4", "m5", "m2"],
    cover: "карпатский лес",
    days: 7,
  },
  {
    id: "t4",
    title: "Сочи, длинные выходные",
    dest: "Адлер → Красная Поляна",
    dates: "23 — 26 февраля",
    status: "done",
    members: ["me", "m2", "m3"],
    cover: "горнолыжка",
    days: 4,
  },
];

const ACTIVE_TRIP = {
  id: "t1",
  title: "Грузия: вино и горы",
  subtitle: "Тбилиси → Кахетия → Казбеги · 12—22 июня · 4 человека",
  members: ["me", "m1", "m2", "m3"],
  itinerary: [
    {
      day: 1, date: "12 июня",
      city: "Тбилиси",
      items: [
        { time: "09:30", type: "flight",   title: "Прилёт во Внуково → Тбилиси",  note: "Рейс U6-2845" },
        { time: "13:00", type: "stay",     title: "Заселение, район Сололаки",     note: "Адрес у Лёши" },
        { time: "15:00", type: "food",     title: "Хинкальная Велиаминов",         note: "5 хинкали + хачапури" },
        { time: "18:00", type: "walk",     title: "Старый город пешком",           note: "Серные бани, Нарикала" },
        { time: "21:00", type: "food",     title: "Винный бар «Гвино Underground»", note: "" },
      ],
    },
    {
      day: 2, date: "13 июня",
      city: "Тбилиси → Кахетия",
      items: [
        { time: "08:00", type: "drive",    title: "Машина в аренду",                note: "Renault Duster, 4 дня" },
        { time: "11:00", type: "place",    title: "Монастырь Бодбе",                note: "Вход бесплатный" },
        { time: "14:00", type: "food",     title: "Обед в Сигнахи",                 note: "Любой из 3 на главной" },
        { time: "17:00", type: "place",    title: "Винодельня Шумi",                note: "Дегустация × 4" },
      ],
    },
    {
      day: 3, date: "14 июня",
      city: "Казбеги",
      items: [
        { time: "07:30", type: "drive",    title: "Военно-Грузинская дорога",       note: "≈ 4 часа в пути" },
        { time: "13:00", type: "place",    title: "Гергети, Троицкая церковь",      note: "Подъём 1.5 ч" },
        { time: "19:00", type: "stay",     title: "Гостевой дом «Соно»",            note: "" },
      ],
    },
  ],
  votes: [
    {
      id: "v1",
      title: "Где ужинаем во второй вечер в Тбилиси?",
      author: "Аня",
      status: "open",
      myVote: null,
      options: [
        { id: "a", label: "Шавi Lomi — современная грузинская", votes: 2 },
        { id: "b", label: "Барбарестан — авторская кухня",       votes: 1 },
        { id: "c", label: "Самикитно — классика на Мейдане",     votes: 0 },
      ],
    },
    {
      id: "v2",
      title: "Стартуем рано или поспим?",
      author: "Лёша",
      status: "open",
      myVote: null,
      options: [
        { id: "a", label: "Выезд в 07:00, успеем всё",     votes: 1 },
        { id: "b", label: "Выезд в 10:00, спокойное утро", votes: 2 },
      ],
    },
    {
      id: "v3",
      title: "Брать ли четвёртый день в Кахетии?",
      author: "Маша",
      status: "resolved",
      resolution: "Да, добавили",
      myVote: "a",
      options: [
        { id: "a", label: "Да, добавляем",  votes: 3 },
        { id: "b", label: "Нет, едем в Боржоми", votes: 1 },
      ],
    },
  ],
  expenses: [
    { id: "e1", title: "Аренда машины (4 дня)", amount: 18400, payer: "me", split: ["me","m1","m2","m3"], date: "12.06" },
    { id: "e2", title: "Хинкальная Велиаминов", amount: 2640,  payer: "m1", split: ["me","m1","m2","m3"], date: "12.06" },
    { id: "e3", title: "Бензин, заправка №1",   amount: 3500,  payer: "m2", split: ["me","m1","m2","m3"], date: "13.06" },
    { id: "e4", title: "Дегустация Шумi",       amount: 4800,  payer: "me", split: ["me","m1","m2","m3"], date: "13.06" },
    { id: "e5", title: "Гостевой дом «Соно»",   amount: 9200,  payer: "m3", split: ["me","m1","m2","m3"], date: "14.06" },
  ],
};

/* ============================================================
   Shared UI
   ============================================================ */

function Avatar({ id, size = 32, ring = true }) {
  const m = MEMBERS.find(x => x.id === id) || { initials: "?", color: "var(--paper-3)" };
  return (
    <span className="avatar"
      style={{
        width: size, height: size, fontSize: Math.round(size * 0.36),
        background: m.color,
        color: "oklch(0.20 0.02 60)",
        border: ring ? "2px solid var(--paper)" : "none",
      }}
    >{m.initials}</span>
  );
}

function AvatarStack({ ids, max = 5, size = 28 }) {
  const shown = ids.slice(0, max);
  const overflow = ids.length - shown.length;
  return (
    <span className="avatar-stack" style={{ alignItems: "center" }}>
      {shown.map(id => <Avatar key={id} id={id} size={size} />)}
      {overflow > 0 && (
        <span className="avatar" style={{
          width: size, height: size, fontSize: Math.round(size * 0.32),
          background: "var(--paper)", color: "var(--ink-2)",
          border: "2px solid var(--paper)",
          fontFamily: "var(--font-mono)",
        }}>+{overflow}</span>
      )}
    </span>
  );
}

function StatusBadge({ status }) {
  const { t } = useT();
  const map = {
    planning: { label: t("status.planning"), color: "var(--teal)" },
    active:   { label: t("status.active"),   color: "var(--terracotta)" },
    done:     { label: t("status.done"),     color: "var(--ink-3)" },
  };
  const s = map[status];
  return (
    <span className="badge" style={{ color: s.color }}>
      <span className="dot" />
      {s.label}
    </span>
  );
}

function Placeholder({ label, height = 220, style = {} }) {
  return (
    <div className="imgph" style={{ height, ...style }}>
      <span className="imgph-label">{label}</span>
    </div>
  );
}

function Modal({ open, onClose, title, subtitle, children, width = 520 }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "oklch(0.20 0.01 60 / 0.45)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
        animation: "fadeIn 0.18s ease both",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card"
        style={{
          width: "100%", maxWidth: width,
          background: "var(--paper)",
          padding: 28,
          boxShadow: "var(--shadow-lg)",
          maxHeight: "90vh", overflow: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <h3 style={{ fontSize: 28, marginBottom: 4 }}>{title}</h3>
            {subtitle && <p style={{ color: "var(--ink-3)", fontSize: 13, margin: 0 }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: "6px 10px" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* Language switcher pill */
function LangSwitcher() {
  const { lang, setLang } = useT();
  return (
    <div style={{
      display: "inline-flex",
      border: "1px solid var(--line)",
      borderRadius: "var(--r-pill)",
      padding: 3,
      background: "var(--paper)",
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      letterSpacing: "0.06em",
    }}>
      {["ru","en"].map(l => (
        <button key={l} onClick={() => setLang(l)}
          style={{
            padding: "5px 11px",
            borderRadius: "var(--r-pill)",
            background: lang === l ? "var(--ink)" : "transparent",
            color: lang === l ? "var(--paper)" : "var(--ink-2)",
            transition: "background 0.15s ease",
            textTransform: "uppercase",
          }}>{l}</button>
      ))}
    </div>
  );
}

/* Compass logomark */
function Logo({ size = 28 }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <span style={{
        width: size, height: size,
        borderRadius: "50%",
        background: "var(--ink)",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        position: "relative",
      }}>
        <span style={{
          width: size * 0.5, height: 2,
          background: "var(--terracotta)",
          transform: "rotate(45deg)",
          position: "absolute",
        }} />
        <span style={{
          width: 2, height: size * 0.5,
          background: "var(--paper)",
          transform: "rotate(45deg)",
          position: "absolute",
        }} />
      </span>
      <span style={{
        fontFamily: "var(--font-display)",
        fontSize: size * 0.7, fontStyle: "italic",
        letterSpacing: "-0.02em",
      }}>journey</span>
    </span>
  );
}

/* Export */
Object.assign(window, {
  TR, I18nProvider, useT,
  MEMBERS, TRIPS, ACTIVE_TRIP,
  Avatar, AvatarStack, StatusBadge, Placeholder, Modal, LangSwitcher, Logo,
});

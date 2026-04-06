import { createContext, useContext, useState, type ReactNode } from "react";

type Lang = "ru" | "en";
type Dict = Record<string, string>;

const TR: Record<Lang, Dict> = {
  ru: {
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

    "land.eyebrow": "Платформа для совместных путешествий",
    "land.hero.a": "Планируйте поездки",
    "land.hero.b": "вместе с друзьями",
    "land.hero.sub":
      "Карта, маршрут, голосования и расходы — в одном месте. Для групп от двух до шести человек, которые любят свободу.",
    "land.cta.primary": "Создать путешествие",
    "land.cta.secondary": "Войти",
    "land.scroll": "пролистай",

    "land.feat.eyebrow": "Что умеет",
    "land.feat.h": "Всё для группы — без хаоса в чате",
    "land.feat.f1.t": "Совместное планирование",
    "land.feat.f1.d":
      "Один маршрут на всех. Любой участник добавляет точку, согласует время и оставляет заметки.",
    "land.feat.f2.t": "Карта маршрута",
    "land.feat.f2.d":
      "Mapbox с кастомным стилем. Дни в разных цветах, пины с подписями, расстояние и время в пути.",
    "land.feat.f3.t": "Голосования",
    "land.feat.f3.d":
      "Не можем выбрать ресторан или хостел? Запустите голосование — победитель попадает в маршрут.",
    "land.feat.f4.t": "Бюджет и расходы",
    "land.feat.f4.d":
      "Кто за кого платил, кто кому должен. Сумма автоматически делится между участниками.",

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
    "land.hero.sub":
      "Map, itinerary, votes and expenses — all in one place. For groups of two to six who love freedom.",
    "land.cta.primary": "Create a trip",
    "land.cta.secondary": "Sign in",
    "land.scroll": "scroll",

    "land.feat.eyebrow": "What it does",
    "land.feat.h": "Everything for the group — without chat chaos",
    "land.feat.f1.t": "Co-planning",
    "land.feat.f1.d":
      "One itinerary for everyone. Any member adds a stop, sets the time, and leaves notes.",
    "land.feat.f2.t": "Route map",
    "land.feat.f2.d":
      "Mapbox with a custom style. Days colour-coded, captioned pins, distance and travel time.",
    "land.feat.f3.t": "Voting",
    "land.feat.f3.d":
      "Can't agree on a restaurant or a hostel? Start a vote — the winner lands on the route.",
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
    "auth.aside.q": "“The best trip is the one you plan together.”",
    "auth.aside.author": "— our team",

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
  },
};

type I18nValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const I18nCtx = createContext<I18nValue>({
  lang: "ru",
  setLang: () => {},
  t: (k) => k,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("ru");
  const t: I18nValue["t"] = (key, vars) => {
    let s = TR[lang][key] ?? TR.ru[key] ?? key;
    if (vars) {
      for (const v of Object.keys(vars)) {
        s = s.replace("{" + v + "}", String(vars[v]));
      }
    }
    return s;
  };
  return <I18nCtx.Provider value={{ lang, setLang, t }}>{children}</I18nCtx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useT() {
  return useContext(I18nCtx);
}

export type { Lang };

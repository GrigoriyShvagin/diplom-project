import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useT } from "@/shared/lib/i18n";
import { ACTIVE_TRIP, type Vote, type Expense } from "@/shared/lib/demo";
import { Logo } from "@/shared/ui/Logo";
import { LangSwitcher } from "@/shared/ui/LangSwitcher";
import { Avatar } from "@/shared/ui/Avatar";
import { ChatTab } from "@/features/trip/ChatTab";
import { SummaryTab } from "@/features/trip/SummaryTab";
import { MapTab } from "@/features/trip/MapTab";
import { ItineraryTab } from "@/features/trip/ItineraryTab";
import { VotesTab } from "@/features/trip/VotesTab";
import { BudgetTab } from "@/features/trip/BudgetTab";
import { MembersTab } from "@/features/trip/MembersTab";
import { FinalTab } from "@/features/trip/FinalTab";
import { AddExpenseModal } from "@/features/trip/AddExpenseModal";

type TabId =
  | "chat"
  | "summary"
  | "map"
  | "itin"
  | "votes"
  | "budget"
  | "members"
  | "final";

export function TripDetailPage() {
  const { t } = useT();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>("chat");
  const [votes, setVotes] = useState<Vote[]>(ACTIVE_TRIP.votes);
  const [expenses, setExpenses] = useState<Expense[]>(ACTIVE_TRIP.expenses);
  const [openDays, setOpenDays] = useState<Record<number, boolean>>({
    1: true,
    2: false,
    3: false,
  });
  const [expenseModal, setExpenseModal] = useState(false);

  const tabs: { id: TabId; label: string }[] = [
    { id: "chat", label: "Чат" },
    { id: "summary", label: "Сводка" },
    { id: "map", label: t("trip.tab.map") },
    { id: "itin", label: t("trip.tab.itin") },
    { id: "votes", label: t("trip.tab.votes") },
    { id: "budget", label: t("trip.tab.budget") },
    { id: "members", label: t("trip.tab.members") },
    { id: "final", label: "Итоги" },
  ];

  const castVote = (vid: string, oid: string) => {
    setVotes(
      votes.map((v) => {
        if (v.id !== vid || v.status === "resolved") return v;
        let opts = v.options.map((o) =>
          v.myVote === o.id ? { ...o, votes: Math.max(0, o.votes - 1) } : o,
        );
        if (v.myVote === oid) return { ...v, myVote: null, options: opts };
        opts = opts.map((o) => (o.id === oid ? { ...o, votes: o.votes + 1 } : o));
        return { ...v, myVote: oid, options: opts };
      }),
    );
  };

  const addExpense = (e: { title: string; amount: number; payer: string; split: string[] }) => {
    setExpenses([
      {
        id: `e${Date.now()}`,
        title: e.title,
        amount: e.amount,
        payer: e.payer,
        split: e.split,
        date: "сегодня",
      },
      ...expenses,
    ]);
    setExpenseModal(false);
  };

  return (
    <div
      className="fade-in"
      style={{ minHeight: "100vh", background: "var(--paper)", display: "flex" }}
    >
      <aside
        style={{
          width: 220,
          flexShrink: 0,
          borderRight: "1px solid var(--line)",
          background: "var(--paper)",
          padding: "20px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 6px" }}>
          <button
            onClick={() => navigate("/trips")}
            title="Все поездки"
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--ink-3)",
              fontSize: 16,
            }}
          >
            ←
          </button>
          <button onClick={() => navigate("/trips")} style={{ flex: 1, textAlign: "left" }}>
            <Logo size={22} />
          </button>
        </div>

        <div style={{ padding: "0 8px" }}>
          <h2 style={{ fontSize: 17, lineHeight: 1.2, fontWeight: 600 }}>
            {ACTIVE_TRIP.title}
          </h2>
          <p style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
            {ACTIVE_TRIP.subtitle}
          </p>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {tabs.map((tb) => {
            const active = tab === tb.id;
            return (
              <button
                key={tb.id}
                onClick={() => setTab(tb.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: active ? "var(--paper-2)" : "transparent",
                  color: active ? "var(--ink)" : "var(--ink-2)",
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  textAlign: "left",
                  position: "relative",
                }}
              >
                {active && (
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 8,
                      bottom: 8,
                      width: 2,
                      borderRadius: 2,
                      background: "var(--terracotta)",
                    }}
                  />
                )}
                {tb.label}
              </button>
            );
          })}
        </nav>

        <div
          style={{
            marginTop: "auto",
            padding: "0 8px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Avatar id="me" size={26} ring={false} />
          <LangSwitcher />
        </div>
      </aside>

      <main style={{ flex: 1, minWidth: 0, padding: "32px 40px" }}>
        {tab === "chat" && <ChatTab />}
        {tab === "summary" && <SummaryTab onGoVotes={() => setTab("votes")} />}
        {tab === "map" && <MapTab />}
        {tab === "itin" && (
          <ItineraryTab openDays={openDays} setOpenDays={setOpenDays} />
        )}
        {tab === "votes" && <VotesTab votes={votes} castVote={castVote} />}
        {tab === "budget" && (
          <BudgetTab expenses={expenses} onAdd={() => setExpenseModal(true)} />
        )}
        {tab === "members" && <MembersTab />}
        {tab === "final" && <FinalTab />}
      </main>

      <AddExpenseModal
        open={expenseModal}
        onClose={() => setExpenseModal(false)}
        onAdd={addExpense}
      />
    </div>
  );
}

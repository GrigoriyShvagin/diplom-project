import { colorFromId, initialsOf } from "@/shared/lib/avatar";

type UserLike = { id: string; name: string; avatarUrl?: string | null };

export function UserAvatar({
  user,
  size = 32,
  ring = true,
}: {
  user: UserLike;
  size?: number;
  ring?: boolean;
}) {
  return (
    <span
      className="avatar"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.36),
        background: colorFromId(user.id),
        color: "oklch(0.20 0.02 60)",
        border: ring ? "2px solid var(--paper)" : "none",
      }}
      title={user.name}
    >
      {initialsOf(user.name)}
    </span>
  );
}

export function UserAvatarStack({
  users,
  max = 5,
  size = 28,
}: {
  users: UserLike[];
  max?: number;
  size?: number;
}) {
  const shown = users.slice(0, max);
  const overflow = users.length - shown.length;
  return (
    <span className="avatar-stack" style={{ alignItems: "center" }}>
      {shown.map((u) => (
        <UserAvatar key={u.id} user={u} size={size} />
      ))}
      {overflow > 0 && (
        <span
          className="avatar"
          style={{
            width: size,
            height: size,
            fontSize: Math.round(size * 0.32),
            background: "var(--paper)",
            color: "var(--ink-2)",
            border: "2px solid var(--paper)",
            fontFamily: "var(--font-mono)",
          }}
        >
          +{overflow}
        </span>
      )}
    </span>
  );
}

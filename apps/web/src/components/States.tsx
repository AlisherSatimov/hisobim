/**
 * Loading / empty / error holatlari uchun umumiy komponentlar.
 * Har ekran shu uchtasini ishlatadi, matnlari esa joyiga qarab beriladi.
 */

export function LoadingBox({ text = 'Yuklanmoqda…' }: { text?: string }) {
  return (
    <div className="state-box">
      <div className="spinner" />
      <p className="state-text" style={{ marginTop: 14 }}>
        {text}
      </p>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="card" aria-hidden="true">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: 'flex', gap: 16, marginBottom: r === rows - 1 ? 0 : 14 }}>
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="skeleton" style={{ flex: c === 0 ? 2 : 1 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function EmptyBox({
  title,
  text,
  actionLabel,
  onAction,
}: {
  title: string;
  text: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="state-box">
      <div className="state-title">{title}</div>
      <p className="state-text">{text}</p>
      {actionLabel && onAction ? (
        <button className="btn" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

export function ErrorBox({
  text = "Ma'lumotni yuklab bo'lmadi.",
  onRetry,
}: {
  text?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="state-box">
      <div className="state-title">Xatolik yuz berdi</div>
      <p className="state-text">{text}</p>
      {onRetry ? (
        <button className="btn secondary" onClick={onRetry}>
          Qayta urinish
        </button>
      ) : null}
    </div>
  );
}

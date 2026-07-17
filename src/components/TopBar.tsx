export function TopBar() {
  return (
    <header className="top">
      <span className="wordmark">
        <span className="znak" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 14 4 9l5-5" />
            <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
          </svg>
        </span>
        <span className="nazwa">BeBack</span>
      </span>
    </header>
  );
}

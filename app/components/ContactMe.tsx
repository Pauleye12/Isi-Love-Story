export function ContactMe() {
  return (
    <div className="w-full px-6 flex justify-center items-center gap-1 mb-10 text-xs ">
      {" "}
      <a
        href="https://wa.me/+2348160801541"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1"
      >
        Designed and Developed by - Pauleye.{" "}
        <span className="underline">Reach Out</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </a>
    </div>
  );
}

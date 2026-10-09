type IconProps = { className?: string };

const paths = {
  bag: <><path d="M5 8.5h14l-1 11H6l-1-11Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>,
  search: <><circle cx="10.8" cy="10.8" r="6.3" /><path d="m16 16 4 4" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  arrow: <><path d="M5 12h13M13 6l6 6-6 6" /></>,
  check: <path d="m5 12 4.2 4.2L19 6.5" />,
  trash: <><path d="M4 7h16M10 11v5M14 11v5" /><path d="M6.5 7 7.3 19h9.4L17.5 7M9 7l.7-3h4.6l.7 3" /></>,
  edit: <><path d="m4 16.5-.7 3.2 3.2-.7L18.3 7.2a2.1 2.1 0 0 0-3-3L4 16.5Z" /><path d="m13.8 5.2 3 3" /></>,
  close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  chevron: <path d="m7 10 5 5 5-5" />,
};

export function Icon({ name, className = "h-5 w-5" }: IconProps & { name: keyof typeof paths }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      {paths[name]}
    </svg>
  );
}

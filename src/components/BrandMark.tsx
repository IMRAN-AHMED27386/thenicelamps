export default function BrandMark({ id }: { id: string }) {
  return (
    <svg className="brand-mark" viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#B76E79" />
          <stop offset="1" stopColor="#F9C6D0" />
        </linearGradient>
      </defs>
      <rect
        x="26" y="26" width="68" height="68" rx="16"
        transform="rotate(45 60 60)"
        fill="none" stroke={`url(#${id})`} strokeWidth="4"
      />
      <text
        x="60" y="73"
        fontFamily="'Cormorant Garamond', Georgia, serif"
        fontStyle="italic" fontSize="38"
        fill={`url(#${id})`} textAnchor="middle"
      >
        AV
      </text>
    </svg>
  );
}

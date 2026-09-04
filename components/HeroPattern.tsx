export default function HeroPattern() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.15]"
      viewBox="0 0 800 500"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Pallets / cajas apiladas, estilo depósito, en blanco translúcido sobre el gradiente */}
      <g stroke="white" strokeWidth="2" fill="none">
        <rect x="40" y="320" width="120" height="90" rx="4" />
        <rect x="60" y="300" width="80" height="20" />
        <rect x="180" y="280" width="110" height="130" rx="4" />
        <rect x="200" y="260" width="70" height="20" />
        <rect x="320" y="350" width="90" height="60" rx="4" />
        <circle cx="520" cy="120" r="50" />
        <circle cx="520" cy="120" r="34" />
        <circle cx="620" cy="160" r="36" />
        <circle cx="620" cy="160" r="22" />
        <rect x="560" y="300" width="140" height="110" rx="4" />
        <line x1="560" y1="340" x2="700" y2="340" />
        <line x1="560" y1="370" x2="700" y2="370" />
        <line x1="600" y1="300" x2="600" y2="410" />
        <rect x="700" y="250" width="80" height="160" rx="4" />
        <circle cx="120" cy="120" r="40" />
        <circle cx="120" cy="120" r="26" />
      </g>
    </svg>
  );
}

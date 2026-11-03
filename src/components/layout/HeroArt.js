// Original hero artwork: mown-pitch stripes, a cricket crease and a football
// centre circle drawn as one field. Purely decorative.
export default function HeroArt({ className = "" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className={className}>
      <defs>
        <pattern id="playon-stripes" width="40" height="300" patternUnits="userSpaceOnUse">
          <rect width="20" height="300" fill="#ffffff" opacity="0.035" />
        </pattern>
      </defs>
      <rect width="400" height="300" fill="url(#playon-stripes)" />
      <g fill="none" stroke="var(--accent)" strokeWidth="2" opacity="0.55">
        <circle cx="290" cy="150" r="70" />
        <circle cx="290" cy="150" r="4" fill="var(--accent)" />
        <line x1="290" y1="0" x2="290" y2="300" />
        <rect x="150" y="40" width="34" height="220" rx="2" opacity="0.6" />
        <line x1="140" y1="70" x2="194" y2="70" />
        <line x1="140" y1="230" x2="194" y2="230" />
      </g>
    </svg>
  );
}

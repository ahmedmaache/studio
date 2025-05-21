import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="120"
      height="30"
      aria-label="Wilaya Connect Logo"
      {...props}
    >
      <rect width="200" height="50" rx="5" fill="hsl(var(--primary))" />
      <text
        x="100"
        y="32"
        fontFamily="var(--font-geist-sans), Arial, sans-serif"
        fontSize="24"
        fill="hsl(var(--primary-foreground))"
        textAnchor="middle"
        fontWeight="bold"
      >
        WilayaConnect
      </text>
    </svg>
  );
}

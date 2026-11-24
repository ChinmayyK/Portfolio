import { useId } from "react";

/** The CK monogram from the earlier site (also src/app/icon.svg): a ghosted 11 behind CK, and an orange dot. */
export default function Logo({ className }: { className?: string }) {
  const clip = useId();
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <defs><clipPath id={clip}><rect x="4" y="4" width="56" height="56" rx="12" /></clipPath></defs>
      <rect width="64" height="64" rx="16" fill="#D9DCE1" />
      <rect x="4" y="4" width="56" height="56" rx="12" fill="#0E0F12" />
      <text x="32" y="53" clipPath={`url(#${clip})`} textAnchor="middle" fontFamily="Helvetica, Arial, sans-serif" fontSize="60" fontWeight="700" letterSpacing="-5" fill="#F9F9FA" fillOpacity=".05">11</text>
      <text x="29" y="43" textAnchor="middle" fontFamily="Helvetica, Arial, sans-serif" fontSize="27" fontWeight="700" letterSpacing="-1.5" fill="#F9F9FA">CK</text>
      <circle cx="50" cy="41" r="3" fill="#F0561D" />
    </svg>
  );
}

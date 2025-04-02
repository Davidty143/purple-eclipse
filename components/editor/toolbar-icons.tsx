import React from "react";

const IconProps = {
  width: "16",
  height: "16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
};

export const BoldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...IconProps}>
    <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
    <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
  </svg>
);

export const ItalicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...IconProps}>
    <line x1="19" y1="4" x2="10" y2="4"></line>
    <line x1="14" y1="20" x2="5" y2="20"></line>
    <line x1="15" y1="4" x2="9" y2="20"></line>
  </svg>
);

export const StrikeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...IconProps}>
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <path d="M16 6C16 6 14.5 4 12 4C9.5 4 7 6 7 8C7 10 9 11 12 11"></path>
    <path d="M12 13C15 13 17 14 17 16C17 18 14.5 20 12 20C9.5 20 8 18 8 18"></path>
  </svg>
);

export const BulletListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...IconProps}>
    <line x1="9" y1="6" x2="20" y2="6"></line>
    <line x1="9" y1="12" x2="20" y2="12"></line>
    <line x1="9" y1="18" x2="20" y2="18"></line>
    <circle cx="5" cy="6" r="2"></circle>
    <circle cx="5" cy="12" r="2"></circle>
    <circle cx="5" cy="18" r="2"></circle>
  </svg>
);

export const OrderedListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...IconProps}>
    <line x1="10" y1="6" x2="21" y2="6"></line>
    <line x1="10" y1="12" x2="21" y2="12"></line>
    <line x1="10" y1="18" x2="21" y2="18"></line>
    <path d="M4 6h1v4"></path>
    <path d="M4 10h2"></path>
    <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path>
  </svg>
);

export const QuoteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...IconProps}>
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
  </svg>
);

export const HorizontalRuleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...IconProps}>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export const ImageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...IconProps}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <polyline points="21 15 16 10 5 21"></polyline>
    <line x1="12" y1="3" x2="12" y2="9"></line>
    <line x1="9" y1="6" x2="15" y2="6"></line>
  </svg>
);

export const LinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...IconProps}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
  </svg>
);

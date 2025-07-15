"use client";

import React, { useState, FC, ReactNode, useRef, useLayoutEffect } from 'react';

interface TooltipProps {
  children: ReactNode;
  text: ReactNode;
}

export const Tooltip: FC<TooltipProps> = ({ children, text }) => {
  const [isVisible, setIsVisible] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipEl = tooltipRef.current;
      const tooltipRect = tooltipEl.getBoundingClientRect();
      const { innerWidth, innerHeight } = window;

      let top = triggerRect.bottom + 8; // Default to bottom
      let left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;

      // If not enough space below, place above
      if (top + tooltipRect.height > innerHeight) {
        top = triggerRect.top - tooltipRect.height - 8;
      }

      // Adjust horizontal position to stay in viewport
      if (left < 8) {
        left = 8;
      } else if (left + tooltipRect.width > innerWidth - 8) {
        left = innerWidth - tooltipRect.width - 8;
      }

      tooltipEl.style.top = `${top}px`;
      tooltipEl.style.left = `${left}px`;
      tooltipEl.style.opacity = '1';
    }
  }, [isVisible, text]);

  const handleMouseEnter = () => setIsVisible(true);
  const handleMouseLeave = () => setIsVisible(false);

  return (
    <span
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="inline-block"
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-50 w-72 rounded-md border border-gray-600 bg-gray-800 p-3 text-left text-sm text-white shadow-lg"
          style={{
            opacity: 0,
            transition: 'opacity 0.2s ease-in-out',
            pointerEvents: 'none', // Prevent tooltip from capturing mouse events
          }}
        >
          {text}
        </div>
      )}
    </span>
  );
};
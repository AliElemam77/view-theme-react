import { useEffect, useState } from 'react';

export interface CountdownTimerProps {
  targetDate: string | Date;
  className?: string;
  boxClassName?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

function calculateTimeRemaining(target: string | Date): TimeRemaining {
  const targetTime = typeof target === 'string' ? new Date(target).getTime() : target.getTime();
  const now = Date.now();
  const diff = Math.max(0, targetTime - now);

  if (isNaN(targetTime) || diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  return { days, hours, minutes, seconds, isExpired: false };
}

/**
 * CountdownTimer renders a real-time countdown display for banners and promotional blocks.
 */
export function CountdownTimer({
  targetDate,
  className = '',
  boxClassName = '',
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(() =>
    calculateTimeRemaining(targetDate)
  );

  useEffect(() => {
    setTimeLeft(calculateTimeRemaining(targetDate));
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeRemaining(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const units = [
    { label: 'يوم', val: timeLeft.days },
    { label: 'ساعة', val: timeLeft.hours },
    { label: 'دقيقة', val: timeLeft.minutes },
    { label: 'ثانية', val: timeLeft.seconds },
  ];

  return (
    <div className={`flex items-center gap-2 md:gap-3 ${className}`.trim()} dir="ltr">
      {units.map((u, i) => (
        <div
          key={i}
          className={`flex flex-col items-center justify-center min-w-[50px] md:min-w-[65px] px-2 py-1.5 md:py-2 rounded-theme border border-primary-l/30 bg-primary-l/10 backdrop-blur-sm ${boxClassName}`.trim()}
        >
          <span className="text-base md:text-xl font-extrabold text-primary-d leading-tight">
            {String(u.val).padStart(2, '0')}
          </span>
          <span className="text-[10px] md:text-xs opacity-75 text-primary-d leading-tight mt-0.5">
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
}

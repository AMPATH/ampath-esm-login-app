import React, { useEffect, useState } from 'react';
import styles from './resend-timer.scss';
import { getOtp } from '../../resources/otp.resource';

interface ResendTimerProps {
  username: string;
  password: string;
}

const ResendTimer: React.FC<ResendTimerProps> = ({ username, password }) => {
  const RESEND_SECONDS = 30;
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (secondsLeft === 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleResend = async () => {
    await getOtp(username, password);
    setSecondsLeft(RESEND_SECONDS);
  };
  return (
    <>
      <p>
        Didn&apos;t get a code?
        {secondsLeft > 0 ? (
          <>
            After <span className={styles.timeLeft}>{formatTime(secondsLeft)}</span> you can <span>Resend</span>
          </>
        ) : (
          <a className={styles.link} onClick={handleResend}>
            Resend
          </a>
        )}
      </p>
    </>
  );
};

export default ResendTimer;

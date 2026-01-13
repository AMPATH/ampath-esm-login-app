import React, { useRef, useState } from 'react';

import styles from './otp.scss';

interface OtpInputProps {
  length?: number;
  onChange?: (otp: string) => void;
}

const OTPInput: React.FC<OtpInputProps> = ({ length = 5, onChange }) => {
  const [otp, setOtp] = useState(Array(length).fill(''));
  const inputRef = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value;
    if (!/^[0-9]?$/.test(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val;

    setOtp(newOtp);

    onChange?.(newOtp.join(''));

    if (val && index < length - 1) {
      inputRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRef.current[index - 1].focus();
    }
  };

  return (
    <div className={styles.container}>
      {otp.map((digit, index) => (
        <input
          className={styles.input}
          key={index}
          type="text"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          ref={(el) => (inputRef.current[index] = el)}
        />
      ))}
    </div>
  );
};

export default OTPInput;

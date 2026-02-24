import React, { useEffect, useState } from 'react';
import { Button, InlineNotification, Loading } from '@carbon/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import styles from './otp.module.scss';
import OTPInput from '../common/otp/otp.component';
import ResendTimer from '../common/resend-timer/resend-timer.component';
import Logo from '../logo.component';
import { verifyOtp } from '../resources/otp.resource';
import { refetchCurrentUser } from '@openmrs/esm-framework';

import image from '../assets/medicine.jpg';

const OtpComponent: React.FC = () => {
  const [otpValue, setOtpValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();

  const { username, password, message } = location.state || {};

  const handleOtpChange = (val: React.SetStateAction<string>) => {
    setOtpValue(val);
  };

  useEffect(() => {
    document.body.classList.add('hide-top-nav');
    return () => {
      document.body.classList.remove('hide-top-nav');
    };
  }, []);

  const handleVerify = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await verifyOtp(username, password, otpValue);

      if (res.data.success) {
        const sessionStore = await refetchCurrentUser(username, password);
        const session = sessionStore.session;

        if (!session.sessionLocation) {
          navigate('/login/location');
          return;
        }

        let to = '/home';
        if (location.state?.referrer) {
          to = location.state.referrer;
        }
        // if (location.state?.referrer) {
        //   to = location.state.referrer.startsWith('/')
        //     ? `\${openmrsSpaBase}${location.state.referrer}`
        //     : location.state.referrer;
        // }

        navigate(to);
      } else {
        setError(res.data.message);
      }
    } catch (error) {
      setError(error?.message || error?.attributes?.error || 'Invalid OTP or credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    const fallback = 'login';
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallback, { replace: true });
    }
  };

  return (
    <>
      <div className={styles.wrapperContainer}>
        <div className={styles.leftSide}>
          <div className={styles.logo}>
            <Logo t={t} />
          </div>
          <div className={styles.container}>
            <h2 className={styles.header}>OTP</h2>
            <p>{message || 'Enter the OTP sent to your registered email and phone number to complete login.'}</p>
            <OTPInput length={5} onChange={handleOtpChange} />
            {error && (
              <InlineNotification
                kind="error"
                title="Error"
                subtitle={error}
                lowContrast
                onClose={() => setError(null)}
              />
            )}
            <Button className={styles.button} onClick={handleVerify}>
              {isLoading ? <Loading /> : 'Verify'}
            </Button>
            <Button className={styles.button} onClick={handleCancel}>
              Cancel
            </Button>
            <ResendTimer username={username} password={password} />
          </div>
        </div>
        <img className={styles.image} src={image} alt="TAIFA CARE" />
      </div>
    </>
  );
};

export default OtpComponent;

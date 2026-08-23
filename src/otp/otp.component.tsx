import React, { useEffect, useState } from 'react';
import { Button, Checkbox, InlineNotification, Loading, Modal } from '@carbon/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import styles from './otp.module.scss';
import OTPInput from '../common/otp/otp.component';
import ResendTimer from '../common/resend-timer/resend-timer.component';
import Logo from '../logo.component';
import { deleteSession, verifyOtp } from '../resources/otp.resource';
import { refetchCurrentUser } from '@openmrs/esm-framework';

import image from '../assets/medicine.jpg';

const OtpComponent: React.FC = () => {
  const [otpValue, setOtpValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

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

  const getDestination = () => {
    if (location.state?.referrer) {
      return location.state.referrer;
    }
    return '/home';
  };

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
        setTermsAccepted(false);
        setShowTermsModal(true);
      } else {
        setError(res.data.message);
      }
    } catch (error: any) {
      setError(error?.message || error?.attributes?.error || 'Invalid OTP or credentials');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * User accepts the Terms & Conditions.
   */
  const handleAcceptTerms = () => {
    if (!termsAccepted) {
      return;
    }

    setShowTermsModal(false);

    const to = getDestination();

    navigate(to);
  };

  /**
   * User declines the Terms & Conditions.
   * Send them back to login.
   */
  const handleDeclineTerms = async () => {
    setShowTermsModal(false);
    setTermsAccepted(false);

    await deleteSession();

    navigate('/login', {
      replace: true,
    });
  };

  const handleCancel = () => {
    const fallback = '/login';
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
            <p>
              {message?.message || 'Enter the OTP sent to your registered email and phone number to complete login.'}
            </p>
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

            <Button className={styles.button} onClick={handleVerify} disabled={isLoading || otpValue.length !== 5}>
              {isLoading ? <Loading /> : 'Verify'}
            </Button>

            <Button className={styles.button} onClick={handleCancel} disabled={isLoading}>
              Cancel
            </Button>

            <ResendTimer username={username} password={password} />
          </div>
        </div>

        <img className={styles.image} src={image} alt="TAIFA CARE" />
      </div>

      {/* Terms & Conditions Modal */}
      <Modal
        className={styles.modal}
        open={showTermsModal}
        modalHeading="Authorized access only"
        primaryButtonText="Continue"
        secondaryButtonText="Decline"
        primaryButtonDisabled={!termsAccepted}
        onRequestSubmit={handleAcceptTerms}
        onSecondarySubmit={handleDeclineTerms}
        onRequestClose={handleDeclineTerms}
        preventCloseOnClickOutside
      >
        <div className={styles.termsContent}>
          <div className={styles.termsText}>
            <p>
              This system contains confidential and sensitive health information for patients/clients. Access is
              restricted to authorized users for approved healthcare providers and official purposes only. <br />
              All access and activities are logged and subject to audit. Unauthorized access, use, or disclosure may
              result in disciplinary and/or legal action. (DPA 2019, DHA 2023)
            </p>

            <p>
              <strong>Consent Notice:</strong>
              By logging into thisTaifaCare HMIS, you acknowledge that patient information is maintained within the
              system , in compliance with section 24 and section 31 of the Digital Health Act, 2023. You consent to
              abide by the Act, ensuring confidentiality, integrity and lawful use of digital health data.
              <br /> Unauthorized access or misuse is prohibited and subject to disciplinary and legal action under
              Section 59.
            </p>
          </div>

          <Checkbox
            id="Consent"
            labelText="I Agree - I have read and consent to abide by the Digital Health Act provisions"
            checked={termsAccepted}
            onChange={(_, { checked }) => setTermsAccepted(checked)}
          />
        </div>
      </Modal>
    </>
  );
};

export default OtpComponent;

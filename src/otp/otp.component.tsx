import React, { useState } from "react";
import { Button, InlineNotification, Loading } from "@carbon/react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import styles from "./otp.scss";
import OTPInput from "../common/otp/otp.component";
import ResendTimer from "../common/resend-timer/resend-timer.component";
import Footer from "../footer.component";
import Logo from "../logo.component";
import { verifyOtp } from "../resources/otp.resource";
import { refetchCurrentUser } from "@openmrs/esm-framework";

const OtpComponent: React.FC = () => {
  const [otpValue, setOtpValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();

  const { username, password } = location.state || {};

  const handleOtpChange = (val: React.SetStateAction<string>) => {
    setOtpValue(val);
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
          navigate("/login/location");
          return;
        }

        let to = "/home";
        if (location.state?.referrer) {
          to = location.state.referrer.startsWith("/")
            ? `\${openmrsSpaBase}${location.state.referrer}`
            : location.state.referrer;
        }

        navigate(to);
      } else {
        setError(res.data.message);
      }
    } catch (error) {
      setError(
        error?.message ||
          error?.attributes?.error ||
          "Invalid OTP or credentials"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };
  return (
    <>
      <div className={styles.wrapperContainer}>
        <div>
          <div className={styles.logo}>
            <Logo t={t} />
          </div>
          <div className={styles.container}>
            <h2 className={styles.header}>OTP</h2>
            <p>
              Please Check your email <br /> and enter your One Time Password
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
            <Button className={styles.button} onClick={handleVerify}>
              {isLoading ? <Loading /> : "Verify"}
            </Button>
            <Button className={styles.button} onClick={handleCancel}>
              Cancel
            </Button>
            <ResendTimer username={username} password={password} />
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
};

export default OtpComponent;

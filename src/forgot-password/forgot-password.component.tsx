import React, { useCallback, useState } from "react";
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, FieldError, useForm, type SubmitHandler } from 'react-hook-form';
import { Button, Form, TextInput, InlineLoading, Tile } from '@carbon/react';
import { showSnackbar } from '@openmrs/esm-framework';
import { initiatePasswordReset } from './forgot-password.resource';
import Logo from '../logo.component';
import styles from './forgot-password.scss';
import { Link, useNavigate } from "react-router-dom";

const ForgotPassword: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [initiatingPasswordReset, setIsInitiatingPasswordReset] = useState(false);

    const usernameOrEmailValidation = z.string({
        required_error: t('usernameOrEmailRequired', 'Username or Email is required'),
    });

    const resetPasswordFormSchema = z
        .object({
            usernameOrEmail: usernameOrEmailValidation,
        });

    const {
        handleSubmit,
        control,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(resetPasswordFormSchema),
    });

    const onSubmit: SubmitHandler<z.infer<typeof resetPasswordFormSchema>> = useCallback(
        (data) => {
            setIsInitiatingPasswordReset(true);

            const { usernameOrEmail } = data;

            initiatePasswordReset(usernameOrEmail)
                .then(() => {
                    showSnackbar({
                        title: t('passwordResetSuccessfull', 'Password reset successfull. Reset link has been sent to your email.'),
                        kind: 'success',
                    });
                    navigate('/login');
                })
                .catch((error) => {
                    let errorMessage = error?.responseBody?.error?.rawMessage ?? "";
                    if(errorMessage.includes("recipient")) {
                        errorMessage = t('recipientAddressNotConfigured', 'Recipient email address not configured.');
                    }
                    showSnackbar({
                        kind: 'error',
                        subtitle: errorMessage,
                        title: t('errorResettingPassword', 'Error resetting password'),
                    });
                })
                .finally(() => {
                    setIsInitiatingPasswordReset(false);
                });
        },
        [t],
    );

    const onError = useCallback(() => setIsInitiatingPasswordReset(false), []);

    return (
        <div className={styles.container}>
            <Tile className={styles.changePasswordCard}>
                <div className={styles.alignCenter}>
                    <Logo t={t} />
                </div>
                <Form onSubmit={handleSubmit(onSubmit, onError)}>
                    <Controller
                        name="usernameOrEmail"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                id="usernameOrEmail"
                                invalid={!!errors?.usernameOrEmail}
                                invalidText={
                                    (errors &&
                                        errors.usernameOrEmail &&
                                        errors.usernameOrEmail.message &&
                                        typeof errors.usernameOrEmail.message === 'string' &&
                                        errors.usernameOrEmail.message) ??
                                    ''
                                }
                                labelText={t('usernameOrEmail', 'Username or Email')}
                                onChange={onChange}
                                value={value}
                            />
                        )}
                    />
                    <Button className={styles.submitButton} disabled={initiatingPasswordReset} type="submit">
                        {initiatingPasswordReset ? (
                            <InlineLoading description={t('resettingPassword', 'Resetting password') + '...'} />
                        ) : (
                            <span>{t('resetPassword', 'Reset Password')}</span>
                        )}
                    </Button>
                    <div style={{ padding: "15px", textAlign: "center" }}>
                        <Link to="/login" style={{ textDecoration: "none", cursor: "pointer" }}> Back to Login</Link>
                    </div>
                </Form>
            </Tile>
        </div>
    )
}

export default ForgotPassword;
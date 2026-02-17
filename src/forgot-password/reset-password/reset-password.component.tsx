import React, { useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import { Button, Form, InlineLoading, Tile, PasswordInput } from '@carbon/react';
import { showSnackbar } from '@openmrs/esm-framework';
import { resetPassword } from './reset-password.resource';
import Logo from '../../logo.component';
import styles from '../../forgot-password/forgot-password.scss';

const ResetPassword: React.FC = () => {
    const { activationKey } = useParams<{ activationKey: string }>();
    const { t } = useTranslation();
    const [isResetingPassword, setIsResetingPassword] = useState(false);

    const newPasswordValidation = z.string({
        required_error: t('newPasswordRequired', 'New password is required'),
    });

    const passwordConfirmationValidation = z.string({
        required_error: t('passwordConfirmationRequired', 'Password confirmation is required'),
    });

    const resetPasswordFormSchema = z
        .object({
            newPassword: newPasswordValidation,
            passwordConfirmation: passwordConfirmationValidation,
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
            setIsResetingPassword(true);

            const { newPassword } = data;

            resetPassword(newPassword, activationKey || "")
                .then(() => {
                    showSnackbar({
                        title: t('passwordResetSuccessfull', 'Password reset successfull'),
                        kind: 'success',
                    });
                })
                .catch((error) => {
                    showSnackbar({
                        kind: 'error',
                        subtitle: error?.message,
                        title: t('errorResetingPassword', 'Error reseting password'),
                    });
                })
                .finally(() => {
                    setIsResetingPassword(false);
                });
        },
        [t, activationKey],
    );

    const onError = useCallback(() => setIsResetingPassword(false), []);

    return (
        <div className={styles.container}>
            <Tile className={styles.changePasswordCard}>
                <div className={styles.alignCenter}>
                    <Logo t={t} />
                </div>
                <Form onSubmit={handleSubmit(onSubmit, onError)}>
                    <Controller
                        name="newPassword"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <PasswordInput
                                id="newPassword"
                                invalid={!!errors?.newPassword}
                                invalidText={
                                    (errors &&
                                        errors.newPassword &&
                                        errors.newPassword.message &&
                                        typeof errors.newPassword.message === 'string' &&
                                        errors.newPassword.message) ??
                                    ''
                                }
                                labelText={t('newPassword', 'New password')}
                                onChange={onChange}
                                value={value}
                            />
                        )}
                    />
                    <Controller
                        name="passwordConfirmation"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <PasswordInput
                                id="passwordConfirmation"
                                invalid={!!errors?.passwordConfirmation}
                                invalidText={
                                    (errors &&
                                        errors.passwordConfirmation &&
                                        errors.passwordConfirmation.message &&
                                        typeof errors.passwordConfirmation.message === 'string' &&
                                        errors.passwordConfirmation.message) ??
                                    ''
                                }
                                labelText={t('confirmPassword', 'Confirm new password')}
                                onChange={onChange}
                                value={value}
                            />
                        )}
                    />
                    <Button className={styles.submitButton} disabled={isResetingPassword} type="submit">
                        {isResetingPassword ? (
                            <InlineLoading description={t('resettingPassword', 'Resetting password') + '...'} />
                        ) : (
                            <span>{t('resetPassword', 'Reset Password')}</span>
                        )}
                    </Button>
                </Form>
            </Tile>
        </div>
    )
}

export default ResetPassword;
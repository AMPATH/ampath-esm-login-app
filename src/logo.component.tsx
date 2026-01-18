import React from 'react';
import { interpolateUrl, useConfig } from '@openmrs/esm-framework';
import { type TFunction } from 'i18next';
import { type ConfigSchema } from './config-schema';
import styles from './login/login.scss';
import taifaCare from './assets/Taifa-Care.png';
import amrsLogo from './assets/ampath-logo.png';

const Logo: React.FC<{ t: TFunction }> = ({ t }) => {
  const { logo } = useConfig<ConfigSchema>();
  return (
    <>
      <img alt={logo.alt ? t(logo.alt) : t('openmrsLogo', 'OpenMRS logo')} className={styles.logoImg} src={taifaCare} />
      <span className={styles.poweredBy}>
        {t('poweredBy', 'Powered by AMRS')}{' '}
        <img src={amrsLogo} alt={t('taifaCare', 'TAIFA CARE logo')} className={styles.poweredByLogo} />
      </span>
    </>
  );
};

export default Logo;

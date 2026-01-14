import { getConfig } from '@openmrs/esm-framework';
import { moduleName } from '../';

export async function getEtlBaseUrl() {
  const { etlBaseUrl } = await getConfig(moduleName);
  return etlBaseUrl ?? null;
}

export async function getOtpEnabledStatus() {
  const { enabled } = await getConfig(moduleName);
  return enabled ?? null;
}

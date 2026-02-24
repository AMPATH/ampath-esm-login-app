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

export async function getSubDomain() {
  const { subDomain } = await getConfig(moduleName);
  return subDomain ?? null;
}

export async function getOtpKey() {
  const { otpKey } = await getConfig(moduleName);
  return otpKey ?? null;
}

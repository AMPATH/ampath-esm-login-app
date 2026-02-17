import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

export function resetPassword(newPassword: string, activationKey: string) {
  return openmrsFetch(`${restBaseUrl}/passwordreset/${activationKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      newPassword
    },
  });
}

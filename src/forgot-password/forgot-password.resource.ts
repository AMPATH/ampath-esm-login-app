import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

export function initiatePasswordReset(usernameOrEmail: string) {
  return openmrsFetch(`${restBaseUrl}/passwordreset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      usernameOrEmail
    },
  });
}

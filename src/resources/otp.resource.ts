import { openmrsFetch } from '@openmrs/esm-framework';
import { getEtlBaseUrl, getSubDomain } from '../utils/get-base-url';

const EMAIL_ATTRIBUTE_TYPE_UUID = 'ecabe213-160b-11ef-ad65-a0d3c1fcd41c';

export async function getEmail(uuid: string, username: string, password: string): Promise<string> {
  const subDomain = await getSubDomain();
  const credentials = window.btoa(`${username}:${password}`);
  try {
    if (!uuid) return;

    const url = `${subDomain}/amrs/ws/rest/v1/person/${uuid}?v=custom:attributes`;

    const res = await openmrsFetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message);
    }

    const emailAttr = data.attributes?.find(
      (attr) =>
        !attr.voided && attr.attributeType?.uuid === EMAIL_ATTRIBUTE_TYPE_UUID && typeof attr.value === 'string',
    );

    const email = emailAttr?.value;

    if (email) {
      return email;
    } else {
      throw new Error('Your email has not been configured. Please contact system administrator for assistance.');
    }
  } catch (error) {
    throw new Error(error.message ?? 'Failed to fetch email');
  }
}

export async function getOtp(username: string, password: string, email: string) {
  const etlBaseUrl = await getEtlBaseUrl();
  const params = new URLSearchParams({ username, email });
  const credentials = window.btoa(`${username}:${password}`);

  try {
    const url = `${etlBaseUrl}otp?${params.toString()}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message);
    }

    return data.data.message;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function verifyOtp(username: string, password: string, otp: string) {
  const etlBaseUrl = await getEtlBaseUrl();
  const url = etlBaseUrl + 'verify-otp';
  const credentials = window.btoa(`${username}:${password}`);

  const body = { username, otp };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'Application/json',
      Authorization: `Basic ${credentials}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  return data;
}

import { openmrsFetch } from '@openmrs/esm-framework';
import { getEtlBaseUrl, getSubDomain } from '../utils/get-base-url';

const EMAIL_ATTRIBUTE_TYPE_UUID = 'ecabe213-160b-11ef-ad65-a0d3c1fcd41c';
const PHONE_NUMBER_ATTRIBUTE_TYPE_UUID = '72a759a8-1359-11df-a1f1-0026b9348838';

type ContactInfo = {
  email: string | null;
  phone: string | null;
};

export async function getEmailAndPhone(uuid: string, username: string, password: string): Promise<ContactInfo> {
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

    const phoneAttr = data.attributes?.find(
      (attr) => !attr.voided && attr.attributeType?.uuid === PHONE_NUMBER_ATTRIBUTE_TYPE_UUID,
    );
    const email = emailAttr?.value;
    const phone = phoneAttr?.value;

    if (email === undefined || email === null) {
      throw new Error('Your email has not been configured. Please contact system administrator for assistance.');
    }
    if (phone === undefined || phone === null) {
      throw new Error('Your phone number has not been configured. Please contact system administrator for assistance.');
    }
    return { email, phone };
  } catch (error) {
    throw new Error(error.message ?? 'Failed to fetch contact info');
  }
}

export async function getOtp(username: string, password: string, email: string, phone: string) {
  const etlBaseUrl = await getEtlBaseUrl();
  const params = new URLSearchParams({ username, email, phone });
  const credentials = window.btoa(`${username}:${password}`);

  try {
    const url = `${etlBaseUrl}/otp?${params.toString()}`;

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

    return data.data.message;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function verifyOtp(username: string, password: string, otp: string) {
  const etlBaseUrl = await getEtlBaseUrl();
  const url = etlBaseUrl + '/verify-otp';
  const credentials = window.btoa(`${username}:${password}`);

  const body = { username, otp };

  const res = await openmrsFetch(url, {
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

import { getEtlBaseUrl } from '../utils/get-base-url';

export async function getOtp(username: string, password: string) {
  const etlBaseUrl = await getEtlBaseUrl();
  const params = new URLSearchParams({ username });
  const credentials = window.btoa(`${username}:${password}`);

  const url = `${etlBaseUrl}otp?${params.toString()}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${credentials}`,
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch OTP');
  }

  const data = await res.json();

  return data;
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

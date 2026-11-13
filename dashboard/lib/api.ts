export type Rsvp = {
  id: string;
  name: string;
  attending: boolean;
  guests: number;
  message?: string;
  createdAt: string;
  isDuplicate?: boolean;
};

export type DashboardStats = {
  peopleAttending: number;
  replies: number;
  declined: number;
  averagePartySize: number;
  repliesByDay: { day: string; replies: number }[];
};

export class AuthError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'AuthError';
  }
}

export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('rsvp_api_url');
    if (customUrl) return customUrl.replace(/\/+$/, '');
  }
  return (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
};

export const setApiBaseUrl = (url: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('rsvp_api_url', url.replace(/\/+$/, ''));
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('rsvp_admin_token');
};

export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('rsvp_admin_token', token);
  }
};

export const clearAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('rsvp_admin_token');
  }
};

export const isAuthenticated = (): boolean => {
  return Boolean(getAuthToken());
};

export async function loginAdmin(password: string): Promise<{ success: boolean; token?: string; message?: string }> {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, message: data.message || 'Incorrect admin password.' };
    }

    if (data.token) {
      setAuthToken(data.token);
    }

    return { success: true, token: data.token };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unable to connect to backend server.';
    return { success: false, message: msg };
  }
}

export async function getRsvps(): Promise<Rsvp[]> {
  const token = getAuthToken();
  if (!token) {
    throw new AuthError('Please enter admin password to view responses.');
  }

  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/admin/rsvps`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (res.status === 401 || res.status === 403) {
    clearAuthToken();
    throw new AuthError('Session expired. Please log in again.');
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch RSVPs.');
  }

  const list: any[] = data.data || [];
  return list.map((item) => ({
    id: item._id || item.id,
    name: item.name || '',
    attending: Boolean(item.attending),
    guests: typeof item.guests === 'number' ? item.guests : 0,
    message: item.message || '',
    createdAt: item.createdAt || new Date().toISOString(),
    isDuplicate: Boolean(item.isDuplicate),
  }));
}

export async function getStats(rsvpsList?: Rsvp[]): Promise<DashboardStats> {
  const token = getAuthToken();
  if (!token) {
    throw new AuthError('Please enter admin password.');
  }

  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/admin/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (res.status === 401 || res.status === 403) {
    clearAuthToken();
    throw new AuthError('Session expired.');
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch stats.');
  }

  const statsData = data.data || {};
  const totalReplies = statsData.totalReplies ?? 0;
  const totalAttending = statsData.totalAttending ?? 0;
  const totalDeclined = statsData.totalDeclined ?? 0;
  const totalHeadcount = statsData.totalHeadcount ?? 0;
  const avgPartySize = totalAttending > 0 ? totalHeadcount / totalAttending : 0;

  // Build daily timeline from rsvpsList if available
  const byDay = new Map<string, number>();
  if (rsvpsList && rsvpsList.length > 0) {
    rsvpsList.forEach((rsvp) => {
      const day = new Date(rsvp.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      byDay.set(day, (byDay.get(day) ?? 0) + 1);
    });
  }

  const repliesByDay = Array.from(byDay, ([day, replies]) => ({ day, replies })).reverse();

  return {
    peopleAttending: totalHeadcount,
    replies: totalReplies,
    declined: totalDeclined,
    averagePartySize: avgPartySize,
    repliesByDay,
  };
}

export async function deleteRsvp(id: string): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    throw new AuthError('Please log in.');
  }

  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/admin/rsvps/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (res.status === 401 || res.status === 403) {
    clearAuthToken();
    throw new AuthError('Session expired.');
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to delete reply.');
  }
}

export async function exportCsv(): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    throw new AuthError('Please log in.');
  }

  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/admin/export.csv`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401 || res.status === 403) {
    clearAuthToken();
    throw new AuthError('Session expired.');
  }

  if (!res.ok) {
    throw new Error('Failed to export CSV.');
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `wedding-rsvp-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

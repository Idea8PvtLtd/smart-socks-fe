import { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';
const dbCache = new Map();

function buildUrl(path) {
  return `${API_BASE}${path}`;
}

async function fetchDbResource(resource) {
  if (dbCache.has(resource)) {
    return dbCache.get(resource);
  }

  const res = await fetch(buildUrl(`/api/db/${resource}`), { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${resource}: HTTP ${res.status}`);
  }

  const data = await res.json();
  dbCache.set(resource, data);
  return data;
}

function useDbResource(resource, fallback) {
  const [data, setData] = useState(fallback);

  useEffect(() => {
    let active = true;

    fetchDbResource(resource)
      .then((json) => {
        if (active) {
          setData(json);
        }
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error(`DB resource error (${resource}):`, err);
      });

    return () => {
      active = false;
    };
  }, [resource]);

  return data;
}

export function useWearersData() {
  return useDbResource('wearers', { Wearers: {} });
}

export function useCarersData() {
  return useDbResource('carers', { Carers: {} });
}

export function useLocationsData() {
  return useDbResource('locations', { Locations: {} });
}

export function useSocksData() {
  return useDbResource('socks', { Socks: {} });
}

export function useSocksAssignData() {
  return useDbResource('socksassign', { SocksAssign: {} });
}

export function useAlertsData() {
  return useDbResource('alerts', { Alert: {} });
}

export function useNotificationsData() {
  return useDbResource('notification', { notification: {} });
}

export function useNotesData() {
  return useDbResource('notes', { Notes: [] });
}

export function useAuthData() {
  return useDbResource('auth', { CareLogin: {} });
}

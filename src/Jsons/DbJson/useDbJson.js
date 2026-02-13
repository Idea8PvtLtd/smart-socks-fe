import wearersJson from './Wearers.json';
import carersJson from './Carers.json';
import locationsJson from './Locations.json';
import socksJson from './Socks.json';
import socksAssignJson from './SocksAssign.json';
import alertsJson from './Alerts.json';
import notificationJson from './Notification.json';
import notesJson from './Notes.json';
import authJson from './Auth.json';

export function useWearersData() {
  return wearersJson;
}

export function useCarersData() {
  return carersJson;
}

export function useLocationsData() {
  return locationsJson;
}

export function useSocksData() {
  return socksJson;
}

export function useSocksAssignData() {
  return socksAssignJson;
}

export function useAlertsData() {
  return alertsJson;
}

export function useNotificationsData() {
  return notificationJson;
}

export function useNotesData() {
  return notesJson;
}

export function useAuthData() {
  return authJson;
}

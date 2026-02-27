import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  notif:  '@studyzen:notifEnabled',
  sounds: '@studyzen:soundsEnabled',
};

const SettingsContext = createContext({
  notifEnabled:  true,
  soundsEnabled: true,
  setNotifEnabled:  () => {},
  setSoundsEnabled: () => {},
});

export const SettingsProvider = ({ children }) => {
  const [notifEnabled,  setNotifEnabledState]  = useState(true);
  const [soundsEnabled, setSoundsEnabledState] = useState(true);

  // Load persisted values once on mount
  useEffect(() => {
    AsyncStorage.multiGet([KEYS.notif, KEYS.sounds])
      .then(pairs => {
        pairs.forEach(([key, value]) => {
          if (value === null) return; // not saved yet — keep default true
          const parsed = value === 'true';
          if (key === KEYS.notif)  setNotifEnabledState(parsed);
          if (key === KEYS.sounds) setSoundsEnabledState(parsed);
        });
      })
      .catch(() => {});
  }, []);

  const setNotifEnabled = (val) => {
    setNotifEnabledState(val);
    AsyncStorage.setItem(KEYS.notif, String(val)).catch(() => {});
  };

  const setSoundsEnabled = (val) => {
    setSoundsEnabledState(val);
    AsyncStorage.setItem(KEYS.sounds, String(val)).catch(() => {});
  };

  return (
    <SettingsContext.Provider value={{ notifEnabled, soundsEnabled, setNotifEnabled, setSoundsEnabled }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);

import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

export function useIsOnline(): boolean {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const sub = NetInfo.addEventListener((state) => {
      setOnline(state.isConnected !== false);
    });
    NetInfo.fetch().then((state) => setOnline(state.isConnected !== false));
    return () => sub();
  }, []);
  return online;
}

import { useColorScheme } from 'react-native'

export function usePreferredColorScheme() {
  const scheme = useColorScheme()
  return scheme === 'dark' ? 'dark' : 'light'
}

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
): string {
  const theme = useColorScheme() ?? 'light';

  // Vérifie que Colors[theme] existe
  const themeColors = Colors[theme] ?? {};

  // Priorité aux props
  if (props[theme]) {
    return props[theme]!;
  }

  // Retourne la couleur définie dans Colors, ou fallback si non défini
  if (themeColors[colorName]) {
    return themeColors[colorName];
  }

  console.warn(`useThemeColor: color "${colorName}" not found for theme "${theme}"`);
  return '#000000'; // fallback par défaut
}

import { storage } from 'common/storage';
import { useEffect, useState } from 'react';

type PanelLayoutStyle = 'modern' | 'classic';
type PanelColorTheme = 'blue' | 'midnight';
type Theme = 'light' | 'dark';

export type PsychonautPanelSettings = {
  panelColorTheme: PanelColorTheme;
  panelLayoutStyle: PanelLayoutStyle;
  theme: Theme;
};

const defaultPanelSettings: PsychonautPanelSettings = {
  panelColorTheme: 'blue',
  panelLayoutStyle: 'modern',
  theme: 'light',
};

function normalizePanelSettings(value: unknown): PsychonautPanelSettings {
  const settings =
    value && typeof value === 'object'
      ? (value as Partial<PsychonautPanelSettings>)
      : {};

  return {
    panelColorTheme:
      settings.panelColorTheme === 'midnight' ? 'midnight' : 'blue',
    panelLayoutStyle:
      settings.panelLayoutStyle === 'classic' ? 'classic' : 'modern',
    theme: settings.theme === 'dark' ? 'dark' : 'light',
  };
}

function equalPanelSettings(
  left: PsychonautPanelSettings,
  right: PsychonautPanelSettings,
): boolean {
  return (
    left.panelColorTheme === right.panelColorTheme &&
    left.panelLayoutStyle === right.panelLayoutStyle &&
    left.theme === right.theme
  );
}

// Psychonaut Station customization bridge for regular TGUI interfaces.
export function usePsychonautPanelSettings(): PsychonautPanelSettings {
  const [settings, setSettings] = useState(defaultPanelSettings);

  useEffect(() => {
    let cancelled = false;

    async function loadSettings(): Promise<void> {
      try {
        const storedSettings = normalizePanelSettings(
          await storage.get('panel-settings'),
        );

        if (!cancelled) {
          setSettings((current) =>
            equalPanelSettings(current, storedSettings)
              ? current
              : storedSettings,
          );
        }
      } catch (error) {
        console.error('Failed to load Psychonaut panel settings:', error);
      }
    }

    loadSettings();
    const timer = setInterval(loadSettings, 1000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  return settings;
}

export function getPsychonautWindowClasses(
  baseClass: string,
  settings: PsychonautPanelSettings,
): string[] {
  return [
    'PsychonautWindow',
    baseClass,
    `PsychonautWindow--${settings.panelLayoutStyle}`,
    `PsychonautWindow--theme-${settings.panelColorTheme}`,
    `PsychonautWindow--${settings.theme}`,
  ];
}

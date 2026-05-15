/**
 * @file
 * @copyright 2020 Aleksej Komarov
 * @license MIT
 */

import { FONTS_DISABLED } from './constants';
import { chatRenderer } from '../chat/renderer';
import { setClientTheme } from './themes';
import type { SettingsState } from './types';

let statFontTimer: NodeJS.Timeout;
let statPanelColorTimer: NodeJS.Timeout;
let statPanelLayoutTimer: NodeJS.Timeout;
let statTabsTimer: NodeJS.Timeout;
let overrideFontFamily: string | undefined;
let overrideFontSize: string;

/** Updates the global CSS rule to override the font family and size. */
function updateGlobalOverrideRule(): void {
  let fontFamily: string | null = null;

  if (overrideFontFamily !== undefined) {
    fontFamily = overrideFontFamily;
  }

  document.documentElement.style.setProperty('font-family', fontFamily);
  document.body.style.setProperty('font-family', fontFamily);
  document.body.style.setProperty('font-size', overrideFontSize);
}

function setGlobalFontSize(
  fontSize: string | number,
  statFontSize: string | number,
  statLinked: boolean,
): void {
  overrideFontSize = `${fontSize}px`;

  // Used solution from theme.ts
  clearInterval(statFontTimer);
  Byond.command(
    `.output statbrowser:set_font_size ${statLinked ? fontSize : statFontSize}px`,
  );
  statFontTimer = setTimeout(() => {
    Byond.command(
      `.output statbrowser:set_font_size ${statLinked ? fontSize : statFontSize}px`,
    );
  }, 1500);
}

function setGlobalFontFamily(fontFamily: string): void {
  overrideFontFamily = fontFamily === FONTS_DISABLED ? undefined : fontFamily;
}

function setStatTabsStyle(style: string): void {
  clearInterval(statTabsTimer);
  Byond.command(`.output statbrowser:set_tabs_style ${style}`);
  statTabsTimer = setTimeout(() => {
    Byond.command(`.output statbrowser:set_tabs_style ${style}`);
  }, 1500);
}

function setStatPanelLayoutStyle(style: string): void {
  clearInterval(statPanelLayoutTimer);
  Byond.command(`.output statbrowser:set_panel_layout_style ${style}`);
  statPanelLayoutTimer = setTimeout(() => {
    Byond.command(`.output statbrowser:set_panel_layout_style ${style}`);
  }, 1500);
}

function setStatPanelColorTheme(theme: string): void {
  clearInterval(statPanelColorTimer);
  Byond.command(`.output statbrowser:set_panel_color_theme ${theme}`);
  statPanelColorTimer = setTimeout(() => {
    Byond.command(`.output statbrowser:set_panel_color_theme ${theme}`);
  }, 1500);
}

function setLegacyInputLayoutStyle(
  style: string,
  colorTheme: string,
  theme: string | undefined,
): void {
  if (style === 'modern') {
    if (theme === 'light') {
      Byond.winset({
        'input.background-color': '#ffffff',
        'input.text-color': '#142333',
        'saybutton.background-color': '#e8edf3',
        'saybutton.text-color': '#142333',
        'mebutton.background-color': '#e8edf3',
        'mebutton.text-color': '#142333',
        'oocbutton.background-color': '#e8edf3',
        'oocbutton.text-color': '#142333',
        'inputbuttons.background-color': '#f4f6f8',
        'inputwindow.background-color': '#f4f6f8',
      });
      return;
    }

    if (colorTheme === 'midnight') {
      Byond.winset({
        'input.background-color': '#16161a',
        'input.text-color': '#d4dfec',
        'saybutton.background-color': '#2b2b33',
        'saybutton.text-color': '#d4dfec',
        'mebutton.background-color': '#2b2b33',
        'mebutton.text-color': '#d4dfec',
        'oocbutton.background-color': '#2b2b33',
        'oocbutton.text-color': '#d4dfec',
        'inputbuttons.background-color': '#27272d',
        'inputwindow.background-color': '#16161a',
      });
      return;
    }

    Byond.winset({
      'input.background-color': '#0f1722',
      'input.text-color': '#d8e4f0',
      'saybutton.background-color': '#172233',
      'saybutton.text-color': '#d8e4f0',
      'mebutton.background-color': '#172233',
      'mebutton.text-color': '#d8e4f0',
      'oocbutton.background-color': '#172233',
      'oocbutton.text-color': '#d8e4f0',
      'inputbuttons.background-color': '#0b111a',
      'inputwindow.background-color': '#0b111a',
    });
    return;
  }

  setClientTheme(theme);
}

export function generalSettingsHandler(update: SettingsState): void {
  // Set client theme
  const theme = update?.theme;
  if (theme) {
    setClientTheme(theme);
  }

  // Update stat panel settings
  setStatPanelColorTheme(update.panelColorTheme);
  setStatPanelLayoutStyle(update.panelLayoutStyle);
  setStatTabsStyle(update.statTabsStyle);
  setLegacyInputLayoutStyle(
    update.panelLayoutStyle,
    update.panelColorTheme,
    theme,
  );

  // Update global UI font size and name color
  setGlobalFontSize(update.fontSize, update.statFontSize, update.statLinked);
  setGlobalFontFamily(update.fontFamily);
  updateGlobalOverrideRule();
  chatRenderer.setColoredNames(update.coloredNames);
}

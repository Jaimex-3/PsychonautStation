import { useState } from 'react';
import { Stack } from 'tgui-core/components';
import { exhaustiveCheck } from 'tgui-core/exhaustive';

import { PageButton } from '../components/PageButton';
import { GamePreferencesSelectedPage } from '../types';
import { GamePreferencesPage } from './GamePreferencesPage';
import { KeybindingsPage } from './KeybindingsPage';

type Props = {
  startingPage?: GamePreferencesSelectedPage;
};

export function GamePreferenceWindow(props: Props) {
  const [currentPage, setCurrentPage] = useState(
    props.startingPage ?? GamePreferencesSelectedPage.Settings,
  );

  let pageContents;

  switch (currentPage) {
    case GamePreferencesSelectedPage.Keybindings:
      pageContents = <KeybindingsPage />;
      break;
    case GamePreferencesSelectedPage.Settings:
      pageContents = <GamePreferencesPage />;
      break;
    default:
      exhaustiveCheck(currentPage);
  }

  return (
    <Stack vertical fill className="PreferencesMenu__Window PreferencesMenu__Window--game">
      <Stack.Item className="PreferencesMenu__NavRow">
        <Stack fill className="PreferencesMenu__NavButtons">
          <Stack.Item grow>
            <PageButton
              currentPage={currentPage}
              page={GamePreferencesSelectedPage.Settings}
              setPage={setCurrentPage}
            >
              Settings
            </PageButton>
          </Stack.Item>

          <Stack.Item grow>
            <PageButton
              currentPage={currentPage}
              page={GamePreferencesSelectedPage.Keybindings}
              setPage={setCurrentPage}
            >
              Keybindings
            </PageButton>
          </Stack.Item>
        </Stack>
      </Stack.Item>

      <Stack.Divider />

      <Stack.Item
        grow
        shrink
        basis="1px"
        className="PreferencesMenu__Content PreferencesMenu__ScrollableContent"
      >
        {pageContents}
      </Stack.Item>
    </Stack>
  );
}

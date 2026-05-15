import { useState } from 'react';
import {
  Button,
  ImageButton,
  Input,
  NoticeBox,
  NumberInput,
  Section,
  Stack,
} from 'tgui-core/components';
import { type BooleanLike, classes } from 'tgui-core/react';
import { createSearch } from 'tgui-core/string';

import { useBackend } from '../backend';
import { Window } from '../layouts';
import {
  getPsychonautWindowClasses,
  usePsychonautPanelSettings,
} from '../psychonaut/usePanelSettings';
import { getLayoutState, LAYOUT, LayoutToggle } from './common/LayoutToggle';

type Item = {
  path: string;
  name: string;
  amount: number;
  icon: string;
  icon_state: string;
};

type Data = {
  contents: Record<string, Item>;
  name: string;
  isdryer: BooleanLike;
  drying: BooleanLike;
};

export const SmartVend = (props) => {
  const { act, data } = useBackend<Data>();
  const panelSettings = usePsychonautPanelSettings();
  const [searchText, setSearchText] = useState('');
  const [displayMode, setDisplayMode] = useState(getLayoutState());
  const search = createSearch(searchText, (item: Item) => item.name);
  const contents =
    searchText.length > 0
      ? Object.values(data.contents).filter(search)
      : Object.values(data.contents);
  const smartVendClassName = classes(
    getPsychonautWindowClasses('SmartVend', panelSettings),
  );

  return (
    <Window width={431} height={575}>
      <Window.Content className={smartVendClassName}>
        <Section
          className="SmartVend__storage"
          fill
          scrollable
          title="Storage"
          buttons={
            <Stack className="SmartVend__toolbar">
              {data.isdryer ? (
                <Stack.Item>
                  <Button
                    className="SmartVend__dryButton"
                    icon={data.drying ? 'stop' : 'tint'}
                    onClick={() => act('Dry')}
                  >
                    {data.drying ? 'Stop drying' : 'Dry'}
                  </Button>
                </Stack.Item>
              ) : (
                <>
                  <Stack.Item>
                    <Input
                      className="SmartVend__search"
                      autoFocus
                      placeholder="Search..."
                      value={searchText}
                      onChange={setSearchText}
                      expensive
                    />
                  </Stack.Item>
                  <LayoutToggle state={displayMode} setState={setDisplayMode} />
                </>
              )}
              <Stack.Item>
                <Button
                  className="SmartVend__helpButton"
                  icon="question"
                  tooltip={
                    <>
                      LMB - Vend selected amount
                      <br />
                      RMB - Vend all
                    </>
                  }
                  tooltipPosition={'bottom-end'}
                />
              </Stack.Item>
            </Stack>
          }
        >
          {!contents.length ? (
            <NoticeBox className="SmartVend__empty">Nothing found.</NoticeBox>
          ) : (
            contents.map((item) =>
              displayMode === LAYOUT.Grid ? (
                <ItemTile key={item.path} item={item} />
              ) : (
                <ItemList key={item.path} item={item} />
              ),
            )
          )}
        </Section>
      </Window.Content>
    </Window>
  );
};

const ItemTile = ({ item }) => {
  const { act } = useBackend<Data>();
  return (
    <ImageButton
      className="SmartVend__item SmartVend__item--grid"
      key={item.path}
      dmIcon={item.icon}
      dmIconState={item.icon_state}
      disabled={item.amount < 1}
      tooltip={item.name}
      tooltipPosition={'bottom'}
      buttons={
        item.amount > 1 && (
          <NumberInput
            minValue={1}
            maxValue={item.amount}
            step={1}
            value={1}
            onChange={(value) => {
              act('Release', {
                path: item.path,
                amount: value,
              });
            }}
          />
        )
      }
      buttonsAlt={
        <Stack
          className="SmartVend__itemMeta"
          bold
          color="rgb(185, 185, 185)"
          fontSize={0.8}
        >
          <Stack.Item grow />
          <Stack.Item
            className="SmartVend__amount"
            style={{ textShadow: '0 1px 1px black' }}
          >
            x{item.amount}
          </Stack.Item>
        </Stack>
      }
      onClick={() =>
        act('Release', {
          path: item.path,
          amount: 1,
        })
      }
      onRightClick={() =>
        act('Release', {
          path: item.path,
          amount: item.amount,
        })
      }
    >
      {item.name}
    </ImageButton>
  ) as any;
};

const ItemList = ({ item }) => {
  const { act } = useBackend<Data>();
  const disabled = item.amount <= 1;
  return (
    <ImageButton
      className="SmartVend__item SmartVend__item--list"
      key={item.path}
      fluid
      imageSize={32}
      dmIcon={item.icon}
      dmIconState={item.icon_state}
      disabled={item.amount < 1}
      buttons={
        <Stack
          className="SmartVend__quantity"
          opacity={disabled && 0.5}
          backgroundColor={'rgba(175, 175, 175, 0.1)'}
          style={{ pointerEvents: disabled ? 'none' : 'auto' }}
        >
          <NumberInput
            width="40px"
            minValue={1}
            maxValue={item.amount}
            step={1}
            value={1}
            onChange={(value) => {
              act('Release', {
                path: item.path,
                amount: value,
              });
            }}
          />
        </Stack>
      }
      onClick={() =>
        act('Release', {
          path: item.path,
          amount: 1,
        })
      }
      onRightClick={() =>
        act('Release', {
          path: item.path,
          amount: item.amount,
        })
      }
    >
      <Stack className="SmartVend__itemRow" textAlign="left">
        <Stack.Item className="SmartVend__itemName" grow>
          {item.name}
        </Stack.Item>
        <Stack.Item className="SmartVend__amount" opacity={0.5} fontSize={0.8}>
          x{item.amount}
        </Stack.Item>
      </Stack>
    </ImageButton>
  ) as any;
};

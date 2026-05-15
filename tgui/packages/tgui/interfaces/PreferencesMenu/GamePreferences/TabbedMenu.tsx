import { type ComponentProps, type ReactNode, useRef } from 'react';
import { Button, type Flex, Input, Section, Stack } from 'tgui-core/components';

type TabbedMenuProps = {
  categoryEntries: [string, ReactNode[]][];
  contentProps?: ComponentProps<typeof Flex>;
  searchText?: string;
  setSearchText?: (text: string) => void;
};

export function TabbedMenu(props: TabbedMenuProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  return (
    <Stack vertical fill className="PreferencesMenu__TabbedMenu">
      <Stack.Item className="PreferencesMenu__TabbedMenuNav">
        <Stack fill px={5} className="PreferencesMenu__TabbedMenuButtons">
          {props.categoryEntries.map(([category, children]) => (
            <Stack.Item
              key={category}
              grow
              basis={0}
              className="PreferencesMenu__TabbedMenuButtonSlot"
            >
              <Button
                className="PreferencesMenu__TabbedMenuButton"
                align="center"
                fontSize="1.2em"
                fluid
                disabled={children.length === 0}
                onClick={() => {
                  const offsetTop = categoryRefs.current[category]?.offsetTop;
                  if (offsetTop === undefined) {
                    return;
                  }

                  const currentSection = sectionRef.current;
                  if (!currentSection) {
                    return;
                  }

                  currentSection.scrollTop = offsetTop;
                }}
              >
                {category}
              </Button>
            </Stack.Item>
          ))}
        </Stack>
      </Stack.Item>
      {!!props.setSearchText && (
        <Stack.Item
          px={2}
          pl={5}
          pr={5}
          className="PreferencesMenu__TabbedMenuSearch"
        >
          <Input
            className="PreferencesMenu__TabbedMenuSearchInput"
            fluid
            height="2em"
            fontSize="1.2em"
            placeholder="Search..."
            value={props.searchText}
            onChange={props.setSearchText}
          />
        </Stack.Item>
      )}

      <Stack.Item
        grow
        ref={sectionRef}
        position="relative"
        overflowY="scroll"
        className="PreferencesMenu__TabbedMenuContent"
        {...props.contentProps}
      >
        <Stack
          vertical
          fill
          px={2}
          className="PreferencesMenu__TabbedMenuSections"
        >
          {props.categoryEntries.map(([category, children]) => {
            if (children.length === 0) return null;
            return (
              <div
                key={category}
                className="PreferencesMenu__TabbedMenuSection"
                ref={(ref) => {
                  categoryRefs.current[category] = ref;
                }}
              >
                <Section
                  fill
                  title={category}
                  className="PreferencesMenu__TabbedMenuSectionPanel"
                >
                  {children}
                </Section>
              </div>
            );
          })}
        </Stack>
      </Stack.Item>
    </Stack>
  );
}

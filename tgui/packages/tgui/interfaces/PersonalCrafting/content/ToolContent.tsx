import { Box } from 'tgui-core/components';
import { classes } from 'tgui-core/react';

type Props = {
  tool: string;
};

export function ToolContent(props: Props) {
  const { tool } = props;

  return (
    <Box className="PersonalCrafting__atom" my={1}>
      <Box
        verticalAlign="middle"
        inline
        my={-1}
        mr={0.5}
        className={classes([
          'PersonalCrafting__atomIcon',
          'crafting32x32',
          tool.replace(/ /g, ''),
        ])}
      />
      <Box
        className="PersonalCrafting__atomLabel"
        inline
        verticalAlign="middle"
      >
        {tool}
      </Box>
    </Box>
  );
}

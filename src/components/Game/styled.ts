import { styled } from '@mui/material';

interface SideSectionProps {
  stick: 'right' | 'left';
}

export const SideSection = styled('div')<SideSectionProps>(
  ({ theme: { spacing }, stick }) => ({
    flex: 1,
    display: 'flex',
    paddingRight: spacing(stick === 'right' ? 12 : 0),
    paddingLeft: spacing(stick === 'left' ? 12 : 0),
    justifyContent: stick === 'right' ? 'end' : 'start',
    paddingTop: spacing(1.5),
  }),
);

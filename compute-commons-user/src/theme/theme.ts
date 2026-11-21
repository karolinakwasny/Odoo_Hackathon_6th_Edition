import { createTheme } from '@mantine/core'

export const theme = createTheme({
  primaryColor: 'forest',
  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
  headings: { fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif', fontWeight: '700' },
  defaultRadius: 'md',
  colors: {
    forest: ['#edf5ef', '#dcebdd', '#bdd7be', '#98c49c', '#77ad7e', '#609c69', '#4d8657', '#3d7047', '#305938', '#243f2b'],
  },
})

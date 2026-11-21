import { createTheme } from "@mantine/core"

export const theme = createTheme({
  primaryColor: "forest",
  fontFamily: "Inter, sans-serif",
  headings: {
    fontFamily: "Inter, sans-serif",
    fontWeight: "600",
  },
  colors: {
    forest: [
      "#edf5ef",
      "#dcebdd",
      "#b9d7bc",
      "#94c39a",
      "#75b180",
      "#609f6c",
      "#4d8959",
      "#3b7048",
      "#285738",
      "#183f29",
    ],
  },
  defaultRadius: "md",
})
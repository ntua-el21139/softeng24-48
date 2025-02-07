module.exports = {
    mode: "jit",
    content: [
      "./src/**/**/*.{js,ts,jsx,tsx,html,mdx}",
      "./src/**/*.{js,ts,jsx,tsx,html,mdx}"
    ],
    darkMode: "class",
    theme: {
      screens: {
        md: { max: "1050px" },
        sm: { max: "550px" }
      },
      extend: {
        colors: {
          black: {
            900: "var(--black_900)",
            "900_01": "var(--black_900_01)",
            "900_26": "var(--black_900_26)",
            "900_3f": "var(--black_900_3f)"
          },
          gray: {
            100: "var(--gray_100)",
            "100_01": "var(--gray_100_01)",
            "100_02": "var(--gray_100_02)",
            "100_5b": "var(--gray_100_5b)",
            "900_75": "var(--gray_900_75)"
          },
          green: {
            600: "var(--green_600)",
            700: "var(--green_700)"
          },
          indigo: {
            50: "var(--indigo_50)",
            800: "var(--indigo_800)",
            900: "var(--indigo_900)",
            "800_01": "var(--indigo_800_01)"
          },
          light_blue: {
            a700: "var(--light_blue_a700)"
          },
          red: {
            700: "var(--red_700)",
            800: "var(--red_800)"
          },
          white: {
            a700: "var(--white_a700)"
          }
        },
        boxShadow: {
          xs: "0 0 6px 0 #00000026",
          sm: "0 4px 4px 0 #0000003f"
        },
        fontFamily: {
          roboto: "Roboto"
        },
        backgroundImage: {
          gradient: "linear-gradient(180deg, #01012a, #030390)"
        }
      }
    },
    plugins: [require("@tailwindcss/forms")]
  };
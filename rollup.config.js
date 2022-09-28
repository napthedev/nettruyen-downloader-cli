import typescript from "@rollup/plugin-typescript";

/**
 * @type {import('rollup').RollupOptions}
 */
export default {
  input: "src/index.ts",
  output: {
    file: "dist/index.js",
    format: "es",
    banner: "#!/usr/bin/env node",
  },
  plugins: [
    typescript({
      noForceEmit: true,
      noEmitOnError: true,
    }),
  ],
  external: [
    "axios",
    "fs",
    "inquirer",
    "ora",
    "path",
    "pdfkit",
    "radash",
    "sharp",
    "node-html-parser",
    "crypto",
  ],
};

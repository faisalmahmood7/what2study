import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import typescript from "@rollup/plugin-typescript";
import del from "rollup-plugin-delete";
import scss from "rollup-plugin-scss";

import pkg from "./package.json";

const npmPackageConfig = {
    input: "src/App.tsx",
    output: [
        {
            file: pkg.main,
            format: "cjs",
        },
        {
            file: pkg.module,
            format: "esm",
        },
    ],
    plugins: [
        del({ targets: "build/*", runOnce: true }),
        resolve(),
        babel({
            exclude: "node_modules/**",
            presets: ["@babel/env", "@babel/preset-react"],
            babelHelpers: "bundled",
        }),
        replace({
            "process.env.NODE_ENV": JSON.stringify("production"),
            preventAssignment: true,
        }),
        commonjs(),
        scss({
            fileName: "what2StudyClientStyles.css",
            watch: "./src/styles/_**",
        }),
        typescript({ tsconfig: "./tsconfig.json" }),
    ],
    external: ["react", "react-dom"],
};

const scriptConfig = {
    input: "index.js",
    output: [
        {
            name: "What2Study",
            file: "dist/what2StudyClient.js",
            format: "umd",
        },
    ],
    plugins: [
        del({ targets: "dist/*", runOnce: true }),
        resolve(),
        babel({
            exclude: "node_modules/**",
            presets: ["@babel/env", "@babel/preset-react"],
            babelHelpers: "bundled",
        }),
        replace({
            "process.env.NODE_ENV": JSON.stringify("production"),
            preventAssignment: true,
        }),
        commonjs(),
        scss({
            fileName: "what2StudyClientStyles.css",
            watch: "./src/styles/_**",
        }),
        typescript({ tsconfig: "./tsconfig.json" }),
    ],
};

export default [
    npmPackageConfig, // build directory
    scriptConfig, // dist directory
];

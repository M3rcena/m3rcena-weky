import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';

export default [
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.cjs',
      format: 'cjs'
    },
    plugins: [commonjs(), nodeResolve(), json()]
  },
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.mjs',
      format: 'esm'
    },
    plugins: [nodeResolve(), json()]
  }
];

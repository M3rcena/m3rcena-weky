import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default {
  input: 'index.mjs',
  output: {
    dir: 'dist',
    format: 'cjs'
  },
  plugins: [commonjs(), json()]
};
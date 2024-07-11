import json from '@rollup/plugin-json';

export default {
  input: 'dist/esm/index.js',
  output: {
    file: 'dist/common/index.cjs',
    format: 'cjs'
  },
  plugins: [json()]
};
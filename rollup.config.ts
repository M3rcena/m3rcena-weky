import json from '@rollup/plugin-json';
import type { RollupOptions } from 'rollup';

const config: RollupOptions = {
  input: 'dist/esm/index.js',
  output: {
    file: 'dist/common/index.cjs',
    format: 'cjs'
  },
  plugins: [json()]
};

export default config;
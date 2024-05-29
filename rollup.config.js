import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import { format } from 'mathjs';

export default [
  {
    input: 'index.ts',
    output: {
      dir: 'dist/cjs',
      format: 'cjs'
    },
    plugins: [commonjs(), typescript(), json()],
    external: ['chalk', 'discord.js', 'quick.db', 'node-fetch', 'html-entities', 'mathjs', 'axios', 'cheerio', 'string-width']
  },
  {
    input: 'index.ts',
    output: {
      dir: 'dist/esm',
      format: 'esm'
    },
    plugins: [typescript(), json()],
    external: ['chalk', 'discord.js', 'quick.db', 'node-fetch', 'html-entities', 'mathjs', 'axios', 'cheerio', 'string-width']
  },
];

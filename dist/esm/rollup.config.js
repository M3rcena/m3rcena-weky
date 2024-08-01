import json from '@rollup/plugin-json';
const config = {
    input: 'dist/esm/index.js',
    output: {
        file: 'dist/common/index.cjs',
        format: 'cjs'
    },
    plugins: [json()]
};
export default config;

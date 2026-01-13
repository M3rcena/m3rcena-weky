import fs from 'fs';
import path from 'path';

const pkgPath = path.resolve('./package.json');
const destPath = path.resolve('./src/version.ts');

try {
    const pkgData = fs.readFileSync(pkgPath, 'utf-8');
    const pkg = JSON.parse(pkgData);

    const fileContent = `// This file is auto-generated. Do not edit manually.
export const version = "${pkg.version}";
`;

    fs.writeFileSync(destPath, fileContent);
    console.log(`✅ Generated src/version.ts with version ${pkg.version}`);
} catch (error) {
    console.error('❌ Failed to generate version file:', error);
    process.exit(1);
}
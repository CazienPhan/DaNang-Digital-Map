const fs = require('fs');
const path = require('path');

const filesToMemoize = [
  'src/features/poi/components/sections/PoiHeader.tsx',
  'src/features/poi/components/sections/PoiTitleSection.tsx',
  'src/features/poi/components/sections/PoiInformation.tsx',
  'src/features/poi/components/sections/PoiOpeningHours.tsx',
  'src/features/poi/components/sections/PoiDescription.tsx',
  'src/features/poi/components/sections/PoiMediaGallery.tsx',
  'src/features/poi/components/sections/PoiVideoGallery.tsx',
  'src/features/poi/components/sections/PoiActions.tsx',
  'src/features/poi/states/LoadingState.tsx',
  'src/features/poi/states/ErrorState.tsx'
];

filesToMemoize.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf-8');

  let replaced = false;

  // Specific fix for PoiImageItem in PoiMediaGallery
  if (file.includes('PoiMediaGallery.tsx')) {
    content = content.replace(
      'const PoiImageItem: React.FC<{ url: string; caption?: string }> = ({ url, caption }) => {',
      'const PoiImageItem: React.FC<{ url: string; caption?: string }> = React.memo(({ url, caption }) => {'
    );
    content = content.replace(
      '    </div>\n  );\n};\n',
      '    </div>\n  );\n});\n'
    );
  }

  // Common wrapper
  content = content.replace(
    /export const ([A-Za-z0-9_]+)(: React\.FC<[^>]+>)? = \(([^)]*)\) => \{/g,
    (match, name, type, args) => {
      replaced = true;
      return `export const ${name}${type || ''} = React.memo((${args}) => {`;
    }
  );

  if (replaced) {
    const lastIndex = content.lastIndexOf('};');
    if (lastIndex !== -1) {
      content = content.substring(0, lastIndex) + '});' + content.substring(lastIndex + 2);
    }
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Memoized ${file}`);
  }
});

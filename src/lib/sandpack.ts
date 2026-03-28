export function processReactCode(code: string): string {
  // Check if code uses React.* (e.g., React.useState, React.createElement)
  const usesReactDot = /\bReact\.\w+/.test(code);

  // Process code for Sandpack - remove default React import but preserve named imports
  // Only remove React import if the code doesn't use React.* syntax
  let result = code;
  if (!usesReactDot) {
    result = result
      // Transform "import React, { useState } from 'react'" to "import { useState } from 'react'"
      .replace(
        /^import\s+React\s*,\s*(\{[^}]+\})\s*from\s+['"]react['"];?/gm,
        'import $1 from "react";'
      )
      // Remove standalone "import React from 'react'"
      .replace(/^import\s+React\s+from\s+['"]react['"];?\s*$/gm, '');
  }

  // Ensure there's a default export
  const hasDefaultExport = /export\s+default\s+\w+/.test(result);
  if (!hasDefaultExport) {
    const funcMatch = result.match(
      /(?:const|function)\s+(\w+)\s*(?:=|:|\()/
    );
    if (funcMatch) {
      result = result + `\nexport default ${funcMatch[1]};`;
    }
  }

  return result;
}

export function generateHtmlDocument(code: string): string {
  if (!code.includes('<html') && !code.includes('<!DOCTYPE')) {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>body { margin: 0; padding: 0; }</style>
</head>
<body>
  ${code}
</body>
</html>`;
  }
  return code;
}

// Known package versions — pin the previously-supported packages.
// Unknown packages discovered via import scanning get "latest".
const KNOWN_VERSIONS: Record<string, string> = {
  'lucide-react': 'latest',
  'three': 'latest',
  '@react-three/fiber': 'latest',
  '@react-three/drei': 'latest',
  '@react-three/postprocessing': 'latest',
  'postprocessing': 'latest',
  'maath': 'latest',
  'matter-js': 'latest',
  'gsap': 'latest',
  'framer-motion': 'latest',
  'd3': 'latest',
  'lottie-react': 'latest',
  '@phosphor-icons/react': 'latest',
  'zustand': 'latest',
  'immer': 'latest',
  'tweakpane': 'latest',
  'react-virtuoso': 'latest',
  'xterm': 'latest',
  'xterm-addon-fit': 'latest',
};

// Packages that require implicit companions
const PEER_DEPS: Record<string, string[]> = {
  '@react-three/fiber': ['three'],
  '@react-three/drei': ['three', '@react-three/fiber'],
  '@react-three/postprocessing': ['three', '@react-three/fiber', 'postprocessing'],
  'xterm-addon-fit': ['xterm'],
};

// Sandpack's react-ts template already provides these
const TEMPLATE_PROVIDED = new Set(['react', 'react-dom', 'react/jsx-runtime']);

// Matches: import ... from 'pkg', import 'pkg', require('pkg')
// Excludes relative imports (starting with . or /)
const IMPORT_REGEX = /(?:import\s+(?:[\w*{}\s,]+\s+from\s+)?|require\s*\(\s*)['"]([^'"./][^'"]*)['"]/g;

function extractPackageName(specifier: string): string {
  if (specifier.startsWith('@')) {
    const parts = specifier.split('/');
    return parts.slice(0, 2).join('/');
  }
  return specifier.split('/')[0];
}

export function detectDependencies(code: string): Record<string, string> {
  const deps: Record<string, string> = {};

  let match;
  IMPORT_REGEX.lastIndex = 0;
  while ((match = IMPORT_REGEX.exec(code)) !== null) {
    const pkg = extractPackageName(match[1]);

    if (TEMPLATE_PROVIDED.has(pkg)) continue;

    deps[pkg] = KNOWN_VERSIONS[pkg] || 'latest';

    // Add peer dependencies
    const peers = PEER_DEPS[pkg];
    if (peers) {
      for (const peer of peers) {
        if (!deps[peer]) {
          deps[peer] = KNOWN_VERSIONS[peer] || 'latest';
        }
      }
    }
  }

  return deps;
}

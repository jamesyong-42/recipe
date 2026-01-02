# 2026-react-template

A modern React + TypeScript + Vite template with production-ready tooling.

## Features

- React 19 + TypeScript
- Vite 7 with HMR
- ESLint + Prettier
- WASM support
- Brotli compression
- S3 + CloudFront deployment

## Getting Started

```bash
pnpm install
pnpm dev
```

## Scripts

| Command        | Description                          |
| -------------- | ------------------------------------ |
| `pnpm dev`     | Start development server             |
| `pnpm build`   | Build for production                 |
| `pnpm preview` | Preview production build             |
| `pnpm lint`    | Run ESLint                           |
| `pnpm deploy`  | Build and deploy to S3 + CloudFront  |

## Deployment

Configure `.env` with your AWS resources:

```
DEPLOY_S3_BUCKET=your-bucket-name
DEPLOY_CF_DIST_ID=your-distribution-id
```

Then run `pnpm deploy`.
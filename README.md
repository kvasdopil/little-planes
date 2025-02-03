# Little Planes

An interactive visualization of Swedish domestic flights, showing real-time animations of airplanes traveling between major airports.

## Prerequisites

1. Node.js and npm installed
2. Google Cloud SDK installed and configured
3. Terraform installed
4. Access to a GCP project with billing enabled
5. Domain configured in Google Cloud DNS (guskov.dev)

## Development

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

## Deployment

1. First-time setup:

   - Create a GCP project and enable billing
   - Create a GCS bucket for Terraform state:
     ```bash
     gsutil mb gs://little-planes-tf-state
     ```
   - Configure your GCP credentials:
     ```bash
     gcloud auth application-default login
     ```

2. Deploy the application:

```bash
npm run deploy
```

3. After deployment:
   - Wait for SSL certificate provisioning (up to 24 hours)
   - The website will be available at planes.guskov.dev

## Architecture

The application is hosted on Google Cloud Platform using:

- Cloud Storage for static file hosting
- Cloud CDN for content delivery
- Cloud Load Balancing for HTTPS termination
- Managed SSL certificates for HTTPS
- Cloud DNS for domain management

Infrastructure is managed using Terraform, with state stored in Google Cloud Storage.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react';

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
});
```

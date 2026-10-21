import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
const config: NextConfig = {
  // Next 16.4 / React 19.3 enable ViewTransition without the retired experimental flag.
  poweredByHeader: false,
  devIndicators: false,
};
export default createNextIntlPlugin('./src/i18n/request.ts')(config);

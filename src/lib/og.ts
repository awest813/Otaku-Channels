import { siteConfig } from '@/constant/config';

type OpenGraphType = {
  siteName: string;
  description: string;
  templateTitle?: string;
  logo?: string;
};

/**
 * Generates a URL for a dynamic OG image.
 *
 * To enable dynamic OG image generation, create a Next.js route handler at
 * `src/app/api/og/route.tsx` using `@vercel/og` (or `next/og`).
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image#generate-images-using-code-js-ts-tsx
 */
export function openGraph({
  siteName,
  templateTitle,
  description,
  logo = `${siteConfig.url}/images/og.jpg`,
}: OpenGraphType): string {
  const ogLogo = encodeURIComponent(logo);
  const ogSiteName = encodeURIComponent(siteName.trim());
  const ogTemplateTitle = templateTitle
    ? encodeURIComponent(templateTitle.trim())
    : undefined;
  const ogDesc = encodeURIComponent(description.trim());

  return `${
    siteConfig.url
  }/api/og?siteName=${ogSiteName}&description=${ogDesc}&logo=${ogLogo}${
    ogTemplateTitle ? `&templateTitle=${ogTemplateTitle}` : ''
  }`;
}

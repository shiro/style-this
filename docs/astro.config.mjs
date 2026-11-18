// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightVersions from 'starlight-versions';

export default defineConfig({
	site: 'https://style-this.usagi.io',
	integrations: [
		starlight({
			title: 'style-this',
			description: 'Zero-runtime CSS-in-JS for the modern web.',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/shiro/style-this' }],
			editLink: { baseUrl: 'https://github.com/shiro/style-this/edit/master/docs/' },
			plugins: [
				starlightVersions({
					current: { label: 'v0.5 (latest)' },
					// newest first, see src/content/docs/releases/versioning-the-docs.md
					versions: [
						{ slug: '0.4', label: 'v0.4' },
						{ slug: '0.3', label: 'v0.3' },
					],
					exclude: ['releases/**'],
				}),
			],
			sidebar: [
				{ label: 'Getting started', items: [{ autogenerate: { directory: 'getting-started' } }] },
				{ label: 'Guides', items: [{ autogenerate: { directory: 'guides' } }] },
				{ label: 'Frameworks', items: [{ autogenerate: { directory: 'frameworks' } }] },
				{ label: 'Examples', items: [{ autogenerate: { directory: 'examples' } }] },
				{ label: 'Reference', items: [{ autogenerate: { directory: 'reference' } }] },
				{ label: 'Troubleshooting', slug: 'troubleshooting' },
				{ label: 'Releases', items: [{ autogenerate: { directory: 'releases' } }] },
			],
		}),
	],
});

export const runtime = 'edge';

export default function manifest() {
	return {
		name: 'Intico Mining Reports',
		short_name: 'Intico Mining',
		description: 'Intico Mining Reports',
		start_url: '/',
		display: 'standalone',
		background_color: '#ffffff',
		theme_color: '#ffffff',
		icons: [
			{
				src: '/web-app-manifest-192x192.png',
				sizes: '192x192',
				type: 'image/png',
				purpose: 'any maskable',
			},
			{
				src: '/web-app-manifest-512x512.png',
				sizes: '512x512',
				type: 'image/png',
				purpose: 'any maskable',
			},
		],
	}
}

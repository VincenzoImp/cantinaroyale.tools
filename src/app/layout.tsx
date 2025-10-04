// src/app/layout.tsx
import "./globals.css";
import { Providers } from "./providers";
import ErrorBoundary from "@/components/ErrorBoundary";

// Root layout component
export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<script
					dangerouslySetInnerHTML={{
						__html: `
							(function() {
								try {
									var theme = localStorage.getItem('theme');
									if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
										document.documentElement.classList.add('dark');
									}
								} catch (e) {}
							})();
						`,
					}}
				/>
			</head>
			<body className="bg-theme-background text-theme-text antialiased theme-transition">
				<ErrorBoundary>
					<Providers>
						{children}
					</Providers>
				</ErrorBoundary>
			</body>
		</html>
	);
}
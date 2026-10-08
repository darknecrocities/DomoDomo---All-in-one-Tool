(function () {
	try {
		// Recover routing path from redirects fallback (e.g. GitHub Pages)
		// Only execute if not running in an iframe or subpath environment
		const isIframe = window.self !== window.top;
		const isSubpath = window.location.pathname.includes('/anna-apps/');
		const params = new URLSearchParams(window.location.search);
		const redirectPath = params.get("p");
		if (redirectPath !== null && !isIframe && !isSubpath) {
			const cleanPath = "/" + redirectPath.replace(/~and~/g, "&");
			window.history.replaceState(
				null,
				null,
				window.location.origin + cleanPath,
			);
		}
	} catch (_) {}

	try {
		const saved = localStorage.getItem("domo-theme");
		if (saved === "light") {
			document.documentElement.classList.add("light");
			document.documentElement.classList.remove("dark");
		} else {
			document.documentElement.classList.add("dark");
			document.documentElement.classList.remove("light");
		}
	} catch (_) {}
})();

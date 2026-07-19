import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
	Download,
	Laptop,
	Smartphone,
	Shield,
	Sparkles,
	CheckCircle,
	Info,
} from "lucide-react";

export const DownloadPage = () => {
	const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
	const [isInstallable, setIsInstallable] = useState(false);
	const [installSuccess, setInstallSuccess] = useState(false);

	useEffect(() => {
		const handleBeforeInstallPrompt = (e: Event) => {
			e.preventDefault();
			setDeferredPrompt(e);
			setIsInstallable(true);
		};

		window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

		if (window.matchMedia("(display-mode: standalone)").matches) {
			setIsInstallable(false);
		}

		return () => {
			window.removeEventListener(
				"beforeinstallprompt",
				handleBeforeInstallPrompt,
			);
		};
	}, []);

	const handleInstall = async () => {
		if (!deferredPrompt) return;
		deferredPrompt.prompt();
		const { outcome } = await deferredPrompt.userChoice;
		if (outcome === "accepted") {
			setInstallSuccess(true);
			setIsInstallable(false);
		}
		setDeferredPrompt(null);
	};

	return (
		<div className="flex flex-col gap-8 text-left w-full animate-fadeIn max-w-7xl mx-auto px-4 md:px-8 py-4">
			<Helmet>
				<title>Download DomoDomo App - Desktop PWA & Mobile Installer</title>
				<meta
					name="description"
					content="Download DomoDomo as a Progressive Web App (PWA) on Windows & macOS. Access 120+ secure developer, text, and media utilities offline."
				/>
			</Helmet>

			{/* Hero Welcome Banner */}
			<section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-3xl bg-[#18191B] border border-[#2A2D30] p-8 md:p-12 relative overflow-hidden">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#2a2d30_1px,transparent_1px),linear-gradient(to_bottom,#2a2d30_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.12] pointer-events-none" />
				<div className="lg:col-span-8 z-10 flex flex-col gap-4">
					<div className="flex flex-wrap items-center gap-3">
						<div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold w-fit">
							<Download size={12} />
							<span>Offline Ready</span>
						</div>
					</div>
					<h1 className="text-3xl md:text-5xl font-extrabold text-[#ECEBE9] tracking-tight leading-tight font-heading">
						Install DomoDomo Everywhere
					</h1>
					<p className="text-[#A3A09B] text-sm md:text-base leading-relaxed max-w-3xl">
						Run your favorite toolbox directly from your desktop, taskbar, or
						homescreen. Runs completely offline in your browser sandbox,
						ensuring maximum performance and complete privacy.
					</p>
				</div>
				<div className="lg:col-span-4 z-10 flex justify-center lg:justify-end">
					<div className="bg-[#111213] border border-[#2A2D30] rounded-3xl p-6 w-36 h-36 flex items-center justify-center shadow-lg relative group overflow-hidden">
						<div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-[#3C6B4D] rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-300" />
						<div className="relative w-full h-full bg-[#18191B] rounded-2xl flex items-center justify-center border border-[#2A2D30]">
							<Download size={48} className="text-emerald-400 animate-pulse" />
						</div>
					</div>
				</div>
			</section>

			{/* Main Download Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full items-stretch">
				{/* Desktop Card (Windows & macOS) */}
				<div className="flex flex-col justify-between rounded-2xl bg-[#18191B] border border-[#2A2D30] p-6 md:p-8 hover:border-emerald-500/30 transition-all duration-300 relative group overflow-hidden">
					<div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
						<Laptop size={120} className="text-[#ECEBE9]" />
					</div>
					<div className="z-10 flex flex-col gap-4">
						<div className="flex items-center gap-3">
							<div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
								<Laptop size={24} />
							</div>
							<div>
								<h2 className="text-xl font-bold text-[#ECEBE9]">
									Desktop Client
								</h2>
								<p className="text-xs text-emerald-400 font-medium">
									Windows • macOS • Linux
								</p>
							</div>
						</div>

						<p className="text-[#A3A09B] text-sm leading-relaxed">
							Install DomoDomo natively as a Progressive Web App (PWA). Launches
							instantly from your applications menu or taskbar, offering high
							speed offline utility integration.
						</p>

						<div className="mt-2 space-y-2">
							<div className="flex items-start gap-2 text-xs text-[#A3A09B]">
								<CheckCircle
									size={14}
									className="text-emerald-400 shrink-0 mt-0.5"
								/>
								<span>Runs in a secure browser sandbox environment.</span>
							</div>
							<div className="flex items-start gap-2 text-xs text-[#A3A09B]">
								<CheckCircle
									size={14}
									className="text-emerald-400 shrink-0 mt-0.5"
								/>
								<span>Automatic background updates.</span>
							</div>
							<div className="flex items-start gap-2 text-xs text-[#A3A09B]">
								<CheckCircle
									size={14}
									className="text-emerald-400 shrink-0 mt-0.5"
								/>
								<span>Offline support for all local tools.</span>
							</div>
						</div>
					</div>

					<div className="z-10 mt-8 pt-6 border-t border-[#2A2D30]/60">
						{isInstallable ? (
							<button
								onClick={handleInstall}
								className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/35 hover:border-emerald-400 hover:bg-emerald-500/25 text-emerald-400 hover:text-emerald-300 transition-all font-bold text-sm shadow-[0_0_15px_rgba(16,185,129,0.1)] active:scale-[0.98]"
							>
								<Download
									size={16}
									className="animate-bounce"
									style={{ animationDuration: "2.5s" }}
								/>
								<span>Install PWA Desktop App</span>
							</button>
						) : installSuccess ? (
							<div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-400/90 text-sm font-semibold">
								<CheckCircle size={16} />
								<span>Installation Prompt Accepted!</span>
							</div>
						) : (
							<div className="bg-[#111213] border border-[#2A2D30] rounded-xl p-4 flex gap-3 items-start">
								<Info size={16} className="text-[#A3A09B] shrink-0 mt-0.5" />
								<div className="flex flex-col gap-1">
									<p className="text-xs font-bold text-[#ECEBE9]">
										How to Install on Desktop:
									</p>
									<p className="text-[11px] text-[#A3A09B] leading-relaxed">
										Click the install icon (
										<span className="text-[#ECEBE9]">⊕</span>) in your browser
										address bar (Chrome, Edge, or Brave) to add DomoDomo to your
										desktop.
									</p>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Mobile Card (Android & iOS) */}
				<div className="flex flex-col justify-between rounded-2xl bg-[#18191B] border border-[#2A2D30] p-6 md:p-8 hover:border-emerald-500/30 transition-all duration-300 relative group overflow-hidden">
					<div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
						<Smartphone size={120} className="text-[#ECEBE9]" />
					</div>
					<div className="z-10 flex flex-col gap-4">
						<div className="flex items-center gap-3">
							<div className="p-2 rounded-xl bg-[#E29E2D]/10 text-[#E29E2D] border border-[#E29E2D]/25">
								<Smartphone size={24} />
							</div>
							<div>
								<h2 className="text-xl font-bold text-[#ECEBE9]">
									Mobile Client
								</h2>
								<p className="text-xs text-[#E29E2D] font-medium font-mono">
									Coming Soon • PWA Installable
								</p>
							</div>
						</div>

						<p className="text-[#A3A09B] text-sm leading-relaxed">
							Access all utilities on the go. While native iOS and Android store
							apps are currently under development, you can use the PWA version
							today!
						</p>

						<div className="mt-2 space-y-2">
							<div className="flex items-start gap-2 text-xs text-[#A3A09B]">
								<CheckCircle
									size={14}
									className="text-emerald-400 shrink-0 mt-0.5"
								/>
								<span>
									iOS Safari: Tap share icon and select 'Add to Home Screen'.
								</span>
							</div>
							<div className="flex items-start gap-2 text-xs text-[#A3A09B]">
								<CheckCircle
									size={14}
									className="text-emerald-400 shrink-0 mt-0.5"
								/>
								<span>
									Android Chrome: Tap settings menu and select 'Add to Home
									screen'.
								</span>
							</div>
							<div className="flex items-start gap-2 text-xs text-[#A3A09B]">
								<CheckCircle
									size={14}
									className="text-[#E29E2D] shrink-0 mt-0.5"
								/>
								<span>
									Native Google Play & iOS App Store apps are coming soon.
								</span>
							</div>
						</div>
					</div>

					<div className="z-10 mt-8 pt-6 border-t border-[#2A2D30]/60 flex gap-3 items-center justify-between">
						<div className="flex-1 py-3 px-4 rounded-xl bg-[#111213] border border-[#2A2D30] text-[#72706C] text-xs font-semibold text-center flex items-center justify-center gap-1.5">
							<Sparkles size={12} className="text-[#E29E2D]" />
							<span>Google Play App Store</span>
						</div>
						<div className="flex-1 py-3 px-4 rounded-xl bg-[#111213] border border-[#2A2D30] text-[#72706C] text-xs font-semibold text-center flex items-center justify-center gap-1.5">
							<Sparkles size={12} className="text-[#E29E2D]" />
							<span>Apple App Store</span>
						</div>
					</div>
				</div>
			</div>

			{/* Benefits / FAQ section */}
			<section className="rounded-2xl bg-[#18191B] border border-[#2A2D30] p-6 md:p-8 flex flex-col gap-6">
				<h3 className="text-lg font-bold text-[#ECEBE9] flex items-center gap-2">
					<Shield className="text-emerald-400" size={18} />
					<span>Why Install DomoDomo App?</span>
				</h3>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="flex flex-col gap-2">
						<span className="font-bold text-sm text-[#ECEBE9]">
							1. Zero Internet Required
						</span>
						<p className="text-xs text-[#A3A09B] leading-relaxed">
							Once installed, all offline tools (e.g. JSON formatter, image
							compressors, PDF utilities) load immediately, even in complete
							offline mode.
						</p>
					</div>
					<div className="flex flex-col gap-2">
						<span className="font-bold text-sm text-[#ECEBE9]">
							2. Absolute Privacy Protection
						</span>
						<p className="text-xs text-[#A3A09B] leading-relaxed">
							Your files never touch any cloud servers. The PWA operates purely
							inside your local browser storage space.
						</p>
					</div>
					<div className="flex flex-col gap-2">
						<span className="font-bold text-sm text-[#ECEBE9]">
							3. Desktop Shortcuts
						</span>
						<p className="text-xs text-[#A3A09B] leading-relaxed">
							Pin it to your taskbar, doc list, or home launcher screen.
							Launches in a clean standalone frame without browser tabs.
						</p>
					</div>
				</div>
			</section>
		</div>
	);
};

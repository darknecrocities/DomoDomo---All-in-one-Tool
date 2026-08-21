import { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import {
	Download,
	Laptop,
	Smartphone,
	Shield,
	CheckCircle,
	CheckCircle2,
	Info,
	RefreshCw,
	Bot,
	FolderArchive,
	FileCode,
	Layers,
	Copy,
	Check,
	ShieldCheck,
	Terminal,
} from "lucide-react";
import JSZip from "jszip";
import { aiService } from "../utils/aiService";
import { DesktopPermissionsModal } from "../components/DesktopPermissionsModal";
import { LocalAISetupModal } from "../components/LocalAISetupModal";
import domodomoLogo from "../assets/domodomo.png";

// Real Brand Vector Logos
export const WindowsLogo = ({
	size = 20,
	className = "",
}: { size?: number; className?: string }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="currentColor"
		className={className}
		aria-hidden="true"
	>
		<path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.901-1.799" />
	</svg>
);

export const AppleLogo = ({
	size = 20,
	className = "",
}: { size?: number; className?: string }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="currentColor"
		className={className}
		aria-hidden="true"
	>
		<path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.85-.9.04-2.02.6-2.66 1.34-.56.65-.98 1.7-0.85 2.72 1 .08 1.98-.46 2.59-1.21Z" />
	</svg>
);

export const AndroidLogo = ({
	size = 20,
	className = "",
}: { size?: number; className?: string }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="currentColor"
		className={className}
		aria-hidden="true"
	>
		<path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.411 13.8543 8.1 12 8.1s-3.5902.311-5.1368.8507L4.8409 5.4477a.416.416 0 00-.5676-.1521.416.416 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396" />
	</svg>
);

export const LinuxLogo = ({
	size = 20,
	className = "",
}: { size?: number; className?: string }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="currentColor"
		className={className}
		aria-hidden="true"
	>
		<path d="M12.002 0c-2.484 0-4.5 2.016-4.5 4.5 0 1.258.52 2.392 1.354 3.208C6.91 8.765 5.5 11.085 5.5 13.8c0 1.488.428 2.873 1.164 4.053-.41.528-.664 1.196-.664 1.922 0 1.782 1.442 3.225 3.225 3.225 1.155 0 2.164-.61 2.73-1.52.344.02.693.02 1.047 0 .565.91 1.575 1.52 2.73 1.52 1.783 0 3.225-1.443 3.225-3.225 0-.726-.254-1.394-.664-1.922.736-1.18 1.164-2.565 1.164-4.053 0-2.715-1.41-5.035-3.354-6.092.834-.816 1.354-1.95 1.354-3.208C17.502 2.016 15.486 0 12.002 0z" />
	</svg>
);

type PlatformTab = "windows" | "mac" | "linux" | "pwa" | "mobile";

export const DownloadPage = () => {
	// OS Auto-Detection
	const [detectedOS, setDetectedOS] = useState<PlatformTab>("windows");
	const [activeTab, setActiveTab] = useState<PlatformTab>("windows");

	// PWA Install State
	const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
	const [isInstallable, setIsInstallable] = useState(false);
	const [installSuccess, setInstallSuccess] = useState(false);

	// Modals
	const [isPermsModalOpen, setIsPermsModalOpen] = useState(false);
	const [isOllamaModalOpen, setIsOllamaModalOpen] = useState(false);

	// Ollama Live State
	const [ollamaOnline, setOllamaOnline] = useState<boolean | null>(null);
	const [installedModels, setInstalledModels] = useState<string[]>([]);
	const [isCheckingOllama, setIsCheckingOllama] = useState(false);

	// Model Puller State
	const [selectedPullModel, setSelectedPullModel] = useState("llama3.2:1b");
	const [pullStatus, setPullStatus] = useState<string>("");
	const [pullProgress, setPullProgress] = useState<number>(0);
	const [isPulling, setIsPulling] = useState(false);

	// Packaging generation state
	const [isGeneratingPackage, setIsGeneratingPackage] = useState(false);
	const [generatedPkgName, setGeneratedPkgName] = useState<string | null>(null);
	const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

	// Detect Client OS
	useEffect(() => {
		const ua = navigator.userAgent || "";
		if (/iPhone|iPad|iPod/i.test(ua) || /Android/i.test(ua)) {
			setDetectedOS("mobile");
			setActiveTab("mobile");
		} else if (/Mac/i.test(ua)) {
			setDetectedOS("mac");
			setActiveTab("mac");
		} else if (/Linux/i.test(ua)) {
			setDetectedOS("linux");
			setActiveTab("linux");
		} else {
			setDetectedOS("windows");
			setActiveTab("windows");
		}
	}, []);

	// PWA Prompt Listener
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

	// Live Ollama Ping
	const checkOllamaHealth = useCallback(async () => {
		setIsCheckingOllama(true);
		try {
			const res = await aiService.checkOllama();
			setOllamaOnline(res.status);
			if (res.status) {
				setInstalledModels(res.models);
			} else {
				setInstalledModels([]);
			}
		} catch {
			setOllamaOnline(false);
			setInstalledModels([]);
		} finally {
			setIsCheckingOllama(false);
		}
	}, []);

	useEffect(() => {
		checkOllamaHealth();
	}, [checkOllamaHealth]);

	// PWA Install Trigger
	const handleInstallPWA = async () => {
		if (!deferredPrompt) return;
		deferredPrompt.prompt();
		const { outcome } = await deferredPrompt.userChoice;
		if (outcome === "accepted") {
			setInstallSuccess(true);
			setIsInstallable(false);
		}
		setDeferredPrompt(null);
	};

	// Copy Helper
	const handleCopy = (text: string, id: string) => {
		navigator.clipboard.writeText(text);
		setCopiedCmd(id);
		setTimeout(() => setCopiedCmd(null), 2000);
	};

	// Pull Model Trigger
	const handlePullModel = async () => {
		if (!selectedPullModel || isPulling) return;
		setIsPulling(true);
		setPullProgress(1);
		setPullStatus("Connecting to Ollama...");
		try {
			await aiService.pullOllamaModel(
				selectedPullModel,
				(statusText, progress) => {
					setPullStatus(statusText);
					setPullProgress(progress);
				},
			);
			setPullStatus("Model ready and installed locally!");
			setPullProgress(100);
			await checkOllamaHealth();
		} catch (err: any) {
			setPullStatus(`Error: ${err.message || "Failed to download model"}`);
		} finally {
			setIsPulling(false);
		}
	};

	// Generate Windows Desktop Package (.zip with .bat, .ps1, icon, and readme)
	const handleDownloadWindowsPackage = async () => {
		setIsGeneratingPackage(true);
		setGeneratedPkgName("DomoDomo-Windows-Desktop-Bundle.zip");
		try {
			const zip = new JSZip();

			// 1. start-domodomo.bat
			const startBat = `@echo off
title DomoDomo - 100%% Local-First Developer Toolbox
echo ==============================================================
echo     DomoDomo All-in-One Local Toolbox
echo     100%% Private, Browser-Sandboxed, Zero Cloud Tracking
echo ==============================================================
echo.
echo Launching DomoDomo in standalone desktop mode...
start "" "http://localhost:5173" || start "" "https://domodomo.app"
echo DomoDomo window opened.
`;
			zip.file("start-domodomo.bat", startBat);

			// 2. start-with-ollama.bat
			const startWithOllamaBat = `@echo off
title DomoDomo Local AI & Desktop Engine
echo ==============================================================
echo     DomoDomo + Ollama Local LLM Auto-Launcher
echo ==============================================================
echo.
echo [1/3] Enabling Local AI CORS permission (OLLAMA_ORIGINS=*)...
set OLLAMA_ORIGINS=*
echo.
echo [2/3] Checking Ollama service...
where ollama >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] Ollama executable was not detected in PATH.
    echo Please install Ollama from https://ollama.com or run install-ollama.ps1
) else (
    echo Starting Ollama background server...
    start /B "" ollama serve
)
echo.
echo [3/3] Launching DomoDomo Toolbox...
timeout /t 2 /nobreak >nul
start "" "http://localhost:5173" || start "" "https://domodomo.app"
echo.
echo DomoDomo is running! You can keep this launcher minimized.
`;
			zip.file("start-with-ollama.bat", startWithOllamaBat);

			// 3. install-ollama.ps1
			const installOllamaPs1 = `# DomoDomo Automated Ollama Installer & Model Downloader
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "   DomoDomo Windows Auto-Setup & Local AI Engine" -ForegroundColor Green
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host ""

$ollamaCmd = Get-Command ollama -ErrorAction SilentlyContinue

if (-not $ollamaCmd) {
    Write-Host "[1/4] Downloading official Ollama Setup for Windows..." -ForegroundColor Yellow
    $installerPath = "$env:TEMP\OllamaSetup.exe"
    try {
        Invoke-WebRequest -Uri "https://ollama.com/download/OllamaSetup.exe" -OutFile $installerPath -UseBasicParsing
        Write-Host "[2/4] Launching Ollama Installer..." -ForegroundColor Cyan
        Start-Process $installerPath -Wait
        Write-Host "Ollama installed successfully!" -ForegroundColor Green
    } catch {
        Write-Host "Could not automatically download Ollama. Please visit https://ollama.com/download" -ForegroundColor Red
    }
} else {
    Write-Host "[✓] Ollama is already installed." -ForegroundColor Green
}

Write-Host ""
Write-Host "[3/4] Configuring Browser CORS (OLLAMA_ORIGINS=*)..." -ForegroundColor Cyan
[System.Environment]::SetEnvironmentVariable('OLLAMA_ORIGINS', '*', 'User')
$env:OLLAMA_ORIGINS = "*"

Write-Host "Starting Ollama service..." -ForegroundColor Cyan
Start-Process ollama -ArgumentList "serve" -NoNewWindow -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "[4/4] Checking local models..." -ForegroundColor Cyan
$tags = & ollama list 2>&1
if ($tags -notmatch "llama3.2" -and $tags -notmatch "qwen") {
    Write-Host "Pulling recommended starter model (llama3.2:1b)..." -ForegroundColor Yellow
    & ollama run llama3.2:1b "Hello DomoDomo! You are ready."
}

Write-Host ""
Write-Host "==============================================================" -ForegroundColor Green
Write-Host "   Setup Completed! Launching DomoDomo App..." -ForegroundColor Green
Write-Host "==============================================================" -ForegroundColor Green
Start-Process "https://domodomo.app"
`;
			zip.file("install-ollama.ps1", installOllamaPs1);

			// 4. README.txt
			const readmeText = `========================================================================
   DomoDomo - All-in-One Local Toolbox (Windows Desktop Package)
   Website: https://domodomo.app
========================================================================

INCLUDED FILES:
1. start-domodomo.bat
   - Double-click to launch DomoDomo instantly in your default browser.

2. start-with-ollama.bat
   - Sets OLLAMA_ORIGINS=* and starts both Ollama and DomoDomo with full Local AI features.

3. install-ollama.ps1
   - Right-click -> "Run with PowerShell" to automatically download Ollama,
     configure environment permissions, and pull the starter llama3.2:1b model.

4. DomoDomo-Icon.png / favicon.png
   - High-resolution mascot panda icon for creating desktop & taskbar shortcuts.

OFFLINE & PRIVACY GUARANTEE:
- All 120+ utilities (PDF tools, image resizers, formatters, OCR, audio)
  execute 100% locally on your computer.
- No files, images, or documents are ever uploaded to any cloud server.
`;
			zip.file("README.txt", readmeText);

			// 5. Fetch app icon (.ico and .png) and bundle
			try {
				const icoRes = await fetch("/DomoDomo.ico");
				if (icoRes.ok) {
					const icoBlob = await icoRes.blob();
					zip.file("DomoDomo.ico", icoBlob);
				}
				const iconRes = await fetch("/favicon.png");
				if (iconRes.ok) {
					const iconBlob = await iconRes.blob();
					zip.file("DomoDomo-Icon.png", iconBlob);
					zip.file("favicon.png", iconBlob);
				}
			} catch (e) {
				console.warn("Could not fetch icons for zip", e);
			}

			// Generate and trigger download
			const content = await zip.generateAsync({ type: "blob" });
			const downloadUrl = URL.createObjectURL(content);
			const link = document.createElement("a");
			link.href = downloadUrl;
			link.download = "DomoDomo-Windows-Portable.zip";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(downloadUrl);
		} catch (err) {
			console.error("Failed to generate zip", err);
		} finally {
			setIsGeneratingPackage(false);
			setTimeout(() => setGeneratedPkgName(null), 3000);
		}
	};

	// Generate macOS Desktop Package (.zip with .command, .sh, icon, and readme)
	const handleDownloadMacPackage = async () => {
		setIsGeneratingPackage(true);
		setGeneratedPkgName("DomoDomo-macOS-Desktop-Bundle.zip");
		try {
			const zip = new JSZip();

			// 1. DomoDomo.command
			const startCommand = `#!/bin/bash
# DomoDomo macOS Native Launcher
echo "=============================================================="
echo "   DomoDomo - 100% Local-First Toolbox for macOS"
echo "=============================================================="
echo ""
export OLLAMA_ORIGINS="*"
if command -v ollama >/dev/null 2>&1; then
    echo "Starting background Ollama local LLM engine..."
    ollama serve >/dev/null 2>&1 &
fi
echo "Opening DomoDomo in your default browser..."
open "http://localhost:5173" 2>/dev/null || open "https://domodomo.app"
`;
			zip.file("DomoDomo.command", startCommand);

			// 2. install-ollama.sh
			const installSh = `#!/bin/bash
# DomoDomo macOS Automated Ollama & Local AI Setup
echo "=============================================================="
echo "   DomoDomo Local AI & Ollama Installer"
echo "=============================================================="
echo ""
if ! command -v ollama >/dev/null 2>&1; then
    echo "Downloading and installing official Ollama for macOS..."
    curl -fsSL https://ollama.com/install.sh | sh
fi
export OLLAMA_ORIGINS="*"
echo "Starting Ollama engine..."
ollama serve >/dev/null 2>&1 &
sleep 2
echo "Pulling starter model (llama3.2:1b)..."
ollama pull llama3.2:1b
echo "Setup complete! Opening DomoDomo..."
open "https://domodomo.app"
`;
			zip.file("install-ollama.sh", installSh);

			// 3. README.txt
			const readmeText = `========================================================================
   DomoDomo - All-in-One Local Toolbox (macOS Package)
   Website: https://domodomo.app
========================================================================

INSTRUCTIONS:
1. Open Terminal and make the launcher executable:
   chmod +x DomoDomo.command install-ollama.sh

2. Double-click "DomoDomo.command" to launch DomoDomo.

3. Run "./install-ollama.sh" if you want to automatically install Ollama,
   enable CORS permissions, and pull local AI models.

4. "AppIcon.icns" and "DomoDomo-Icon.png" are provided for custom folder/dock icons.
`;
			zip.file("README.txt", readmeText);

			// 4. Icons (.icns and .png)
			try {
				const icnsRes = await fetch("/AppIcon.icns");
				if (icnsRes.ok) {
					const icnsBlob = await icnsRes.blob();
					zip.file("AppIcon.icns", icnsBlob);
				}
				const iconRes = await fetch("/favicon.png");
				if (iconRes.ok) {
					const iconBlob = await iconRes.blob();
					zip.file("DomoDomo-Icon.png", iconBlob);
				}
			} catch {}

			const content = await zip.generateAsync({ type: "blob" });
			const downloadUrl = URL.createObjectURL(content);
			const link = document.createElement("a");
			link.href = downloadUrl;
			link.download = "DomoDomo-macOS-Package.zip";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(downloadUrl);
		} catch (err) {
			console.error("Failed to generate zip", err);
		} finally {
			setIsGeneratingPackage(false);
			setTimeout(() => setGeneratedPkgName(null), 3000);
		}
	};

	// Direct Download of Standalone Scripts
	const downloadSingleFile = (
		content: string,
		filename: string,
		mimeType: string,
	) => {
		const blob = new Blob([content], { type: mimeType });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	return (
		<div className="flex flex-col gap-8 text-left w-full animate-fadeIn max-w-7xl mx-auto px-4 md:px-8 py-4">
			<Helmet>
				<title>
					Download DomoDomo Desktop App — Windows .exe, macOS .dmg & PWA
				</title>
				<meta
					name="description"
					content="Download DomoDomo for Windows (.exe / portable), macOS (.dmg / app), Linux, and Mobile PWA. 100% offline, client-side developer toolbox with auto Ollama Local AI integration."
				/>
			</Helmet>

			{generatedPkgName && (
				<div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between gap-3 animate-fadeIn">
					<div className="flex items-center gap-3">
						<CheckCircle size={20} className="text-emerald-400 shrink-0" />
						<div>
							<span className="text-xs font-bold text-[#ECEBE9] block">
								Download Started!
							</span>
							<span className="text-[11px] text-[#A3A09B]">
								{generatedPkgName} has been generated and downloaded to your computer.
							</span>
						</div>
					</div>
					<button
						onClick={() => setGeneratedPkgName(null)}
						className="text-xs text-[#A3A09B] hover:text-[#ECEBE9] px-2 py-1 rounded bg-[#18191B] border border-[#2A2D30]"
					>
						Dismiss
					</button>
				</div>
			)}

			{/* Hero Welcome Banner with Panda Mascot */}
			<section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-3xl bg-[#18191B] border border-[#2A2D30] p-8 md:p-12 relative overflow-hidden">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#2a2d30_1px,transparent_1px),linear-gradient(to_bottom,#2a2d30_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.12] pointer-events-none" />
				<div className="lg:col-span-8 z-10 flex flex-col gap-4">
					<div className="flex flex-wrap items-center gap-3">
						<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold w-fit">
							<ShieldCheck size={14} />
							<span>100% Client-Side & Local-First</span>
						</div>
						<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3C6B4D]/15 text-emerald-400 border border-[#3C6B4D]/30 text-xs font-semibold w-fit">
							<Bot size={14} />
							<span>Ollama Local AI Ready</span>
						</div>
						<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold w-fit">
							{detectedOS === "windows" && <WindowsLogo size={14} />}
							{detectedOS === "mac" && <AppleLogo size={14} />}
							{detectedOS === "linux" && <LinuxLogo size={14} />}
							{detectedOS === "mobile" && <Smartphone size={14} />}
							<span>
								Detected OS:{" "}
								{detectedOS === "windows"
									? "Windows"
									: detectedOS === "mac"
										? "macOS"
										: detectedOS === "linux"
											? "Linux"
											: "Mobile"}
							</span>
						</div>
					</div>

					<h1 className="text-3xl md:text-5xl font-black text-[#ECEBE9] tracking-tight leading-tight font-heading">
						Download DomoDomo for Desktop & Mobile
					</h1>
					<p className="text-[#A3A09B] text-sm md:text-base leading-relaxed max-w-3xl">
						Get the full standalone DomoDomo experience with all 120+ developer,
						PDF, photo, audio, security, and local AI utilities. Install as a
						native desktop application on Windows (<code>.exe</code>), macOS (
						<code>.dmg</code>), Linux, or instant offline PWA.
					</p>

					{/* Quick Actions in Hero */}
					<div className="flex flex-wrap items-center gap-3 mt-2">
						<button
							onClick={() => setIsPermsModalOpen(true)}
							className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25282B] hover:bg-[#2A2D30] text-[#ECEBE9] border border-[#3C4044] text-xs font-bold transition-all shadow-md active:scale-95"
						>
							<Shield size={14} className="text-emerald-400" />
							<span>Configure Desktop Permissions</span>
						</button>

						<button
							onClick={() => setIsOllamaModalOpen(true)}
							className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3C6B4D]/15 hover:bg-[#3C6B4D]/25 text-emerald-300 border border-[#3C6B4D]/35 text-xs font-bold transition-all shadow-md active:scale-95"
						>
							<Bot size={14} />
							<span>Ollama Setup Guide</span>
						</button>
					</div>
				</div>

				{/* Panda Mascot Brand Icon Box */}
				<div className="lg:col-span-4 z-10 flex justify-center lg:justify-end">
					<div className="bg-[#111213] border border-[#2A2D30] rounded-3xl p-4 w-44 h-44 flex items-center justify-center shadow-2xl relative group overflow-hidden">
						<div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 via-[#3C6B4D] to-[#E29E2D] rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-500" />
						<div className="relative w-full h-full bg-[#18191B] rounded-2xl flex items-center justify-center border border-[#2A2D30] p-4">
							<img
								src={domodomoLogo}
								alt="DomoDomo Mascot Logo"
								className="w-28 h-28 object-contain rounded-2xl group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)]"
							/>
						</div>
					</div>
				</div>
			</section>

			{/* Live Local AI / Ollama Engine Health Bar */}
			<section className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div className="flex items-center gap-3.5">
					<div
						className={`p-3 rounded-xl border ${
							ollamaOnline
								? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
								: "bg-amber-500/10 border-amber-500/25 text-amber-400"
						}`}
					>
						<Bot size={22} />
					</div>
					<div>
						<div className="flex items-center gap-2">
							<span className="text-xs font-bold text-[#ECEBE9]">
								Local Ollama AI Engine
							</span>
							<div
								className={`w-2.5 h-2.5 rounded-full ${
									ollamaOnline ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
								}`}
							/>
							<span
								className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
									ollamaOnline
										? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
										: "bg-amber-500/15 text-amber-400 border border-amber-500/25"
								}`}
							>
								{ollamaOnline ? "Active & Connected" : "Not Detected"}
							</span>
						</div>
						<p className="text-xs text-[#A3A09B] mt-0.5">
							{ollamaOnline
								? `${installedModels.length} models ready (${installedModels.slice(0, 4).join(", ")}${installedModels.length > 4 ? "..." : ""}) on localhost:11434.`
								: "Ollama is required for local AI chat, HuggingFace GGUF models, and code refactoring."}
						</p>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-2.5">
					{ollamaOnline ? (
						<div className="flex items-center gap-2 bg-[#111213] border border-[#2A2D30] px-3 py-1.5 rounded-xl">
							<select
								value={selectedPullModel}
								onChange={(e) => setSelectedPullModel(e.target.value)}
								disabled={isPulling}
								className="bg-transparent text-xs text-[#ECEBE9] font-medium outline-none cursor-pointer"
							>
								<option value="llama3.2:1b" className="bg-[#18191B]">
									Llama 3.2 1B (1.3 GB)
								</option>
								<option value="llama3.2:3b" className="bg-[#18191B]">
									Llama 3.2 3B (2.0 GB)
								</option>
								<option value="qwen2.5:1.5b" className="bg-[#18191B]">
									Qwen 2.5 1.5B (1.0 GB)
								</option>
								<option value="gemma2:2b" className="bg-[#18191B]">
									Gemma 2 2B (1.6 GB)
								</option>
								<option value="deepseek-r1:1.5b" className="bg-[#18191B]">
									DeepSeek R1 1.5B (1.1 GB)
								</option>
								<option value="llava:7b" className="bg-[#18191B]">
									Llava 7B Vision (4.5 GB)
								</option>
							</select>

							<button
								onClick={handlePullModel}
								disabled={isPulling}
								className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1"
							>
								{isPulling ? (
									<>
										<RefreshCw size={12} className="animate-spin" />
										<span>{pullProgress}%</span>
									</>
								) : (
									<>
										<Download size={12} />
										<span>Pull Model</span>
									</>
								)}
							</button>
						</div>
					) : (
						<div className="flex items-center gap-2">
							<a
								href={
									detectedOS === "windows"
										? "https://ollama.com/download/OllamaSetup.exe"
										: detectedOS === "mac"
											? "https://ollama.com/download/Ollama-darwin.zip"
											: "https://ollama.com/download"
								}
								target="_blank"
								rel="noreferrer"
								className="px-3.5 py-2 rounded-xl bg-[#3C6B4D]/20 text-emerald-300 hover:bg-[#3C6B4D]/30 border border-[#3C6B4D]/35 text-xs font-bold transition-all flex items-center gap-1.5"
							>
								<Download size={14} />
								<span>
									Download Ollama for{" "}
									{detectedOS === "windows"
										? "Windows (.exe)"
										: detectedOS === "mac"
											? "macOS"
											: "Linux"}
								</span>
							</a>
						</div>
					)}

					<button
						onClick={checkOllamaHealth}
						disabled={isCheckingOllama}
						className="p-2 rounded-xl bg-[#111213] border border-[#2A2D30] text-[#A3A09B] hover:text-[#ECEBE9] hover:bg-[#25282B] transition-all"
						title="Retry Ollama Connection"
					>
						<RefreshCw
							size={14}
							className={isCheckingOllama ? "animate-spin" : ""}
						/>
					</button>
				</div>
			</section>

			{/* Progress Indicator for Live Model Pull */}
			{isPulling && (
				<div className="bg-[#111213] border border-emerald-500/30 rounded-xl p-4 flex flex-col gap-2 animate-fadeIn">
					<div className="flex items-center justify-between text-xs">
						<span className="font-bold text-[#ECEBE9]">
							Downloading Local AI Model: {selectedPullModel}
						</span>
						<span className="font-mono font-bold text-emerald-400">
							{pullProgress}%
						</span>
					</div>
					<div className="w-full bg-[#18191B] rounded-full h-2 overflow-hidden border border-[#2A2D30]">
						<div
							className="bg-gradient-to-r from-emerald-500 to-[#3C6B4D] h-full transition-all duration-300 rounded-full"
							style={{ width: `${pullProgress}%` }}
						/>
					</div>
					<p className="text-[11px] text-[#A3A09B] font-mono">
						{pullStatus || "Streaming weights into local Ollama storage..."}
					</p>
				</div>
			)}

			{/* Platform Navigation Tabs */}
			<div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#2A2D30]">
				<button
					onClick={() => setActiveTab("windows")}
					className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shrink-0 ${
						activeTab === "windows"
							? "bg-blue-500/15 text-blue-400 border border-blue-500/35 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
							: "bg-[#18191B] text-[#A3A09B] hover:text-[#ECEBE9] hover:bg-[#25282B] border border-[#2A2D30]"
					}`}
				>
					<WindowsLogo size={15} />
					<span>Windows (.exe / Portable)</span>
					{detectedOS === "windows" && (
						<span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-extrabold">
							Recommended
						</span>
					)}
				</button>

				<button
					onClick={() => setActiveTab("mac")}
					className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shrink-0 ${
						activeTab === "mac"
							? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/35 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
							: "bg-[#18191B] text-[#A3A09B] hover:text-[#ECEBE9] hover:bg-[#25282B] border border-[#2A2D30]"
					}`}
				>
					<AppleLogo size={15} />
					<span>macOS (.dmg / App)</span>
					{detectedOS === "mac" && (
						<span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-extrabold">
							Recommended
						</span>
					)}
				</button>

				<button
					onClick={() => setActiveTab("linux")}
					className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shrink-0 ${
						activeTab === "linux"
							? "bg-amber-500/15 text-amber-400 border border-amber-500/35 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
							: "bg-[#18191B] text-[#A3A09B] hover:text-[#ECEBE9] hover:bg-[#25282B] border border-[#2A2D30]"
					}`}
				>
					<LinuxLogo size={15} />
					<span>Linux (.AppImage / .deb)</span>
					{detectedOS === "linux" && (
						<span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-extrabold">
							Recommended
						</span>
					)}
				</button>

				<button
					onClick={() => setActiveTab("pwa")}
					className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shrink-0 ${
						activeTab === "pwa"
							? "bg-[#3C6B4D]/20 text-emerald-300 border border-[#3C6B4D]/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
							: "bg-[#18191B] text-[#A3A09B] hover:text-[#ECEBE9] hover:bg-[#25282B] border border-[#2A2D30]"
					}`}
				>
					<Layers size={15} />
					<span>Web PWA Desktop</span>
				</button>

				<button
					onClick={() => setActiveTab("mobile")}
					className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shrink-0 ${
						activeTab === "mobile"
							? "bg-[#E29E2D]/15 text-[#E29E2D] border border-[#E29E2D]/35 shadow-[0_0_15px_rgba(226,158,45,0.15)]"
							: "bg-[#18191B] text-[#A3A09B] hover:text-[#ECEBE9] hover:bg-[#25282B] border border-[#2A2D30]"
					}`}
				>
					<Smartphone size={15} />
					<span>Mobile (iOS & Android)</span>
					{detectedOS === "mobile" && (
						<span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-[#E29E2D]/20 text-[#E29E2D] font-extrabold">
							Recommended
						</span>
					)}
				</button>
			</div>

			{/* ========================================================================= */}
			{/* TAB 1: WINDOWS DOWNLOADS */}
			{/* ========================================================================= */}
			{activeTab === "windows" && (
				<div className="flex flex-col gap-6 animate-fadeIn">
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
						{/* Main Installer Card */}
						<div className="lg:col-span-7 flex flex-col justify-between rounded-3xl bg-[#18191B] border border-[#2A2D30] p-6 md:p-8 hover:border-blue-500/40 transition-all relative overflow-hidden group">
							<div className="z-10 flex flex-col gap-5">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/25">
											<WindowsLogo size={28} />
										</div>
										<div>
											<h2 className="text-2xl font-black text-[#ECEBE9] font-heading">
												DomoDomo for Windows
											</h2>
											<p className="text-xs text-blue-400 font-semibold font-mono">
												Windows 10 / 11 (x64 & ARM64)
											</p>
										</div>
									</div>
									<img
										src="/favicon.png"
										alt="Icon"
										className="w-10 h-10 object-contain drop-shadow"
									/>
								</div>

								<p className="text-[#A3A09B] text-sm leading-relaxed">
									Full standalone Windows desktop client with automatic Ollama
									local AI background launcher, persistent hardware-accelerated
									storage, and offline sandbox support.
								</p>

								{/* Feature checklist */}
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
									<div className="flex items-center gap-2 text-xs text-[#ECEBE9]">
										<CheckCircle2
											size={15}
											className="text-emerald-400 shrink-0"
										/>
										<span>Executable (.exe) & Portable</span>
									</div>
									<div className="flex items-center gap-2 text-xs text-[#ECEBE9]">
										<CheckCircle2
											size={15}
											className="text-emerald-400 shrink-0"
										/>
										<span>Auto-starts Ollama with CORS</span>
									</div>
									<div className="flex items-center gap-2 text-xs text-[#ECEBE9]">
										<CheckCircle2
											size={15}
											className="text-emerald-400 shrink-0"
										/>
										<span>WebGPU & SIMD Acceleration</span>
									</div>
									<div className="flex items-center gap-2 text-xs text-[#ECEBE9]">
										<CheckCircle2
											size={15}
											className="text-emerald-400 shrink-0"
										/>
										<span>Custom Desktop Icon & Shortcuts</span>
									</div>
								</div>
							</div>

							{/* Download Actions */}
							<div className="z-10 mt-8 pt-6 border-t border-[#2A2D30] flex flex-col sm:flex-row items-center gap-3">
								<a
									href="/DomoDomo-Setup-x64.exe"
									download="DomoDomo-Setup-x64.exe"
									className="w-full sm:flex-1 py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm transition-all shadow-[0_0_25px_rgba(37,99,235,0.3)] active:scale-[0.98] flex items-center justify-center gap-2"
								>
									<Download size={16} />
									<span>Download DomoDomo Setup (.exe)</span>
								</a>

								<button
									onClick={handleDownloadWindowsPackage}
									disabled={isGeneratingPackage}
									className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-[#111213] hover:bg-[#25282B] text-[#ECEBE9] border border-[#2A2D30] font-bold text-xs transition-all flex items-center justify-center gap-2"
									title="Download Portable .zip with standalone batch launchers"
								>
									{isGeneratingPackage ? (
										<RefreshCw size={14} className="animate-spin" />
									) : (
										<FolderArchive size={14} className="text-[#A3A09B]" />
									)}
									<span>Portable (.zip)</span>
								</button>
							</div>
						</div>

						{/* Quick Setup Scripts Card */}
						<div className="lg:col-span-5 flex flex-col justify-between rounded-3xl bg-[#18191B] border border-[#2A2D30] p-6 md:p-8">
							<div className="flex flex-col gap-4">
								<div className="flex items-center gap-2.5">
									<div className="p-2.5 rounded-xl bg-[#3C6B4D]/15 text-emerald-400 border border-[#3C6B4D]/30">
										<FileCode size={20} />
									</div>
									<div>
										<h3 className="text-base font-bold text-[#ECEBE9]">
											1-Click Automated Setup Scripts
										</h3>
										<p className="text-xs text-[#A3A09B]">
											Automatic Ollama download + CORS configuration
										</p>
									</div>
								</div>

								{/* PowerShell 1-liner */}
								<div className="flex flex-col gap-2">
									<span className="text-xs font-bold text-[#ECEBE9]">
										PowerShell Auto-Setup (Run as Admin):
									</span>
									<div className="bg-[#111213] border border-[#2A2D30] rounded-xl p-3 relative font-mono text-[11px] text-[#A3A09B] group">
										<code className="text-blue-300 block overflow-x-auto whitespace-pre">
											Set-ExecutionPolicy Bypass -Scope Process;
											.\install-ollama.ps1
										</code>
										<button
											onClick={() =>
												handleCopy(
													"Set-ExecutionPolicy Bypass -Scope Process; .\\install-ollama.ps1",
													"ps1",
												)
											}
											className="absolute top-2 right-2 p-1.5 rounded-lg bg-[#25282B] text-[#ECEBE9] hover:bg-[#2A2D30] transition-colors"
											title="Copy command"
										>
											{copiedCmd === "ps1" ? (
												<Check size={13} className="text-emerald-400" />
											) : (
												<Copy size={13} />
											)}
										</button>
									</div>
								</div>

								{/* Standalone script download buttons */}
								<div className="flex flex-col gap-2 pt-2">
									<span className="text-xs font-bold text-[#ECEBE9]">
										Download Standalone Launchers:
									</span>
									<div className="grid grid-cols-2 gap-2">
										<button
											onClick={() =>
												downloadSingleFile(
													`@echo off\nset OLLAMA_ORIGINS=*\nstart /B "" ollama serve\ntimeout /t 2 /nobreak >nul\nstart "" "https://domodomo.app"\n`,
													"start-with-ollama.bat",
													"text/plain",
												)
											}
											className="py-2.5 px-3 rounded-xl bg-[#111213] hover:bg-[#25282B] border border-[#2A2D30] text-xs font-semibold text-[#ECEBE9] flex items-center justify-center gap-1.5 transition-all"
										>
											<Download size={13} className="text-blue-400" />
											<span>start-ollama.bat</span>
										</button>

										<button
											onClick={() =>
												downloadSingleFile(
													`@echo off\nstart "" "https://domodomo.app"\n`,
													"start-domodomo.bat",
													"text/plain",
												)
											}
											className="py-2.5 px-3 rounded-xl bg-[#111213] hover:bg-[#25282B] border border-[#2A2D30] text-xs font-semibold text-[#ECEBE9] flex items-center justify-center gap-1.5 transition-all"
										>
											<Download size={13} className="text-emerald-400" />
											<span>start-app.bat</span>
										</button>
									</div>
								</div>
							</div>

							<div className="mt-6 pt-4 border-t border-[#2A2D30] flex items-center justify-between text-xs text-[#A3A09B]">
								<span className="flex items-center gap-1">
									<Shield size={12} className="text-emerald-400" />
									<span>No cloud registry edits</span>
								</span>
								<span className="font-mono">Windows 10 / 11</span>
							</div>
						</div>
					</div>

					{/* Windows Step by Step Guide */}
					<section className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-6 flex flex-col gap-4">
						<h3 className="text-sm font-bold text-[#ECEBE9] uppercase tracking-wider flex items-center gap-2">
							<Info size={16} className="text-blue-400" />
							<span>How to Install & Run DomoDomo on Windows</span>
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#A3A09B] leading-relaxed">
							<div className="bg-[#111213] p-4 rounded-xl border border-[#2A2D30] flex flex-col gap-1.5">
								<span className="font-bold text-[#ECEBE9]">
									1. Download Package
								</span>
								<p>
									Click "Download Windows Portable (.zip)" or grab the installer{" "}
									<code>.exe</code> and extract it to your preferred folder.
								</p>
							</div>
							<div className="bg-[#111213] p-4 rounded-xl border border-[#2A2D30] flex flex-col gap-1.5">
								<span className="font-bold text-[#ECEBE9]">
									2. Start Ollama with CORS
								</span>
								<p>
									Double-click <code>start-with-ollama.bat</code>. It
									automatically configures <code>OLLAMA_ORIGINS="*"</code> and
									launches the local engine.
								</p>
							</div>
							<div className="bg-[#111213] p-4 rounded-xl border border-[#2A2D30] flex flex-col gap-1.5">
								<span className="font-bold text-[#ECEBE9]">
									3. Pin to Taskbar
								</span>
								<p>
									Right click <code>start-domodomo.bat</code> or the Chrome PWA
									app icon to pin DomoDomo directly to your Windows Taskbar.
								</p>
							</div>
						</div>
					</section>
				</div>
			)}

			{/* ========================================================================= */}
			{/* TAB 2: MACOS DOWNLOADS */}
			{/* ========================================================================= */}
			{activeTab === "mac" && (
				<div className="flex flex-col gap-6 animate-fadeIn">
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
						{/* macOS Installer Card */}
						<div className="lg:col-span-7 flex flex-col justify-between rounded-3xl bg-[#18191B] border border-[#2A2D30] p-6 md:p-8 hover:border-emerald-500/40 transition-all relative overflow-hidden group">
							<div className="z-10 flex flex-col gap-5">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
											<AppleLogo size={28} />
										</div>
										<div>
											<h2 className="text-2xl font-black text-[#ECEBE9] font-heading">
												DomoDomo for macOS
											</h2>
											<p className="text-xs text-emerald-400 font-semibold font-mono">
												Universal (Apple Silicon M1-M4 & Intel x64)
											</p>
										</div>
									</div>
									<img
										src="/favicon.png"
										alt="Icon"
										className="w-10 h-10 object-contain drop-shadow"
									/>
								</div>

								<p className="text-[#A3A09B] text-sm leading-relaxed">
									Native macOS bundle with Metal/WebGPU neural engine
									acceleration, local Ollama integration, Touch Bar support, and
									instant offline execution.
								</p>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
									<div className="flex items-center gap-2 text-xs text-[#ECEBE9]">
										<CheckCircle2
											size={15}
											className="text-emerald-400 shrink-0"
										/>
										<span>Apple Silicon (M1/M2/M3/M4) Optimized</span>
									</div>
									<div className="flex items-center gap-2 text-xs text-[#ECEBE9]">
										<CheckCircle2
											size={15}
											className="text-emerald-400 shrink-0"
										/>
										<span>Direct Metal / WebGPU Acceleration</span>
									</div>
									<div className="flex items-center gap-2 text-xs text-[#ECEBE9]">
										<CheckCircle2
											size={15}
											className="text-emerald-400 shrink-0"
										/>
										<span>100% Sandbox Privacy Compliance</span>
									</div>
									<div className="flex items-center gap-2 text-xs text-[#ECEBE9]">
										<CheckCircle2
											size={15}
											className="text-emerald-400 shrink-0"
										/>
										<span>Dock & Spotlight Integration</span>
									</div>
								</div>
							</div>

							<div className="z-10 mt-8 pt-6 border-t border-[#2A2D30] flex flex-col sm:flex-row items-center gap-3">
								<a
									href="/DomoDomo-Universal.dmg"
									download="DomoDomo-Universal.dmg"
									className="w-full sm:flex-1 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm transition-all shadow-[0_0_25px_rgba(16,185,129,0.3)] active:scale-[0.98] flex items-center justify-center gap-2"
								>
									<Download size={16} />
									<span>Download DomoDomo Universal (.dmg)</span>
								</a>

								<button
									onClick={handleDownloadMacPackage}
									disabled={isGeneratingPackage}
									className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-[#111213] hover:bg-[#25282B] text-[#ECEBE9] border border-[#2A2D30] font-bold text-xs transition-all flex items-center justify-center gap-2"
									title="Download macOS .command launcher scripts and icon bundle"
								>
									{isGeneratingPackage ? (
										<RefreshCw size={14} className="animate-spin" />
									) : (
										<FolderArchive size={14} className="text-[#A3A09B]" />
									)}
									<span>Package (.zip)</span>
								</button>
							</div>
						</div>

						{/* macOS Terminal / Script Box */}
						<div className="lg:col-span-5 flex flex-col justify-between rounded-3xl bg-[#18191B] border border-[#2A2D30] p-6 md:p-8">
							<div className="flex flex-col gap-4">
								<div className="flex items-center gap-2.5">
									<div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
										<Shield size={20} />
									</div>
									<div>
										<h3 className="text-base font-bold text-[#ECEBE9]">
											macOS Gatekeeper Verification Guide
										</h3>
										<p className="text-xs text-emerald-400 font-semibold">
											Bypass "Apple could not verify developer" dialog
										</p>
									</div>
								</div>

								{/* 3 Easy Methods */}
								<div className="flex flex-col gap-2.5 text-xs text-[#A3A09B]">
									<div className="bg-[#111213] p-3 rounded-xl border border-[#2A2D30] flex flex-col gap-1">
										<span className="font-bold text-[#ECEBE9] flex items-center gap-1.5">
											<span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px] font-mono">1</span>
											Right-Click Open (Fastest GUI):
										</span>
										<p className="text-[11px] leading-relaxed">
											In Finder, <b>Right-Click (Control-Click)</b> on <code className="text-emerald-300">DomoDomo.app</code> in Applications &gt; click <b>Open</b> &gt; click <b>Open</b> in the pop-up.
										</p>
									</div>

									<div className="bg-[#111213] p-3 rounded-xl border border-[#2A2D30] flex flex-col gap-1">
										<span className="font-bold text-[#ECEBE9] flex items-center gap-1.5">
											<span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px] font-mono">2</span>
											System Settings:
										</span>
										<p className="text-[11px] leading-relaxed">
											Go to <b>System Settings &gt; Privacy & Security</b> &gt; scroll down to Security section &gt; click <b>"Open Anyway"</b>.
										</p>
									</div>

									<div className="bg-[#111213] p-3 rounded-xl border border-[#2A2D30] flex flex-col gap-1.5">
										<span className="font-bold text-[#ECEBE9] flex items-center gap-1.5">
											<span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px] font-mono">3</span>
											Terminal 1-Liner (Remove Quarantine):
										</span>
										<div className="bg-[#18191B] border border-[#2A2D30] rounded-lg p-2 relative font-mono text-[10px] text-[#A3A09B] group">
											<code className="text-emerald-300 block overflow-x-auto whitespace-pre pr-8">
												xattr -cr /Applications/DomoDomo.app
											</code>
											<button
												onClick={() =>
													handleCopy(
														"xattr -cr /Applications/DomoDomo.app",
														"xattr-cmd",
													)
												}
												className="absolute top-1.5 right-1.5 p-1 rounded bg-[#25282B] text-[#ECEBE9] hover:bg-[#2A2D30] transition-colors"
												title="Copy xattr un-quarantine command"
											>
												{copiedCmd === "xattr-cmd" ? (
													<Check size={12} className="text-emerald-400" />
												) : (
													<Copy size={12} />
												)}
											</button>
										</div>
									</div>
								</div>

								<div className="flex flex-col gap-2 pt-1 border-t border-[#2A2D30]">
									<span className="text-xs font-bold text-[#ECEBE9]">
										Automated Ollama Background Script:
									</span>
									<div className="bg-[#111213] border border-[#2A2D30] rounded-xl p-2.5 relative font-mono text-[10px] text-[#A3A09B] group">
										<code className="text-emerald-300 block overflow-x-auto whitespace-pre pr-8">
											curl -fsSL https://ollama.com/install.sh | sh && export OLLAMA_ORIGINS="*" && ollama serve
										</code>
										<button
											onClick={() =>
												handleCopy(
													'curl -fsSL https://ollama.com/install.sh | sh && export OLLAMA_ORIGINS="*" && ollama serve',
													"mac-cmd",
												)
											}
											className="absolute top-2 right-2 p-1.5 rounded-lg bg-[#25282B] text-[#ECEBE9] hover:bg-[#2A2D30] transition-colors"
											title="Copy command"
										>
											{copiedCmd === "mac-cmd" ? (
												<Check size={13} className="text-emerald-400" />
											) : (
												<Copy size={13} />
											)}
										</button>
									</div>
								</div>
							</div>

							<div className="mt-6 pt-4 border-t border-[#2A2D30] flex items-center justify-between text-xs text-[#A3A09B]">
								<span className="flex items-center gap-1">
									<Shield size={12} className="text-emerald-400" />
									<span>Gatekeeper & macOS Sequoia Ready</span>
								</span>
								<span className="font-mono">macOS 12+</span>
							</div>
						</div>
					</div>

					{/* macOS Step by Step */}
					<section className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-6 flex flex-col gap-4">
						<h3 className="text-sm font-bold text-[#ECEBE9] uppercase tracking-wider flex items-center gap-2">
							<Info size={16} className="text-emerald-400" />
							<span>How to Install on macOS</span>
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#A3A09B] leading-relaxed">
							<div className="bg-[#111213] p-4 rounded-xl border border-[#2A2D30] flex flex-col gap-1.5">
								<span className="font-bold text-[#ECEBE9]">
									1. Mount DMG / Extract Zip
								</span>
								<p>
									Open <code>DomoDomo-Universal.dmg</code> and drag DomoDomo to
									your <b>Applications</b> folder.
								</p>
							</div>
							<div className="bg-[#111213] p-4 rounded-xl border border-[#2A2D30] flex flex-col gap-1.5">
								<span className="font-bold text-[#ECEBE9]">
									2. Grant Local Privileges
								</span>
								<p>
									Allow terminal/browser execution under <i>System Settings</i>{" "}
									&gt; <i>Privacy & Security</i> if prompted by Gatekeeper.
								</p>
							</div>
							<div className="bg-[#111213] p-4 rounded-xl border border-[#2A2D30] flex flex-col gap-1.5">
								<span className="font-bold text-[#ECEBE9]">
									3. Pin to macOS Dock
								</span>
								<p>
									Drag DomoDomo to your Dock for instantaneous 1-click offline
									launch.
								</p>
							</div>
						</div>
					</section>
				</div>
			)}

			{/* ========================================================================= */}
			{/* TAB 3: LINUX DOWNLOADS */}
			{/* ========================================================================= */}
			{activeTab === "linux" && (
				<div className="flex flex-col gap-6 animate-fadeIn">
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
						<div className="lg:col-span-7 flex flex-col justify-between rounded-3xl bg-[#18191B] border border-[#2A2D30] p-6 md:p-8 hover:border-amber-500/40 transition-all">
							<div className="flex flex-col gap-5">
								<div className="flex items-center gap-3">
									<div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/25">
										<LinuxLogo size={28} />
									</div>
									<div>
										<h2 className="text-2xl font-black text-[#ECEBE9] font-heading">
											DomoDomo for Linux
										</h2>
										<p className="text-xs text-amber-400 font-semibold font-mono">
											AppImage • Debian (.deb) • Arch / Fedora
										</p>
									</div>
								</div>

								<p className="text-[#A3A09B] text-sm leading-relaxed">
									Run DomoDomo seamlessly on Ubuntu, Debian, Arch Linux, Fedora,
									and Pop!_OS with zero dependency conflicts.
								</p>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
									<div className="flex items-center gap-2 text-xs text-[#ECEBE9]">
										<CheckCircle2
											size={15}
											className="text-emerald-400 shrink-0"
										/>
										<span>Universal .AppImage Binary</span>
									</div>
									<div className="flex items-center gap-2 text-xs text-[#ECEBE9]">
										<CheckCircle2
											size={15}
											className="text-emerald-400 shrink-0"
										/>
										<span>Debian & Ubuntu .deb Package</span>
									</div>
									<div className="flex items-center gap-2 text-xs text-[#ECEBE9]">
										<CheckCircle2
											size={15}
											className="text-emerald-400 shrink-0"
										/>
										<span>Systemd Ollama Daemon Integration</span>
									</div>
									<div className="flex items-center gap-2 text-xs text-[#ECEBE9]">
										<CheckCircle2
											size={15}
											className="text-emerald-400 shrink-0"
										/>
										<span>Wayland & X11 Native Rendering</span>
									</div>
								</div>
							</div>

							<div className="mt-8 pt-6 border-t border-[#2A2D30] flex flex-col sm:flex-row items-center gap-3">
								<a
									href="/DomoDomo.AppImage"
									download="DomoDomo.AppImage"
									className="w-full sm:flex-1 py-3.5 px-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-black text-sm transition-all shadow-[0_0_25px_rgba(245,158,11,0.3)] active:scale-[0.98] flex items-center justify-center gap-2"
								>
									<Download size={16} />
									<span>Download DomoDomo.AppImage</span>
								</a>

								<a
									href="/DomoDomo.deb"
									download="DomoDomo.deb"
									className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-[#111213] hover:bg-[#25282B] text-[#ECEBE9] border border-[#2A2D30] font-bold text-xs transition-all flex items-center justify-center gap-2"
								>
									<Download size={14} className="text-amber-400" />
									<span>Debian (.deb)</span>
								</a>
							</div>
						</div>

						{/* Linux Terminal Commands */}
						<div className="lg:col-span-5 flex flex-col justify-between rounded-3xl bg-[#18191B] border border-[#2A2D30] p-6 md:p-8">
							<div className="flex flex-col gap-4">
								<div className="flex items-center gap-2.5">
									<div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/25">
										<Terminal size={20} />
									</div>
									<div>
										<h3 className="text-base font-bold text-[#ECEBE9]">
											AppImage Permissions
										</h3>
										<p className="text-xs text-[#A3A09B]">
											Make executable and run
										</p>
									</div>
								</div>

								<div className="bg-[#111213] border border-[#2A2D30] rounded-xl p-3 relative font-mono text-[11px] text-[#A3A09B]">
									<pre className="text-amber-300 overflow-x-auto whitespace-pre">
										{`chmod +x DomoDomo.AppImage
./DomoDomo.AppImage`}
									</pre>
									<button
										onClick={() =>
											handleCopy(
												"chmod +x DomoDomo.AppImage && ./DomoDomo.AppImage",
												"linux-appimage",
											)
										}
										className="absolute top-2 right-2 p-1.5 rounded-lg bg-[#25282B] text-[#ECEBE9] hover:bg-[#2A2D30] transition-colors"
										title="Copy command"
									>
										{copiedCmd === "linux-appimage" ? (
											<Check size={13} className="text-emerald-400" />
										) : (
											<Copy size={13} />
										)}
									</button>
								</div>

								<div className="flex flex-col gap-1 text-xs text-[#A3A09B]">
									<span className="font-bold text-[#ECEBE9]">
										Ollama CORS configuration for systemd:
									</span>
									<code className="bg-[#111213] p-2 rounded-lg border border-[#2A2D30] font-mono text-[10px] text-emerald-300">
										Environment="OLLAMA_ORIGINS=*"
									</code>
								</div>
							</div>

							<div className="mt-6 pt-4 border-t border-[#2A2D30] text-xs text-[#A3A09B]">
								<span>Supports glibc 2.28+ and musl libc environments</span>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* ========================================================================= */}
			{/* TAB 4: PWA DESKTOP */}
			{/* ========================================================================= */}
			{activeTab === "pwa" && (
				<div className="flex flex-col gap-6 animate-fadeIn">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						{/* 1-Click PWA Card */}
						<div className="flex flex-col justify-between rounded-3xl bg-[#18191B] border border-[#2A2D30] p-6 md:p-8 hover:border-emerald-500/40 transition-all">
							<div className="flex flex-col gap-5">
								<div className="flex items-center gap-3">
									<div className="p-3 rounded-2xl bg-[#3C6B4D]/15 text-emerald-400 border border-[#3C6B4D]/30">
										<Layers size={28} />
									</div>
									<div>
										<h2 className="text-2xl font-black text-[#ECEBE9] font-heading">
											Progressive Web App (PWA)
										</h2>
										<p className="text-xs text-emerald-400 font-semibold font-mono">
											Chrome • Edge • Brave • Safari
										</p>
									</div>
								</div>

								<p className="text-[#A3A09B] text-sm leading-relaxed">
									Install DomoDomo as a native desktop browser application.
									Runs in a clean standalone window with no browser URL bars or
									tab headers, with automatic offline caching and background
									updates.
								</p>

								<div className="space-y-2 mt-2">
									<div className="flex items-center gap-2 text-xs text-[#ECEBE9]">
										<CheckCircle2
											size={15}
											className="text-emerald-400 shrink-0"
										/>
										<span>Instant installation with zero file downloads</span>
									</div>
									<div className="flex items-center gap-2 text-xs text-[#ECEBE9]">
										<CheckCircle2
											size={15}
											className="text-emerald-400 shrink-0"
										/>
										<span>Automatic background service worker caching</span>
									</div>
									<div className="flex items-center gap-2 text-xs text-[#ECEBE9]">
										<CheckCircle2
											size={15}
											className="text-emerald-400 shrink-0"
										/>
										<span>Works 100% offline once opened</span>
									</div>
								</div>
							</div>

							<div className="mt-8 pt-6 border-t border-[#2A2D30]">
								{isInstallable ? (
									<button
										onClick={handleInstallPWA}
										className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all active:scale-95"
									>
										<Download size={16} />
										<span>Install DomoDomo PWA Now</span>
									</button>
								) : installSuccess ? (
									<div className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm font-bold">
										<CheckCircle size={16} />
										<span>PWA Installed Successfully!</span>
									</div>
								) : (
									<div className="bg-[#111213] border border-[#2A2D30] rounded-2xl p-4 flex gap-3 items-start">
										<Info
											size={18}
											className="text-emerald-400 shrink-0 mt-0.5"
										/>
										<div className="flex flex-col gap-1">
											<p className="text-xs font-bold text-[#ECEBE9]">
												How to Install via Address Bar:
											</p>
											<p className="text-[11px] text-[#A3A09B] leading-relaxed">
												Click the install icon (
												<span className="text-[#ECEBE9] font-bold">⊕</span> or{" "}
												<span className="text-[#ECEBE9] font-bold">⬇</span>) in
												your browser address bar (Chrome, Edge, or Brave) to
												install DomoDomo immediately.
											</p>
										</div>
									</div>
								)}
							</div>
						</div>

						{/* Browser Specific Tips */}
						<div className="flex flex-col justify-between rounded-3xl bg-[#18191B] border border-[#2A2D30] p-6 md:p-8">
							<div className="flex flex-col gap-4">
								<h3 className="text-base font-bold text-[#ECEBE9] flex items-center gap-2">
									<Laptop size={18} className="text-emerald-400" />
									<span>Browser-Specific PWA Instructions</span>
								</h3>

								<div className="flex flex-col gap-3 text-xs text-[#A3A09B]">
									<div className="bg-[#111213] p-3.5 rounded-xl border border-[#2A2D30] flex flex-col gap-1">
										<span className="font-bold text-[#ECEBE9]">
											Google Chrome & Brave
										</span>
										<p>
											Click the three dots menu ⋮ &gt; <b>Cast, save, and share</b>{" "}
											&gt; <b>Install DomoDomo</b>.
										</p>
									</div>

									<div className="bg-[#111213] p-3.5 rounded-xl border border-[#2A2D30] flex flex-col gap-1">
										<span className="font-bold text-[#ECEBE9]">
											Microsoft Edge
										</span>
										<p>
											Click Settings &gt; <b>Apps</b> &gt;{" "}
											<b>Install this site as an app</b>.
										</p>
									</div>

									<div className="bg-[#111213] p-3.5 rounded-xl border border-[#2A2D30] flex flex-col gap-1">
										<span className="font-bold text-[#ECEBE9]">
											Apple Safari (macOS Sonoma+)
										</span>
										<p>
											Click <b>File</b> &gt; <b>Add to Dock</b>.
										</p>
									</div>
								</div>
							</div>

							<div className="mt-6 pt-4 border-t border-[#2A2D30] flex items-center justify-between text-xs text-[#A3A09B]">
								<span>Runs in sandbox with WebGPU support</span>
								<span className="text-emerald-400 font-bold">Instant Start</span>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* ========================================================================= */}
			{/* TAB 5: MOBILE (ANDROID & IOS) */}
			{/* ========================================================================= */}
			{activeTab === "mobile" && (
				<div className="flex flex-col gap-6 animate-fadeIn">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						{/* iOS Safari */}
						<div className="flex flex-col justify-between rounded-3xl bg-[#18191B] border border-[#2A2D30] p-6 md:p-8 hover:border-[#E29E2D]/40 transition-all">
							<div className="flex flex-col gap-5">
								<div className="flex items-center gap-3">
									<div className="p-3 rounded-2xl bg-[#E29E2D]/10 text-[#E29E2D] border border-[#E29E2D]/25">
										<AppleLogo size={28} />
									</div>
									<div>
										<h2 className="text-xl font-bold text-[#ECEBE9]">
											Apple iOS (iPhone & iPad)
										</h2>
										<p className="text-xs text-[#E29E2D] font-mono">
											Safari Browser • PWA Standalone
										</p>
									</div>
								</div>

								<p className="text-[#A3A09B] text-sm leading-relaxed">
									Install DomoDomo directly to your iOS Home Screen. It runs full
									screen without Safari address bars and caches all offline
									tools locally on your iPhone or iPad.
								</p>

								<div className="space-y-2 mt-2 text-xs text-[#ECEBE9]">
									<div className="flex items-start gap-2 bg-[#111213] p-3 rounded-xl border border-[#2A2D30]">
										<span className="font-bold text-[#E29E2D]">Step 1:</span>
										<span>
											Open <b>domodomo.app</b> in Safari on your iPhone/iPad.
										</span>
									</div>
									<div className="flex items-start gap-2 bg-[#111213] p-3 rounded-xl border border-[#2A2D30]">
										<span className="font-bold text-[#E29E2D]">Step 2:</span>
										<span>
											Tap the <b>Share button</b> (square with arrow pointing
											up).
										</span>
									</div>
									<div className="flex items-start gap-2 bg-[#111213] p-3 rounded-xl border border-[#2A2D30]">
										<span className="font-bold text-[#E29E2D]">Step 3:</span>
										<span>
											Scroll down and tap <b>"Add to Home Screen"</b>.
										</span>
									</div>
								</div>
							</div>

							<div className="mt-8 pt-6 border-t border-[#2A2D30] text-xs text-[#A3A09B] flex items-center justify-between">
								<span>Native iOS App Store version in development</span>
								<span className="text-[#E29E2D] font-bold">iOS 16.4+</span>
							</div>
						</div>

						{/* Android Chrome */}
						<div className="flex flex-col justify-between rounded-3xl bg-[#18191B] border border-[#2A2D30] p-6 md:p-8 hover:border-emerald-500/40 transition-all">
							<div className="flex flex-col gap-5">
								<div className="flex items-center gap-3">
									<div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
										<AndroidLogo size={28} />
									</div>
									<div>
										<h2 className="text-xl font-bold text-[#ECEBE9]">
											Android (Phones & Tablets)
										</h2>
										<p className="text-xs text-emerald-400 font-mono">
											Chrome / Firefox / Edge
										</p>
									</div>
								</div>

								<p className="text-[#A3A09B] text-sm leading-relaxed">
									Install DomoDomo with WebAPK integration. Launches from your
									app drawer, supports camera scanner and offline PDF
									converters.
								</p>

								<div className="space-y-2 mt-2 text-xs text-[#ECEBE9]">
									<div className="flex items-start gap-2 bg-[#111213] p-3 rounded-xl border border-[#2A2D30]">
										<span className="font-bold text-emerald-400">Step 1:</span>
										<span>Open DomoDomo in Google Chrome or Brave.</span>
									</div>
									<div className="flex items-start gap-2 bg-[#111213] p-3 rounded-xl border border-[#2A2D30]">
										<span className="font-bold text-emerald-400">Step 2:</span>
										<span>Tap the three dots menu (⋮) at top right.</span>
									</div>
									<div className="flex items-start gap-2 bg-[#111213] p-3 rounded-xl border border-[#2A2D30]">
										<span className="font-bold text-emerald-400">Step 3:</span>
										<span>
											Tap <b>"Install app"</b> or <b>"Add to Home screen"</b>.
										</span>
									</div>
								</div>
							</div>

							<div className="mt-8 pt-6 border-t border-[#2A2D30] text-xs text-[#A3A09B] flex items-center justify-between">
								<span>Google Play Store release coming soon</span>
								<span className="text-emerald-400 font-bold">Android 8+</span>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* ========================================================================= */}
			{/* BRAND ASSETS & HIGH-RES ICON DOWNLOAD CENTER */}
			{/* ========================================================================= */}
			<section className="rounded-3xl bg-[#18191B] border border-[#2A2D30] p-6 md:p-8 flex flex-col gap-6">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<div className="p-2.5 rounded-xl bg-[#3C6B4D]/15 text-emerald-400 border border-[#3C6B4D]/30">
							<FolderArchive size={22} />
						</div>
						<div>
							<h3 className="text-lg font-bold text-[#ECEBE9]">
								Official DomoDomo App Icon & Assets
							</h3>
							<p className="text-xs text-[#A3A09B]">
								Download high-resolution icons for Windows shortcuts, macOS
								dock, or desktop shortcuts.
							</p>
						</div>
					</div>

					<div className="flex flex-wrap items-center gap-2">
						<a
							href="/favicon.png"
							download="DomoDomo-Icon-512x512.png"
							className="px-3 py-1.5 rounded-xl bg-[#111213] hover:bg-[#25282B] text-[#ECEBE9] border border-[#2A2D30] text-xs font-semibold flex items-center gap-1.5 transition-all"
						>
							<Download size={13} className="text-emerald-400" />
							<span>Icon (PNG 512px)</span>
						</a>

						<a
							href="/favicon.png"
							download="DomoDomo-Icon.ico"
							className="px-3 py-1.5 rounded-xl bg-[#111213] hover:bg-[#25282B] text-[#ECEBE9] border border-[#2A2D30] text-xs font-semibold flex items-center gap-1.5 transition-all"
						>
							<Download size={13} className="text-blue-400" />
							<span>Shortcut (.ico)</span>
						</a>

						<a
							href="/icons.svg"
							download="DomoDomo-Vector.svg"
							className="px-3 py-1.5 rounded-xl bg-[#111213] hover:bg-[#25282B] text-[#ECEBE9] border border-[#2A2D30] text-xs font-semibold flex items-center gap-1.5 transition-all"
						>
							<Download size={13} className="text-[#E29E2D]" />
							<span>Vector (.svg)</span>
						</a>
					</div>
				</div>

				<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
					<div className="bg-[#111213] border border-[#2A2D30] rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-center">
						<img
							src="/favicon.png"
							alt="App Icon"
							className="w-12 h-12 object-contain drop-shadow"
						/>
						<span className="text-[11px] font-bold text-[#ECEBE9]">
							Domo Panda Mascot
						</span>
						<span className="text-[10px] text-[#A3A09B]">High-Res Master</span>
					</div>

					<a
						href="/DomoDomo-Setup-x64.exe"
						download="DomoDomo-Setup-x64.exe"
						className="bg-[#111213] hover:bg-[#18191B] border border-[#2A2D30] hover:border-blue-500/50 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-center transition-all group"
					>
						<div className="w-12 h-12 rounded-xl bg-[#18191B] group-hover:bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs transition-all">
							<WindowsLogo size={20} />
						</div>
						<span className="text-[11px] font-bold text-[#ECEBE9]">
							Windows Setup (.exe)
						</span>
						<span className="text-[10px] text-blue-400">Direct Download</span>
					</a>

					<a
						href="/DomoDomo-Universal.dmg"
						download="DomoDomo-Universal.dmg"
						className="bg-[#111213] hover:bg-[#18191B] border border-[#2A2D30] hover:border-emerald-500/50 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-center transition-all group"
					>
						<div className="w-12 h-12 rounded-xl bg-[#18191B] group-hover:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs transition-all">
							<AppleLogo size={20} />
						</div>
						<span className="text-[11px] font-bold text-[#ECEBE9]">
							macOS Installer (.dmg)
						</span>
						<span className="text-[10px] text-emerald-400">Direct Download</span>
					</a>

					<div className="bg-[#111213] border border-[#2A2D30] rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-center">
						<div className="w-12 h-12 rounded-xl bg-[#18191B] border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
							PWA
						</div>
						<span className="text-[11px] font-bold text-[#ECEBE9]">
							Service Worker
						</span>
						<span className="text-[10px] text-[#A3A09B]">Offline Cached</span>
					</div>
				</div>
			</section>

			{/* ========================================================================= */}
			{/* PRIVACY & SECURITY GUARANTEES */}
			{/* ========================================================================= */}
			<section className="rounded-3xl bg-[#18191B] border border-[#2A2D30] p-6 md:p-8 flex flex-col gap-6">
				<h3 className="text-lg font-bold text-[#ECEBE9] flex items-center gap-2">
					<Shield className="text-emerald-400" size={20} />
					<span>DomoDomo Desktop Privacy & Performance Guarantees</span>
				</h3>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="flex flex-col gap-2">
						<span className="font-bold text-sm text-[#ECEBE9]">
							1. 100% Zero Internet Required
						</span>
						<p className="text-xs text-[#A3A09B] leading-relaxed">
							Once downloaded or installed, all 120+ offline tools (JSON
							formatter, image compressors, PDF utilities, OCR, QR generator)
							load immediately even when completely disconnected from the
							internet.
						</p>
					</div>
					<div className="flex flex-col gap-2">
						<span className="font-bold text-sm text-[#ECEBE9]">
							2. Absolute Local Data Privacy
						</span>
						<p className="text-xs text-[#A3A09B] leading-relaxed">
							Your documents, passwords, prompts, and photos never touch any
							remote cloud server. All transformations are performed directly in
							your local machine's browser WebAssembly & WebGPU sandbox.
						</p>
					</div>
					<div className="flex flex-col gap-2">
						<span className="font-bold text-sm text-[#ECEBE9]">
							3. Seamless Local AI Integration
						</span>
						<p className="text-xs text-[#A3A09B] leading-relaxed">
							Connects directly to your local Ollama instance on{" "}
							<code>localhost:11434</code> without passing tokens or queries
							through commercial cloud APIs.
						</p>
					</div>
				</div>
			</section>

			{/* Desktop Permissions Modal Popup */}
			<DesktopPermissionsModal
				isOpen={isPermsModalOpen}
				onClose={() => setIsPermsModalOpen(false)}
				onOllamaFixRequested={() => setIsOllamaModalOpen(true)}
			/>

			{/* Local AI Setup Modal */}
			<LocalAISetupModal
				isOpen={isOllamaModalOpen}
				onClose={() => {
					setIsOllamaModalOpen(false);
					checkOllamaHealth();
				}}
				toolName="DomoDomo Local AI Hub"
			/>
		</div>
	);
};

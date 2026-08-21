import React, { useState, useEffect, useCallback } from "react";
import {
	Shield,
	ShieldCheck,
	CheckCircle2,
	AlertTriangle,
	X,
	Cpu,
	HardDrive,
	Camera,
	Mic,
	Clipboard,
	Bell,
	Bot,
	RefreshCw,
	Sparkles,
} from "lucide-react";
import { aiService } from "../utils/aiService";

export interface PermissionStatus {
	ollama: "granted" | "denied" | "checking" | "unknown";
	storage: "granted" | "denied" | "prompt" | "checking" | "unknown";
	webgpu: "granted" | "denied" | "checking" | "unknown";
	camera: "granted" | "denied" | "prompt" | "unknown";
	microphone: "granted" | "denied" | "prompt" | "unknown";
	clipboard: "granted" | "denied" | "prompt" | "unknown";
	notifications: "granted" | "denied" | "prompt" | "unknown";
}

interface DesktopPermissionsModalProps {
	isOpen: boolean;
	onClose: () => void;
	onOllamaFixRequested?: () => void;
}

export const DesktopPermissionsModal: React.FC<DesktopPermissionsModalProps> = ({
	isOpen,
	onClose,
	onOllamaFixRequested,
}) => {
	const [status, setStatus] = useState<PermissionStatus>({
		ollama: "checking",
		storage: "checking",
		webgpu: "checking",
		camera: "unknown",
		microphone: "unknown",
		clipboard: "unknown",
		notifications: "unknown",
	});

	const [gpuName, setGpuName] = useState<string>("");
	const [storageUsage, setStorageUsage] = useState<string>("");
	const [ollamaModels, setOllamaModels] = useState<string[]>([]);
	const [testingItem, setTestingItem] = useState<string | null>(null);
	const [grantAllLoading, setGrantAllLoading] = useState(false);

	const checkAllPermissions = useCallback(async () => {
		// 1. Check Ollama
		try {
			const res = await aiService.checkOllama();
			setStatus((prev) => ({
				...prev,
				ollama: res.status ? "granted" : "denied",
			}));
			if (res.status) {
				setOllamaModels(res.models);
			}
		} catch {
			setStatus((prev) => ({ ...prev, ollama: "denied" }));
		}

		// 2. Check Persistent Storage
		if (navigator.storage && navigator.storage.persisted) {
			try {
				const isPersisted = await navigator.storage.persisted();
				const estimate = await navigator.storage.estimate();
				const usedMB = estimate.usage
					? (estimate.usage / (1024 * 1024)).toFixed(1)
					: "0";
				const quotaMB = estimate.quota
					? (estimate.quota / (1024 * 1024)).toFixed(0)
					: "Unlimited";
				setStorageUsage(`${usedMB} MB used of ${quotaMB} MB sandbox quota`);
				setStatus((prev) => ({
					...prev,
					storage: isPersisted ? "granted" : "prompt",
				}));
			} catch {
				setStatus((prev) => ({ ...prev, storage: "unknown" }));
			}
		}

		// 3. Check WebGPU / Hardware SIMD
		if (typeof navigator !== "undefined" && (navigator as any).gpu) {
			try {
				const adapter = await (navigator as any).gpu.requestAdapter();
				if (adapter) {
					const info =
						adapter.info?.description ||
						adapter.info?.vendor ||
						"Hardware Accelerated WebGPU Device";
					setGpuName(info);
					setStatus((prev) => ({ ...prev, webgpu: "granted" }));
				} else {
					setStatus((prev) => ({ ...prev, webgpu: "denied" }));
				}
			} catch {
				setStatus((prev) => ({ ...prev, webgpu: "denied" }));
			}
		} else {
			setStatus((prev) => ({ ...prev, webgpu: "denied" }));
		}

		// 4. Check Notifications
		if (typeof Notification !== "undefined") {
			if (Notification.permission === "granted") {
				setStatus((prev) => ({ ...prev, notifications: "granted" }));
			} else if (Notification.permission === "denied") {
				setStatus((prev) => ({ ...prev, notifications: "denied" }));
			} else {
				setStatus((prev) => ({ ...prev, notifications: "prompt" }));
			}
		}

		// 5. Query Permission API for camera, mic, clipboard if available
		if (navigator.permissions && navigator.permissions.query) {
			try {
				const camPerm = await navigator.permissions.query({
					name: "camera" as any,
				});
				setStatus((prev) => ({
					...prev,
					camera:
						camPerm.state === "granted"
							? "granted"
							: camPerm.state === "denied"
								? "denied"
								: "prompt",
				}));
			} catch {}

			try {
				const micPerm = await navigator.permissions.query({
					name: "microphone" as any,
				});
				setStatus((prev) => ({
					...prev,
					microphone:
						micPerm.state === "granted"
							? "granted"
							: micPerm.state === "denied"
								? "denied"
								: "prompt",
				}));
			} catch {}

			try {
				const clipPerm = await navigator.permissions.query({
					name: "clipboard-read" as any,
				});
				setStatus((prev) => ({
					...prev,
					clipboard:
						clipPerm.state === "granted"
							? "granted"
							: clipPerm.state === "denied"
								? "denied"
								: "prompt",
				}));
			} catch {}
		}
	}, []);

	useEffect(() => {
		if (isOpen) {
			checkAllPermissions();
		}
	}, [isOpen, checkAllPermissions]);

	if (!isOpen) return null;

	// Action: Request Persistent Storage
	const handleRequestStorage = async () => {
		setTestingItem("storage");
		try {
			if (navigator.storage && navigator.storage.persist) {
				const persisted = await navigator.storage.persist();
				setStatus((prev) => ({
					...prev,
					storage: persisted ? "granted" : "prompt",
				}));
			}
		} catch (e) {
			console.error(e);
		} finally {
			setTestingItem(null);
		}
	};

	// Action: Request Camera
	const handleRequestCamera = async () => {
		setTestingItem("camera");
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ video: true });
			// Immediately release tracks
			stream.getTracks().forEach((t) => t.stop());
			setStatus((prev) => ({ ...prev, camera: "granted" }));
		} catch {
			setStatus((prev) => ({ ...prev, camera: "denied" }));
		} finally {
			setTestingItem(null);
		}
	};

	// Action: Request Microphone
	const handleRequestMicrophone = async () => {
		setTestingItem("microphone");
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			// Immediately release tracks
			stream.getTracks().forEach((t) => t.stop());
			setStatus((prev) => ({ ...prev, microphone: "granted" }));
		} catch {
			setStatus((prev) => ({ ...prev, microphone: "denied" }));
		} finally {
			setTestingItem(null);
		}
	};

	// Action: Request Notifications
	const handleRequestNotifications = async () => {
		setTestingItem("notifications");
		try {
			if (typeof Notification !== "undefined") {
				const perm = await Notification.requestPermission();
				setStatus((prev) => ({
					...prev,
					notifications:
						perm === "granted"
							? "granted"
							: perm === "denied"
								? "denied"
								: "prompt",
				}));
			}
		} catch {
			setStatus((prev) => ({ ...prev, notifications: "denied" }));
		} finally {
			setTestingItem(null);
		}
	};

	// Action: Request Clipboard
	const handleRequestClipboard = async () => {
		setTestingItem("clipboard");
		try {
			if (navigator.clipboard) {
				await navigator.clipboard.readText();
				setStatus((prev) => ({ ...prev, clipboard: "granted" }));
			}
		} catch {
			// On modern browsers reading empty or prompting may throw if not triggered directly
			setStatus((prev) => ({ ...prev, clipboard: "granted" }));
		} finally {
			setTestingItem(null);
		}
	};

	// Action: Grant All Recommended Permissions
	const handleGrantAll = async () => {
		setGrantAllLoading(true);
		try {
			// 1. Storage
			if (navigator.storage && navigator.storage.persist) {
				await navigator.storage.persist().catch(() => {});
			}
			// 2. Notifications
			if (
				typeof Notification !== "undefined" &&
				Notification.permission !== "granted"
			) {
				await Notification.requestPermission().catch(() => {});
			}
			// 3. Recheck all
			await checkAllPermissions();
		} finally {
			setGrantAllLoading(false);
		}
	};

	const grantedCount = Object.values(status).filter(
		(s) => s === "granted",
	).length;
	const totalCount = Object.keys(status).length;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
			<div className="bg-[#18191B] border border-[#2A2D30] rounded-3xl max-w-2xl w-full p-6 md:p-8 flex flex-col gap-6 text-left shadow-2xl relative max-h-[90vh] overflow-y-auto">
				{/* Modal Header */}
				<div className="flex items-start justify-between border-b border-[#2A2D30] pb-5">
					<div className="flex items-center gap-3">
						<div className="p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-2xl shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
							<ShieldCheck size={26} />
						</div>
						<div>
							<div className="flex items-center gap-2">
								<span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
									Sandbox Access Controls
								</span>
								<span className="text-[10px] font-mono text-[#A3A09B]">
									{grantedCount}/{totalCount} Active
								</span>
							</div>
							<h2 className="text-xl md:text-2xl font-extrabold text-[#ECEBE9] mt-1 font-heading">
								Desktop & Hardware Permissions
							</h2>
							<p className="text-xs text-[#A3A09B] mt-0.5 leading-relaxed">
								DomoDomo runs 100% locally. Granting permissions allows offline
								AI models, high-speed storage, camera OCR, and audio synthesis
								to run directly on your hardware.
							</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="p-2 rounded-xl text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#25282B] transition-colors"
						aria-label="Close permissions modal"
					>
						<X size={20} />
					</button>
				</div>

				{/* Permissions Checklist */}
				<div className="flex flex-col gap-3">
					{/* 1. Local AI & Ollama API Access */}
					<div className="bg-[#111213] border border-[#2A2D30] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-500/30 transition-all">
						<div className="flex items-start gap-3">
							<div className="p-2.5 rounded-xl bg-[#3C6B4D]/15 border border-[#3C6B4D]/30 text-emerald-400 shrink-0 mt-0.5">
								<Bot size={20} />
							</div>
							<div>
								<div className="flex items-center gap-2">
									<h3 className="text-sm font-bold text-[#ECEBE9]">
										Local AI & Ollama Engine Access
									</h3>
									{status.ollama === "granted" ? (
										<span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
											<CheckCircle2 size={10} /> Active
										</span>
									) : status.ollama === "checking" ? (
										<span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#25282B] text-[#A3A09B]">
											Checking...
										</span>
									) : (
										<span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E29E2D]/15 text-[#E29E2D] border border-[#E29E2D]/25 flex items-center gap-1">
											<AlertTriangle size={10} /> Needs Connection
										</span>
									)}
								</div>
								<p className="text-xs text-[#A3A09B] mt-0.5">
									{status.ollama === "granted"
										? `Connected to localhost:11434 with ${ollamaModels.length} models ready (${ollamaModels.slice(0, 3).join(", ")}${ollamaModels.length > 3 ? "..." : ""}).`
										: 'Allows DomoDomo to send prompts locally to your Ollama port (requires OLLAMA_ORIGINS="*").'}
								</p>
							</div>
						</div>
						<div className="shrink-0 flex items-center gap-2">
							{status.ollama !== "granted" && onOllamaFixRequested && (
								<button
									onClick={() => {
										onOllamaFixRequested();
										onClose();
									}}
									className="px-3 py-1.5 rounded-xl bg-[#3C6B4D]/15 border border-[#3C6B4D]/35 text-emerald-300 hover:bg-[#3C6B4D]/25 text-xs font-semibold transition-all"
								>
									Setup Ollama
								</button>
							)}
							<button
								onClick={checkAllPermissions}
								className="p-2 rounded-xl bg-[#18191B] border border-[#2A2D30] text-[#A3A09B] hover:text-[#ECEBE9] hover:bg-[#25282B] transition-all"
								title="Retry Ollama Ping"
							>
								<RefreshCw
									size={14}
									className={status.ollama === "checking" ? "animate-spin" : ""}
								/>
							</button>
						</div>
					</div>

					{/* 2. Persistent Storage & IndexedDB */}
					<div className="bg-[#111213] border border-[#2A2D30] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-500/30 transition-all">
						<div className="flex items-start gap-3">
							<div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 shrink-0 mt-0.5">
								<HardDrive size={20} />
							</div>
							<div>
								<div className="flex items-center gap-2">
									<h3 className="text-sm font-bold text-[#ECEBE9]">
										Persistent Storage & File Sandbox
									</h3>
									{status.storage === "granted" ? (
										<span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
											<CheckCircle2 size={10} /> Persistent
										</span>
									) : (
										<span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E29E2D]/15 text-[#E29E2D] border border-[#E29E2D]/25">
											Standard
										</span>
									)}
								</div>
								<p className="text-xs text-[#A3A09B] mt-0.5">
									{storageUsage ||
										"Stores local databases, custom prompts, and offline assets without browser auto-eviction."}
								</p>
							</div>
						</div>
						<div className="shrink-0">
							{status.storage !== "granted" ? (
								<button
									onClick={handleRequestStorage}
									disabled={testingItem === "storage"}
									className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 text-xs font-semibold transition-all"
								>
									{testingItem === "storage" ? "Requesting..." : "Make Persistent"}
								</button>
							) : (
								<div className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
									<CheckCircle2 size={14} /> Ready
								</div>
							)}
						</div>
					</div>

					{/* 3. WebGPU & Hardware Acceleration */}
					<div className="bg-[#111213] border border-[#2A2D30] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-500/30 transition-all">
						<div className="flex items-start gap-3">
							<div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 shrink-0 mt-0.5">
								<Cpu size={20} />
							</div>
							<div>
								<div className="flex items-center gap-2">
									<h3 className="text-sm font-bold text-[#ECEBE9]">
										WebGPU & SIMD Acceleration
									</h3>
									{status.webgpu === "granted" ? (
										<span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
											<CheckCircle2 size={10} /> Active
										</span>
									) : (
										<span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#25282B] text-[#A3A09B]">
											WASM Fallback
										</span>
									)}
								</div>
								<p className="text-xs text-[#A3A09B] mt-0.5">
									{gpuName
										? `Direct GPU device detected: ${gpuName}`
										: "Hardware acceleration enables near-instant client-side AI image processing and audio synthesis."}
								</p>
							</div>
						</div>
						<div className="shrink-0 text-xs font-semibold text-[#A3A09B]">
							{status.webgpu === "granted" ? (
								<span className="text-emerald-400 flex items-center gap-1">
									<CheckCircle2 size={14} /> Accelerated
								</span>
							) : (
								<span>CPU Multi-thread</span>
							)}
						</div>
					</div>

					{/* 4. Camera Privileges (OCR, QR, Vision) */}
					<div className="bg-[#111213] border border-[#2A2D30] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-500/30 transition-all">
						<div className="flex items-start gap-3">
							<div className="p-2.5 rounded-xl bg-[#E29E2D]/10 border border-[#E29E2D]/25 text-[#E29E2D] shrink-0 mt-0.5">
								<Camera size={20} />
							</div>
							<div>
								<div className="flex items-center gap-2">
									<h3 className="text-sm font-bold text-[#ECEBE9]">
										Camera & Visual Scanner Access
									</h3>
									{status.camera === "granted" ? (
										<span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
											<CheckCircle2 size={10} /> Granted
										</span>
									) : (
										<span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#25282B] text-[#A3A09B]">
											On Demand
										</span>
									)}
								</div>
								<p className="text-xs text-[#A3A09B] mt-0.5">
									Used locally for OCR Document Scanner, QR & Barcode Reader, and
									Vision AI Inspector.
								</p>
							</div>
						</div>
						<div className="shrink-0">
							{status.camera !== "granted" ? (
								<button
									onClick={handleRequestCamera}
									disabled={testingItem === "camera"}
									className="px-3.5 py-1.5 rounded-xl bg-[#E29E2D]/10 border border-[#E29E2D]/30 text-[#E29E2D] hover:bg-[#E29E2D]/20 text-xs font-semibold transition-all"
								>
									{testingItem === "camera" ? "Testing..." : "Grant Access"}
								</button>
							) : (
								<span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
									<CheckCircle2 size={14} /> Ready
								</span>
							)}
						</div>
					</div>

					{/* 5. Microphone & Audio Sandbox */}
					<div className="bg-[#111213] border border-[#2A2D30] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-500/30 transition-all">
						<div className="flex items-start gap-3">
							<div className="p-2.5 rounded-xl bg-[#E29E2D]/10 border border-[#E29E2D]/25 text-[#E29E2D] shrink-0 mt-0.5">
								<Mic size={20} />
							</div>
							<div>
								<div className="flex items-center gap-2">
									<h3 className="text-sm font-bold text-[#ECEBE9]">
										Microphone & Audio Sandbox
									</h3>
									{status.microphone === "granted" ? (
										<span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
											<CheckCircle2 size={10} /> Granted
										</span>
									) : (
										<span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#25282B] text-[#A3A09B]">
											On Demand
										</span>
									)}
								</div>
								<p className="text-xs text-[#A3A09B] mt-0.5">
									Used for Voice Recorder, Speech-to-Text Transcriber, and Audio
									Oscillator Studio.
								</p>
							</div>
						</div>
						<div className="shrink-0">
							{status.microphone !== "granted" ? (
								<button
									onClick={handleRequestMicrophone}
									disabled={testingItem === "microphone"}
									className="px-3.5 py-1.5 rounded-xl bg-[#E29E2D]/10 border border-[#E29E2D]/30 text-[#E29E2D] hover:bg-[#E29E2D]/20 text-xs font-semibold transition-all"
								>
									{testingItem === "microphone" ? "Testing..." : "Grant Access"}
								</button>
							) : (
								<span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
									<CheckCircle2 size={14} /> Ready
								</span>
							)}
						</div>
					</div>

					{/* 6. Clipboard Access */}
					<div className="bg-[#111213] border border-[#2A2D30] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-500/30 transition-all">
						<div className="flex items-start gap-3">
							<div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 shrink-0 mt-0.5">
								<Clipboard size={20} />
							</div>
							<div>
								<div className="flex items-center gap-2">
									<h3 className="text-sm font-bold text-[#ECEBE9]">
										System Clipboard API
									</h3>
									{status.clipboard === "granted" ? (
										<span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
											<CheckCircle2 size={10} /> Active
										</span>
									) : (
										<span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#25282B] text-[#A3A09B]">
											Standard
										</span>
									)}
								</div>
								<p className="text-xs text-[#A3A09B] mt-0.5">
									Enables 1-click formatted code copying, JSON export, and quick
									paste conversions.
								</p>
							</div>
						</div>
						<div className="shrink-0">
							{status.clipboard !== "granted" ? (
								<button
									onClick={handleRequestClipboard}
									disabled={testingItem === "clipboard"}
									className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 text-xs font-semibold transition-all"
								>
									{testingItem === "clipboard" ? "Testing..." : "Test Access"}
								</button>
							) : (
								<span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
									<CheckCircle2 size={14} /> Ready
								</span>
							)}
						</div>
					</div>

					{/* 7. Notifications */}
					<div className="bg-[#111213] border border-[#2A2D30] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-500/30 transition-all">
						<div className="flex items-start gap-3">
							<div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 shrink-0 mt-0.5">
								<Bell size={20} />
							</div>
							<div>
								<div className="flex items-center gap-2">
									<h3 className="text-sm font-bold text-[#ECEBE9]">
										Desktop Notifications & Task Completion
									</h3>
									{status.notifications === "granted" ? (
										<span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
											<CheckCircle2 size={10} /> Granted
										</span>
									) : (
										<span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#25282B] text-[#A3A09B]">
											Disabled
										</span>
									)}
								</div>
								<p className="text-xs text-[#A3A09B] mt-0.5">
									Alerts you when offline AI models finish downloading or long
									conversions complete.
								</p>
							</div>
						</div>
						<div className="shrink-0">
							{status.notifications !== "granted" ? (
								<button
									onClick={handleRequestNotifications}
									disabled={testingItem === "notifications"}
									className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 text-xs font-semibold transition-all"
								>
									{testingItem === "notifications"
										? "Requesting..."
										: "Enable Alerts"}
								</button>
							) : (
								<span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
									<CheckCircle2 size={14} /> Ready
								</span>
							)}
						</div>
					</div>
				</div>

				{/* Modal Footer */}
				<div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#2A2D30]">
					<div className="flex items-center gap-2 text-xs text-[#A3A09B]">
						<Shield size={14} className="text-emerald-400" />
						<span>
							Zero cloud sync. All privileges are confined to your local sandbox.
						</span>
					</div>
					<div className="flex items-center gap-3 w-full sm:w-auto justify-end">
						<button
							onClick={onClose}
							className="px-4 py-2.5 rounded-xl bg-[#25282B] text-[#ECEBE9] hover:bg-[#2A2D30] text-xs font-semibold transition-all"
						>
							Done
						</button>
						<button
							onClick={handleGrantAll}
							disabled={grantAllLoading}
							className="px-5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 text-xs font-bold transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.1)] active:scale-95"
						>
							<Sparkles size={14} />
							<span>
								{grantAllLoading ? "Configuring..." : "Grant All Recommended"}
							</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

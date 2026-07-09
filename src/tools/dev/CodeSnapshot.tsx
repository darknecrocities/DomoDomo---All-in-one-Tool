import React, { useState, useRef, useEffect } from "react";
import { Camera, Code, Download, Info, Palette, Copy, CheckSquare, Square } from "lucide-react";
import * as htmlToImage from "html-to-image";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-markup-templating";
import "prismjs/components/prism-css";
import "prismjs/components/prism-css-extras";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-dart";
import "prismjs/components/prism-docker";
import "prismjs/components/prism-elixir";
import "prismjs/components/prism-erlang";
import "prismjs/components/prism-go";
import "prismjs/components/prism-graphql";
import "prismjs/components/prism-haskell";
import "prismjs/components/prism-java";
import "prismjs/components/prism-json";
import "prismjs/components/prism-kotlin";
import "prismjs/components/prism-less";
import "prismjs/components/prism-lua";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-objectivec";
import "prismjs/components/prism-perl";
import "prismjs/components/prism-php";
import "prismjs/components/prism-powershell";
import "prismjs/components/prism-python";
import "prismjs/components/prism-r";
import "prismjs/components/prism-ruby";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-sass";
import "prismjs/components/prism-scss";
import "prismjs/components/prism-scala";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-swift";
import "prismjs/components/prism-yaml";

const THEMES = [
	{ id: "transparent", name: "Transparent", class: "bg-transparent" },
	{
		id: "gradient-1",
		name: "Cosmic",
		class: "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500",
	},
	{
		id: "gradient-2",
		name: "Ocean",
		class: "bg-gradient-to-br from-teal-400 to-blue-500",
	},
	{
		id: "gradient-3",
		name: "Sunset",
		class: "bg-gradient-to-br from-orange-400 to-rose-400",
	},
	{
		id: "gradient-4",
		name: "Emerald",
		class: "bg-gradient-to-br from-emerald-400 to-cyan-400",
	},
	{ id: "solid-1", name: "Dark Slate", class: "bg-slate-800" },
	{ id: "solid-2", name: "Pitch Black", class: "bg-black" },
];

const LANGUAGES = [
	{ id: "bash", name: "Bash" },
	{ id: "c", name: "C" },
	{ id: "cpp", name: "C++" },
	{ id: "csharp", name: "C#" },
	{ id: "css", name: "CSS" },
	{ id: "dart", name: "Dart" },
	{ id: "docker", name: "Docker" },
	{ id: "elixir", name: "Elixir" },
	{ id: "erlang", name: "Erlang" },
	{ id: "go", name: "Go" },
	{ id: "graphql", name: "GraphQL" },
	{ id: "haskell", name: "Haskell" },
	{ id: "html", name: "HTML" },
	{ id: "java", name: "Java" },
	{ id: "javascript", name: "JavaScript" },
	{ id: "json", name: "JSON" },
	{ id: "jsx", name: "JSX" },
	{ id: "kotlin", name: "Kotlin" },
	{ id: "less", name: "LESS" },
	{ id: "lua", name: "Lua" },
	{ id: "markdown", name: "Markdown" },
	{ id: "objectivec", name: "Objective-C" },
	{ id: "perl", name: "Perl" },
	{ id: "php", name: "PHP" },
	{ id: "powershell", name: "PowerShell" },
	{ id: "python", name: "Python" },
	{ id: "r", name: "R" },
	{ id: "ruby", name: "Ruby" },
	{ id: "rust", name: "Rust" },
	{ id: "sass", name: "SASS" },
	{ id: "scala", name: "Scala" },
	{ id: "scss", name: "SCSS" },
	{ id: "sql", name: "SQL" },
	{ id: "swift", name: "Swift" },
	{ id: "tsx", name: "TSX" },
	{ id: "typescript", name: "TypeScript" },
	{ id: "yaml", name: "YAML" },
];

export const CodeSnapshotTool = () => {
	const [code, setCode] = useState(
		"function greet(name) {\n  console.log(`Hello, ${name}!`);\n}\n\ngreet('Developer');",
	);
	const [language, setLanguage] = useState("javascript");
	const [theme, setTheme] = useState(THEMES[1]);
	const [padding, setPadding] = useState("p-12");
	const [exporting, setExporting] = useState(false);
	const [copying, setCopying] = useState(false);
	const [title, setTitle] = useState("");
	const [showLineNumbers, setShowLineNumbers] = useState(true);
	const [startLine, setStartLine] = useState(1);
	const [scrollTop, setScrollTop] = useState(0);

	const previewRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		Prism.highlightAll();
	}, [code, language]);

	const handleExport = async () => {
		if (!previewRef.current) return;

		setExporting(true);
		try {
			const dataUrl = await htmlToImage.toPng(previewRef.current, {
				quality: 1,
				pixelRatio: 2, // High-res
			});

			const link = document.createElement("a");
			link.download = `code-snapshot-${Date.now()}.png`;
			link.href = dataUrl;
			link.click();
		} catch (err) {
			console.error("Failed to export image", err);
			alert("Failed to generate snapshot. See console for details.");
		} finally {
			setExporting(false);
		}
	};

	const handleCopy = async () => {
		if (!previewRef.current) return;

		setExporting(true);
		try {
			const blob = await htmlToImage.toBlob(previewRef.current, {
				quality: 1,
				pixelRatio: 2,
			});
			if (blob) {
				await navigator.clipboard.write([
					new ClipboardItem({ "image/png": blob }),
				]);
				setCopying(true);
			}
		} catch (err) {
			console.error("Failed to copy image", err);
			alert("Failed to copy image. See console for details.");
		} finally {
			setExporting(false);
			setTimeout(() => setCopying(false), 2000);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Tab") {
			e.preventDefault();
			const target = e.currentTarget;
			const start = target.selectionStart;
			const end = target.selectionEnd;
			const newCode = code.substring(0, start) + "  " + code.substring(end);
			setCode(newCode);
			// Wait for React to update the state, then set cursor position
			setTimeout(() => {
				target.selectionStart = target.selectionEnd = start + 2;
			}, 0);
		}
	};

	return (
		<div className="max-w-6xl mx-auto glass-card p-6 flex flex-col gap-6 text-left">
			<div className="flex items-center gap-2 border-b border-slate-800 pb-3">
				<Camera size={18} className="text-teal-400" />
				<div>
					<h3 className="font-bold text-teal-400 text-sm">Code Snapshot</h3>
					<p className="text-[10px] text-slate-500">
						Generate beautiful, high-res screenshots of your code snippets
						instantly.
					</p>
				</div>
				<span className="ml-auto text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
					Design
				</span>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
				<div className="lg:col-span-4 flex flex-col gap-5 border-r border-slate-800/80 pr-0 lg:pr-6">
					<div className="flex flex-col gap-1.5">
						<label className="text-[10px] text-slate-500 uppercase font-semibold">
							Language Syntax
						</label>
						<select
							value={language}
							onChange={(e) => setLanguage(e.target.value)}
							className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 outline-none focus:border-teal-500"
						>
							{LANGUAGES.map((lang) => (
								<option key={lang.id} value={lang.id}>
									{lang.name}
								</option>
							))}
						</select>
					</div>

					<div className="flex flex-col gap-1.5">
						<label className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1.5">
							<Code size={11} /> Source Code
						</label>
						<div className="relative flex rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-inner h-64 focus-within:border-teal-500/50">
							{showLineNumbers && (
								<div className="bg-slate-950/50 border-r border-slate-800 text-slate-500/50 text-[12px] font-mono py-3 px-3 text-right select-none overflow-hidden min-w-[2.5rem]">
									<div style={{ transform: `translateY(-${scrollTop}px)` }}>
										{Array.from(
											{ length: code.split("\n").length },
											(_, i) => startLine + i,
										).map((n) => (
											<div key={n} className="leading-[18px] h-[18px]">
												{n}
											</div>
										))}
									</div>
								</div>
							)}
							<textarea
								value={code}
								onChange={(e) => setCode(e.target.value)}
								onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
								onKeyDown={handleKeyDown}
								placeholder="Paste your code here..."
								className="bg-transparent py-3 px-4 text-[12px] font-mono h-full text-slate-200 resize-none w-full focus:outline-none flex-1 whitespace-pre leading-[18px]"
								spellCheck="false"
							/>
						</div>
					</div>

					<div className="flex flex-col gap-1.5">
						<label className="text-[10px] text-slate-500 uppercase font-semibold">
							Title
						</label>
						<input
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="e.g. index.tsx"
							className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 outline-none focus:border-teal-500"
						/>
					</div>

					<div className="flex items-center gap-4 py-1 border-b border-slate-800/80 pb-4">
						<div 
							className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none"
							onClick={() => setShowLineNumbers(!showLineNumbers)}
						>
							{showLineNumbers ? <CheckSquare size={16} className="text-teal-500" /> : <Square size={16} className="text-slate-500" />}
							Line Numbers
						</div>

						{showLineNumbers && (
							<div className="flex items-center gap-2 border-l border-slate-800 pl-4">
								<label className="text-[10px] text-slate-500 uppercase font-semibold">
									Start:
								</label>
								<input
									type="number"
									value={startLine}
									onChange={(e) => setStartLine(parseInt(e.target.value) || 1)}
									className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-2 py-1 outline-none focus:border-teal-500 w-16"
								/>
							</div>
						)}
					</div>

					<div className="flex flex-col gap-1.5">
						<label className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1.5">
							<Palette size={11} /> Background Theme
						</label>
						<div className="grid grid-cols-3 gap-2">
							{THEMES.map((t) => (
								<button
									key={t.id}
									onClick={() => setTheme(t)}
									className={`h-12 rounded-lg border-2 transition-all ${t.class} ${theme.id === t.id ? "border-white shadow-[0_0_10px_rgba(255,255,255,0.3)]" : "border-transparent hover:scale-105"}`}
									title={t.name}
								/>
							))}
						</div>
					</div>

					<div className="flex flex-col gap-1.5">
						<label className="text-[10px] text-slate-500 uppercase font-semibold">
							Padding
						</label>
						<select
							value={padding}
							onChange={(e) => setPadding(e.target.value)}
							className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 outline-none focus:border-teal-500"
						>
							<option value="p-8">Small (32px)</option>
							<option value="p-12">Medium (48px)</option>
							<option value="p-16">Large (64px)</option>
							<option value="p-24">Extra Large (96px)</option>
						</select>
					</div>

					<div className="flex gap-2 mt-2">
						<button
							onClick={handleExport}
							disabled={exporting || !code.trim()}
							className="flex-1 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs"
						>
							<Download size={14} />
							{exporting ? "Wait..." : "Download PNG"}
						</button>
						<button
							onClick={handleCopy}
							disabled={exporting || !code.trim()}
							className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs border border-slate-700"
						>
							<Copy size={14} />
							{copying ? "Copied!" : "Copy Image"}
						</button>
					</div>
				</div>

				<div className="lg:col-span-8 flex flex-col items-center justify-center bg-slate-950/30 rounded-xl border border-slate-800/50 overflow-hidden p-4 sm:p-8">
					{/* Capture Container */}
					<div
						ref={previewRef}
						className={`transition-all duration-300 ease-in-out ${theme.class} ${padding} flex items-center justify-center w-full max-w-[800px] shadow-2xl overflow-hidden relative`}
					>
						{/* The macOS Window */}
						<div className="w-full bg-[#1e1e1e] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden border border-white/10 flex flex-col text-left">
							{/* Window Header */}
							<div className="h-10 bg-[#1e1e1e] flex items-center px-4 gap-2 border-b border-white/5 relative">
								<div className="flex gap-1.5 z-10">
									<div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
									<div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
									<div className="w-3 h-3 rounded-full bg-[#27c93f]" />
								</div>
								<div className="absolute inset-0 flex items-center justify-center text-[10px] text-white/40 font-medium">
									{title.trim()
										? title
										: `snippet.${language === "javascript" ? "js" : language === "typescript" ? "ts" : language === "python" ? "py" : language === "html" ? "html" : language === "css" ? "css" : language === "bash" ? "sh" : language}`}
								</div>
							</div>

							{/* Window Content */}
							<div className="p-4 sm:p-6 overflow-hidden flex gap-4">
								{showLineNumbers && (
									<div className="flex flex-col text-[13px] sm:text-[14px] leading-relaxed text-slate-500/50 select-none text-right min-w-[1.5rem] font-mono mt-[1px]">
										{Array.from(
											{ length: code.split("\n").length },
											(_, i) => startLine + i,
										).map((n) => (
											<span key={n}>{n}</span>
										))}
									</div>
								)}
								<pre className="!m-0 !p-0 !bg-transparent text-[13px] sm:text-[14px] leading-relaxed overflow-x-auto w-full">
									<code className={`language-${language}`}>{code}</code>
								</pre>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="flex items-start gap-2 text-xs text-slate-300 bg-slate-900/60 p-4 rounded-lg border border-slate-800 shadow-inner mt-2">
				<Info size={14} className="text-teal-400 shrink-0 mt-0.5" />
				<span>
					Snapshots are rendered and exported entirely client-side without
					sending your code to any external servers.
				</span>
			</div>
		</div>
	);
};

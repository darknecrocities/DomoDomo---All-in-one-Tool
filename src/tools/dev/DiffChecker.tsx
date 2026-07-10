import { useState } from "react";
import { Columns, Eye, Trash2, Upload } from "lucide-react";
import * as mammoth from "mammoth";

// Dynamically load PDF.js script from a standard CDN
const loadPdfJs = (): Promise<any> => {
	return new Promise((resolve, reject) => {
		if ((window as any).pdfjsLib) {
			resolve((window as any).pdfjsLib);
			return;
		}
		const script = document.createElement("script");
		script.src =
			"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js";
		script.onload = () => {
			const pdfjsLib = (window as any).pdfjsLib;
			pdfjsLib.GlobalWorkerOptions.workerSrc =
				"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";
			resolve(pdfjsLib);
		};
		script.onerror = () => reject(new Error("Failed to load PDF.js engine"));
		document.body.appendChild(script);
	});
};

export const DiffCheckerTool = () => {
	const [originalText, setOriginalText] = useState(
		'const user = "Arron";\nconsole.log(user);\n\n// TODO: Fix background remover tool\nconst status = "pending";',
	);
	const [modifiedText, setModifiedText] = useState(
		'const user = "Arron Kian";\nconsole.log(user);\n\n// TODO: Fix background remover tool\n// Finished background remover fixes\nconst status = "resolved";',
	);
	const [originalFileName, setOriginalFileName] = useState("");
	const [modifiedFileName, setModifiedFileName] = useState("");
	const [viewMode, setViewMode] = useState<"split" | "inline">("split");

	const handleFileUpload = async (
		e: React.ChangeEvent<HTMLInputElement>,
		setter: React.Dispatch<React.SetStateAction<string>>,
		nameSetter: React.Dispatch<React.SetStateAction<string>>
	) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const supportedExtensions = [
			".txt", ".md", ".json", ".csv", ".xml", ".log",
			".js", ".ts", ".jsx", ".tsx", ".html", ".css",
			".sql", ".pdf", ".docx",
		];
		const fileExt = "." + file.name.split(".").pop()?.toLowerCase();

		if (!supportedExtensions.includes(fileExt)) {
			alert(`Unsupported file extension: ${fileExt}\n\nPlease upload a supported file type (e.g. .txt, .pdf, .docx, etc.).`);
			e.target.value = "";
			return;
		}

		nameSetter(file.name);

		if (file.name.toLowerCase().endsWith(".pdf")) {
			try {
				setter("Extracting PDF text...");
				const arrayBuffer = await file.arrayBuffer();
				const pdfjsLib = await loadPdfJs();
				const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
				const pdf = await loadingTask.promise;
				const pages = pdf.numPages;

				let parsedText = "";
				for (let i = 1; i <= pages; i++) {
					const page = await pdf.getPage(i);
					const textContent = await page.getTextContent();
					const pageText = textContent.items
						.map((item: any) => item.str)
						.join(" ")
						.replace(/\s+/g, " ")
						.trim();
					parsedText += `${pageText}\n`;
				}
				setter(parsedText.trim() || "No readable text found in PDF.");
			} catch (err) {
				console.error("Error parsing PDF:", err);
				setter(
					"Error parsing PDF file. It might be scanned images or secured.",
				);
			}
		} else if (file.name.toLowerCase().endsWith(".docx")) {
			try {
				setter("Extracting Word document text...");
				const arrayBuffer = await file.arrayBuffer();
				const result = await mammoth.extractRawText({ arrayBuffer });
				setter(result.value.trim() || "No readable text found in Document.");
			} catch (err) {
				console.error("Error parsing DOCX:", err);
				setter("Error parsing DOCX file.");
			}
		} else {
			// Normal text fallback
			const reader = new FileReader();
			reader.onload = (event) => {
				const result = event.target?.result;
				if (typeof result === "string") {
					setter(result);
				}
			};
			reader.readAsText(file);
		}

		e.target.value = "";
	};

	const computeDiff = () => {
		const origLines = originalText.split("\n");
		const modLines = modifiedText.split("\n");

		const maxLines = Math.max(origLines.length, modLines.length);
		const diffList: {
			origLineNum: number | null;
			modLineNum: number | null;
			origContent: string;
			modContent: string;
			type: "added" | "deleted" | "modified" | "unchanged";
		}[] = [];

		for (let i = 0; i < maxLines; i++) {
			const orig = origLines[i] !== undefined ? origLines[i] : null;
			const mod = modLines[i] !== undefined ? modLines[i] : null;

			if (orig === null && mod !== null) {
				diffList.push({
					origLineNum: null,
					modLineNum: i + 1,
					origContent: "",
					modContent: mod,
					type: "added",
				});
			} else if (orig !== null && mod === null) {
				diffList.push({
					origLineNum: i + 1,
					modLineNum: null,
					origContent: orig,
					modContent: "",
					type: "deleted",
				});
			} else if (orig !== mod) {
				diffList.push({
					origLineNum: i + 1,
					modLineNum: i + 1,
					origContent: orig || "",
					modContent: mod || "",
					type: "modified",
				});
			} else {
				diffList.push({
					origLineNum: i + 1,
					modLineNum: i + 1,
					origContent: orig || "",
					modContent: mod || "",
					type: "unchanged",
				});
			}
		}
		return diffList;
	};

	const diffs = computeDiff();

	return (
		<div className="flex flex-col gap-6 text-left">
			<div className="glass-card p-6 flex flex-col gap-5">
				<div className="flex flex-col border-b border-slate-800 pb-3 gap-2">
					<div className="flex items-center justify-between">
						<h3 className="text-teal-400 font-bold">Text Diff Checker</h3>
						<div className="flex p-0.5 bg-slate-900 border border-slate-800 rounded-lg text-xs">
							<button
								onClick={() => setViewMode("split")}
								className={`px-3 py-1 rounded-md font-semibold flex items-center gap-1.5 ${viewMode === "split" ? "bg-[#4E8E5E] text-white" : "text-slate-450 hover:text-slate-200"}`}
							>
								<Columns size={12} />
								<span>Side-by-Side</span>
							</button>
							<button
								onClick={() => setViewMode("inline")}
								className={`px-3 py-1 rounded-md font-semibold flex items-center gap-1.5 ${viewMode === "inline" ? "bg-[#4E8E5E] text-white" : "text-slate-450 hover:text-slate-200"}`}
							>
								<Eye size={12} />
								<span>Unified List</span>
							</button>
						</div>
					</div>
					<p className="text-[11px] text-slate-400 leading-relaxed">
						Compare text or upload files directly. Supported formats: <span className="text-slate-300 font-semibold">txt, md, json, csv, xml, log, js, ts, jsx, tsx, html, css, sql, pdf, docx</span>
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="flex flex-col gap-1">
						<div className="flex items-center justify-between mb-1">
							<div className="flex flex-col">
								<span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
									Original Text
								</span>
								{originalFileName && (
									<span className="text-xs text-teal-300 font-medium mt-0.5 truncate max-w-[200px]" title={originalFileName}>
										{originalFileName}
									</span>
								)}
							</div>
							<div className="flex items-center gap-2">
								<button 
									onClick={() => { setOriginalText(""); setOriginalFileName(""); }}
									className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-950/30 transition-colors flex items-center gap-1 text-xs font-semibold"
									title="Clear Original"
								>
									<Trash2 size={14} />
									<span className="hidden sm:inline">Clear</span>
								</button>
								<label className="cursor-pointer bg-emerald-950/20 hover:bg-emerald-900/40 text-emerald-400 border border-emerald-900/60 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-colors shadow-sm">
									<Upload size={14} />
									<span>Upload File</span>
									<input
										type="file"
										accept=".txt,.md,.json,.csv,.xml,.log,.js,.ts,.jsx,.tsx,.html,.css,.sql,.pdf,.docx"
										className="hidden"
										onChange={(e) => handleFileUpload(e, setOriginalText, setOriginalFileName)}
									/>
								</label>
							</div>
						</div>
						<textarea
							value={originalText}
							onChange={(e) => setOriginalText(e.target.value)}
							rows={6}
							className="bg-slate-950/20 border border-slate-850 rounded-2xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#4E8E5E] resize-none outline-none leading-relaxed"
							placeholder="Paste original source text here..."
						/>
					</div>
					<div className="flex flex-col gap-1">
						<div className="flex items-center justify-between mb-1">
							<div className="flex flex-col">
								<span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
									Modified Text
								</span>
								{modifiedFileName && (
									<span className="text-xs text-teal-300 font-medium mt-0.5 truncate max-w-[200px]" title={modifiedFileName}>
										{modifiedFileName}
									</span>
								)}
							</div>
							<div className="flex items-center gap-2">
								<button 
									onClick={() => { setModifiedText(""); setModifiedFileName(""); }}
									className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-950/30 transition-colors flex items-center gap-1 text-xs font-semibold"
									title="Clear Modified"
								>
									<Trash2 size={14} />
									<span className="hidden sm:inline">Clear</span>
								</button>
								<label className="cursor-pointer bg-emerald-950/20 hover:bg-emerald-900/40 text-emerald-400 border border-emerald-900/60 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-colors shadow-sm">
									<Upload size={14} />
									<span>Upload File</span>
									<input
										type="file"
										accept=".txt,.md,.json,.csv,.xml,.log,.js,.ts,.jsx,.tsx,.html,.css,.sql,.pdf,.docx"
										className="hidden"
										onChange={(e) => handleFileUpload(e, setModifiedText, setModifiedFileName)}
									/>
								</label>
							</div>
						</div>
						<textarea
							value={modifiedText}
							onChange={(e) => setModifiedText(e.target.value)}
							rows={6}
							className="bg-slate-950/20 border border-slate-850 rounded-2xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#4E8E5E] resize-none outline-none leading-relaxed"
							placeholder="Paste modified text here..."
						/>
					</div>
				</div>

				{/* Diff Output Workspace */}
				<div className="border border-slate-850 rounded-2xl bg-slate-950/40 overflow-hidden font-mono text-[11px] leading-relaxed p-4 max-h-[350px] overflow-y-auto">
					{viewMode === "split" ? (
						<div className="grid grid-cols-2 gap-4">
							<div className="flex flex-col gap-0.5 border-r border-slate-850/50 pr-2">
								{diffs.map((diff, idx) => (
									<div
										key={idx}
										className={`flex px-2 py-0.5 rounded ${
											diff.type === "deleted"
												? "bg-rose-950/45 text-rose-350 border-l-2 border-rose-500"
												: diff.type === "modified"
													? "bg-rose-950/30 text-rose-350 border-l-2 border-rose-500/50"
													: "text-slate-400"
										}`}
									>
										<span className="w-8 shrink-0 text-slate-600 select-none">
											{diff.origLineNum || ""}
										</span>
										<span className="break-all">{diff.origContent || " "}</span>
									</div>
								))}
							</div>
							<div className="flex flex-col gap-0.5">
								{diffs.map((diff, idx) => (
									<div
										key={idx}
										className={`flex px-2 py-0.5 rounded ${
											diff.type === "added"
												? "bg-emerald-950/40 text-emerald-350 border-l-2 border-emerald-500"
												: diff.type === "modified"
													? "bg-emerald-950/30 text-emerald-350 border-l-2 border-emerald-500/50"
													: "text-slate-400"
										}`}
									>
										<span className="w-8 shrink-0 text-slate-600 select-none">
											{diff.modLineNum || ""}
										</span>
										<span className="break-all">{diff.modContent || " "}</span>
									</div>
								))}
							</div>
						</div>
					) : (
						<div className="flex flex-col gap-0.5">
							{diffs.map((diff, idx) => {
								if (diff.type === "added") {
									return (
										<div
											key={idx}
											className="bg-emerald-950/40 text-emerald-350 px-3 py-0.5 rounded border-l-2 border-emerald-500 flex"
										>
											<span className="w-12 shrink-0 text-slate-600 select-none">
												+{diff.modLineNum}
											</span>
											<span className="break-all">{diff.modContent}</span>
										</div>
									);
								}
								if (diff.type === "deleted") {
									return (
										<div
											key={idx}
											className="bg-rose-950/45 text-rose-350 px-3 py-0.5 rounded border-l-2 border-rose-500 flex"
										>
											<span className="w-12 shrink-0 text-slate-600 select-none">
												-{diff.origLineNum}
											</span>
											<span className="break-all">{diff.origContent}</span>
										</div>
									);
								}
								if (diff.type === "modified") {
									return (
										<div key={idx} className="flex flex-col gap-0.5">
											<div className="bg-rose-950/30 text-rose-400/80 px-3 py-0.5 rounded border-l-2 border-rose-500/50 flex">
												<span className="w-12 shrink-0 text-slate-600 select-none">
													-{diff.origLineNum}
												</span>
												<span className="break-all">{diff.origContent}</span>
											</div>
											<div className="bg-emerald-950/20 text-emerald-400/80 px-3 py-0.5 rounded border-l-2 border-emerald-500/50 flex">
												<span className="w-12 shrink-0 text-slate-600 select-none">
													+{diff.modLineNum}
												</span>
												<span className="break-all">{diff.modContent}</span>
											</div>
										</div>
									);
								}
								return (
									<div
										key={idx}
										className="px-3 py-0.5 rounded flex text-slate-450"
									>
										<span className="w-12 shrink-0 text-slate-600 select-none">
											{diff.modLineNum}
										</span>
										<span className="break-all">{diff.modContent}</span>
									</div>
								);
							})}
						</div>
					)}
				</div>

				<button
					onClick={() => {
						setOriginalText("");
						setModifiedText("");
					}}
					className="btn-secondary self-end text-xs flex items-center gap-1.5"
				>
					<Trash2 size={13} />
					<span>Clear Panels</span>
				</button>
			</div>
		</div>
	);
};

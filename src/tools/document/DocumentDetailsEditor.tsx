import { useState, useRef } from "react";
import {
	Upload,
	Trash2,
	X,
	FileText,
	Download,
	Edit,
} from "lucide-react";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";

interface FileDetail {
	id: string;
	file: File;
	type: "pdf" | "office" | "unknown";
	name: string;
	metadata: {
		title?: string;
		author?: string;
		subject?: string;
		creator?: string;
		producer?: string;
		lastModifiedBy?: string; // specific to office
		keywords?: string;
	};
	isSelected: boolean;
	status: "pending" | "success" | "error";
}

export const DocumentDetailsEditorTool = () => {
	const [files, setFiles] = useState<FileDetail[]>([]);
	const [isProcessing, setIsProcessing] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Batch states
	const [batchAuthor, setBatchAuthor] = useState("");
	const [batchTitle, setBatchTitle] = useState("");
	const [batchSubject, setBatchSubject] = useState("");

	const parsePDF = async (file: File): Promise<FileDetail["metadata"]> => {
		const arrayBuffer = await file.arrayBuffer();
		const pdfDoc = await PDFDocument.load(arrayBuffer);
		return {
			title: pdfDoc.getTitle() || "",
			author: pdfDoc.getAuthor() || "",
			subject: pdfDoc.getSubject() || "",
			creator: pdfDoc.getCreator() || "",
			producer: pdfDoc.getProducer() || "",
			keywords: pdfDoc.getKeywords() || "",
		};
	};

	const parseOffice = async (file: File): Promise<FileDetail["metadata"]> => {
		const arrayBuffer = await file.arrayBuffer();
		const zip = await JSZip.loadAsync(arrayBuffer);
		const coreXmlFile = zip.file("docProps/core.xml");

		if (!coreXmlFile) {
			return {};
		}

		const xmlText = await coreXmlFile.async("text");
		const parser = new DOMParser();
		const xmlDoc = parser.parseFromString(xmlText, "text/xml");

		const getTagContent = (tagName: string) => {
			const el =
				xmlDoc.getElementsByTagNameNS("*", tagName)[0] ||
				xmlDoc.getElementsByTagName(tagName)[0] ||
				xmlDoc.getElementsByTagName("dc:" + tagName)[0] ||
				xmlDoc.getElementsByTagName("cp:" + tagName)[0];
			return el ? el.textContent || "" : "";
		};

		return {
			title: getTagContent("title"),
			author: getTagContent("creator"),
			subject: getTagContent("subject"),
			lastModifiedBy: getTagContent("lastModifiedBy"),
			keywords: getTagContent("keywords"),
		};
	};

	const handleFileUpload = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const uploadedFiles = Array.from(event.target.files || []);
		if (!uploadedFiles.length) return;

		setIsProcessing(true);
		const newFileDetails: FileDetail[] = [];

		for (const file of uploadedFiles) {
			const ext = file.name.split(".").pop()?.toLowerCase();

			if (!["pdf", "docx", "xlsx", "pptx"].includes(ext || "")) {
				alert(`File type not supported: ${file.name}`);
				continue;
			}

			const id = Math.random().toString(36).substring(7);

			let type: "pdf" | "office" | "unknown" = "unknown";
			let metadata: FileDetail["metadata"] = {};

			try {
				if (ext === "pdf") {
					type = "pdf";
					metadata = await parsePDF(file);
				} else if (["docx", "xlsx", "pptx"].includes(ext || "")) {
					type = "office";
					metadata = await parseOffice(file);
				}

				newFileDetails.push({
					id,
					file,
					type,
					name: file.name,
					metadata,
					isSelected: true,
					status: "pending",
				});
			} catch (err) {
				console.error("Error parsing file:", err);
				newFileDetails.push({
					id,
					file,
					type,
					name: file.name,
					metadata: {},
					isSelected: true,
					status: "error",
				});
			}
		}

		setFiles((prev) => [...prev, ...newFileDetails]);
		setIsProcessing(false);
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	const removeFile = (id: string) => {
		setFiles((prev) => prev.filter((f) => f.id !== id));
	};

	const updateFileMetadata = (
		id: string,
		key: keyof FileDetail["metadata"],
		value: string,
	) => {
		setFiles((prev) =>
			prev.map((f) => {
				if (f.id === id) {
					return { ...f, metadata: { ...f.metadata, [key]: value } };
				}
				return f;
			}),
		);
	};

	const toggleSelect = (id: string) => {
		setFiles((prev) =>
			prev.map((f) => (f.id === id ? { ...f, isSelected: !f.isSelected } : f)),
		);
	};

	const toggleSelectAll = () => {
		const allSelected = files.every((f) => f.isSelected);
		setFiles((prev) => prev.map((f) => ({ ...f, isSelected: !allSelected })));
	};

	const applyBatch = () => {
		setFiles((prev) =>
			prev.map((f) => {
				if (!f.isSelected) return f;
				const newMeta = { ...f.metadata };
				if (batchAuthor) newMeta.author = batchAuthor;
				if (batchTitle) newMeta.title = batchTitle;
				if (batchSubject) newMeta.subject = batchSubject;
				return { ...f, metadata: newMeta };
			}),
		);
	};

	const scrubAll = () => {
		setFiles((prev) =>
			prev.map((f) => {
				if (!f.isSelected) return f;
				return {
					...f,
					metadata: {
						title: "",
						author: "",
						subject: "",
						creator: "",
						producer: "",
						lastModifiedBy: "",
						keywords: "",
					},
				};
			}),
		);
	};

	const savePDF = async (detail: FileDetail) => {
		const arrayBuffer = await detail.file.arrayBuffer();
		const pdfDoc = await PDFDocument.load(arrayBuffer);

		pdfDoc.setTitle(detail.metadata.title || "");
		pdfDoc.setAuthor(detail.metadata.author || "");
		pdfDoc.setSubject(detail.metadata.subject || "");
		pdfDoc.setCreator(detail.metadata.creator || "");
		pdfDoc.setProducer(detail.metadata.producer || "");
		pdfDoc.setKeywords(
			(detail.metadata.keywords || "").split(",").map((s) => s.trim()),
		);

		const pdfBytes = await pdfDoc.save();
		return new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
	};

	const saveOffice = async (detail: FileDetail) => {
		const arrayBuffer = await detail.file.arrayBuffer();
		const zip = await JSZip.loadAsync(arrayBuffer);
		const coreXmlFile = zip.file("docProps/core.xml");

		if (coreXmlFile) {
			const xmlText = await coreXmlFile.async("text");
			const parser = new DOMParser();
			const xmlDoc = parser.parseFromString(xmlText, "text/xml");

			const setOrRemoveTag = (
				tagName: string,
				value: string,
				namespaceUri?: string,
				namespacePrefix?: string,
			) => {
				let el =
					xmlDoc.getElementsByTagNameNS("*", tagName)[0] ||
					xmlDoc.getElementsByTagName(tagName)[0] ||
					xmlDoc.getElementsByTagName(namespacePrefix + ":" + tagName)[0];

				if (!el && value) {
					// If element doesn't exist and we want to set a value, create it
					// Note: Full robust XML namespace handling is complex, this is simplified
					const coreProps = xmlDoc.documentElement;
					if (namespaceUri) {
						el = xmlDoc.createElementNS(
							namespaceUri,
							namespacePrefix ? `${namespacePrefix}:${tagName}` : tagName,
						);
					} else {
						el = xmlDoc.createElement(tagName);
					}
					coreProps.appendChild(el);
				}

				if (el) {
					if (!value) {
						el.parentNode?.removeChild(el);
					} else {
						el.textContent = value;
					}
				}
			};

			// Office core namespaces
			const dcNs = "http://purl.org/dc/elements/1.1/";
			const cpNs =
				"http://schemas.openxmlformats.org/package/2006/metadata/core-properties";

			setOrRemoveTag("title", detail.metadata.title || "", dcNs, "dc");
			setOrRemoveTag("creator", detail.metadata.author || "", dcNs, "dc");
			setOrRemoveTag("subject", detail.metadata.subject || "", dcNs, "dc");
			setOrRemoveTag(
				"lastModifiedBy",
				detail.metadata.lastModifiedBy || "",
				cpNs,
				"cp",
			);
			setOrRemoveTag("keywords", detail.metadata.keywords || "", cpNs, "cp");

			const serializer = new XMLSerializer();
			const newXmlText = serializer.serializeToString(xmlDoc);
			zip.file("docProps/core.xml", newXmlText);
		}

		return await zip.generateAsync({ type: "blob" });
	};

	const handleDownload = async (detail: FileDetail) => {
		try {
			let blob: Blob | null = null;
			if (detail.type === "pdf") {
				blob = await savePDF(detail);
			} else if (detail.type === "office") {
				blob = await saveOffice(detail);
			}

			if (blob) {
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				// add _cleaned to filename
				const parts = detail.name.split(".");
				const ext = parts.pop();
				a.download = `${parts.join(".")}_cleaned.${ext}`;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
			}
		} catch (e) {
			console.error("Failed to download", e);
			alert("Failed to process file.");
		}
	};

	const handleDownloadAll = async () => {
		const selectedFiles = files.filter((f) => f.isSelected);
		if (selectedFiles.length === 0) return;
		setIsProcessing(true);

		try {
			const zip = new JSZip();
			for (const file of selectedFiles) {
				if (file.type === "pdf") {
					const blob = await savePDF(file);
					zip.file(file.name, blob);
				} else if (file.type === "office") {
					const blob = await saveOffice(file);
					zip.file(file.name, blob);
				}
			}
			const content = await zip.generateAsync({ type: "blob" });
			const url = URL.createObjectURL(content);
			const a = document.createElement("a");
			a.href = url;
			a.download = "cleaned_documents.zip";
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch (e) {
			console.error("Download all failed", e);
			alert("Failed to zip files.");
		}

		setIsProcessing(false);
	};

	return (
		<div className="w-full h-full flex flex-col gap-6 text-slate-200">
			<div className="flex flex-col gap-2">
				<h2 className="text-2xl font-bold text-teal-400">
					Document Details Editor
				</h2>
				<p className="text-sm text-slate-400">
					Upload PDFs or Word/Excel/PowerPoint files to view, edit, or
					completely remove hidden details (like Author, Title, and Last saved
					by) before sharing them.
				</p>
			</div>

			{/* Upload Zone */}
			<div className="flex justify-center border-2 border-dashed border-slate-700 bg-slate-900/50 hover:bg-slate-800/50 transition-colors rounded-2xl p-8">
				<label className="cursor-pointer flex flex-col items-center gap-3">
					<Upload className="text-teal-500 w-10 h-10" />
					<span className="font-semibold text-slate-300">
						Click to upload files
					</span>
					<span className="text-xs text-slate-500">
						Supports .pdf, .docx, .xlsx, .pptx
					</span>
					<input
						type="file"
						multiple
						accept=".pdf,.docx,.xlsx,.pptx"
						className="hidden"
						ref={fileInputRef}
						onChange={handleFileUpload}
					/>
				</label>
			</div>

			{files.length > 0 && (
				<div className="flex flex-col gap-6">
					{/* Multi-Edit (Batch) Section */}
					<div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-4">
						<h3 className="text-sm font-bold text-slate-300">
							Batch Apply Details
						</h3>
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
							<div className="flex flex-col gap-1">
								<label className="text-xs text-slate-400 font-medium">
									Author
								</label>
								<input
									type="text"
									value={batchAuthor}
									onChange={(e) => setBatchAuthor(e.target.value)}
									className="bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-sm outline-none focus:border-teal-500"
									placeholder="Set Author for all..."
								/>
							</div>
							<div className="flex flex-col gap-1">
								<label className="text-xs text-slate-400 font-medium">
									Title
								</label>
								<input
									type="text"
									value={batchTitle}
									onChange={(e) => setBatchTitle(e.target.value)}
									className="bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-sm outline-none focus:border-teal-500"
									placeholder="Set Title for all..."
								/>
							</div>
							<div className="flex flex-col gap-1">
								<label className="text-xs text-slate-400 font-medium">
									Subject
								</label>
								<input
									type="text"
									value={batchSubject}
									onChange={(e) => setBatchSubject(e.target.value)}
									className="bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-sm outline-none focus:border-teal-500"
									placeholder="Set Subject for all..."
								/>
							</div>
						</div>
						<div className="flex gap-3 mt-2">
							<button
								onClick={applyBatch}
								className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
							>
								<Edit size={16} /> Apply to All
							</button>
							<button
								onClick={scrubAll}
								className="bg-rose-900/60 hover:bg-rose-800/80 text-rose-300 border border-rose-800 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
							>
								<Trash2 size={16} /> Remove All Personal Info
							</button>
						</div>
					</div>

					{/* Files List */}
					<div className="flex flex-col gap-3">
						<div className="flex justify-between items-end">
							<h3 className="text-sm font-bold text-slate-300">
								Uploaded Files ({files.length})
							</h3>
							<div className="flex gap-2">
								<button
									onClick={toggleSelectAll}
									className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
								>
									{files.length > 0 && files.every((f) => f.isSelected)
										? "Deselect All"
										: "Select All"}
								</button>
								<button
									onClick={handleDownloadAll}
									className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
									disabled={isProcessing || !files.some((f) => f.isSelected)}
								>
									<Download size={16} /> Download Selected as ZIP
								</button>
							</div>
						</div>

						<div className="flex flex-col gap-4 overflow-y-auto max-h-[500px] pr-2">
							{files.map((file) => (
								<div
									key={file.id}
									className={`bg-slate-900/60 border ${file.isSelected ? "border-teal-500/50" : "border-slate-800"} rounded-xl p-4 flex flex-col gap-4 transition-colors`}
								>
									<div className="flex justify-between items-center border-b border-slate-800 pb-2">
										<div className="flex items-center gap-3">
											<input
												type="checkbox"
												checked={file.isSelected}
												onChange={() => toggleSelect(file.id)}
												className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-teal-500 focus:ring-teal-500 focus:ring-offset-slate-900 accent-teal-500 cursor-pointer transition-transform hover:scale-110"
											/>
											<FileText
												className={
													file.type === "pdf"
														? "text-rose-500"
														: "text-blue-500"
												}
											/>
											<span className="font-semibold text-sm truncate max-w-[200px] sm:max-w-md">
												{file.name}
											</span>
											<span className="text-[10px] uppercase font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
												{file.type}
											</span>
										</div>
										<div className="flex gap-2">
											<button
												onClick={() => handleDownload(file)}
												className="text-teal-400 hover:bg-teal-950 p-1.5 rounded-md transition-colors"
												title="Download Cleaned"
											>
												<Download size={16} />
											</button>
											<button
												onClick={() => removeFile(file.id)}
												className="text-rose-400 hover:bg-rose-950 p-1.5 rounded-md transition-colors"
												title="Remove"
											>
												<X size={16} />
											</button>
										</div>
									</div>

									{file.status === "error" ? (
										<div className="text-rose-400 text-sm">
											Failed to parse document details.
										</div>
									) : (
										<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
											<div className="flex flex-col gap-1">
												<label className="text-[10px] text-slate-500 font-bold uppercase">
													Title
												</label>
												<input
													type="text"
													value={file.metadata.title || ""}
													onChange={(e) =>
														updateFileMetadata(file.id, "title", e.target.value)
													}
													className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 outline-none focus:border-teal-500"
												/>
											</div>
											<div className="flex flex-col gap-1">
												<label className="text-[10px] text-slate-500 font-bold uppercase">
													Author
												</label>
												<input
													type="text"
													value={file.metadata.author || ""}
													onChange={(e) =>
														updateFileMetadata(
															file.id,
															"author",
															e.target.value,
														)
													}
													className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 outline-none focus:border-teal-500"
												/>
											</div>
											<div className="flex flex-col gap-1">
												<label className="text-[10px] text-slate-500 font-bold uppercase">
													Subject
												</label>
												<input
													type="text"
													value={file.metadata.subject || ""}
													onChange={(e) =>
														updateFileMetadata(
															file.id,
															"subject",
															e.target.value,
														)
													}
													className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 outline-none focus:border-teal-500"
												/>
											</div>
											{file.type === "pdf" && (
												<>
													<div className="flex flex-col gap-1">
														<label className="text-[10px] text-slate-500 font-bold uppercase">
															Creator
														</label>
														<input
															type="text"
															value={file.metadata.creator || ""}
															onChange={(e) =>
																updateFileMetadata(
																	file.id,
																	"creator",
																	e.target.value,
																)
															}
															className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 outline-none focus:border-teal-500"
														/>
													</div>
													<div className="flex flex-col gap-1">
														<label className="text-[10px] text-slate-500 font-bold uppercase">
															Producer
														</label>
														<input
															type="text"
															value={file.metadata.producer || ""}
															onChange={(e) =>
																updateFileMetadata(
																	file.id,
																	"producer",
																	e.target.value,
																)
															}
															className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 outline-none focus:border-teal-500"
														/>
													</div>
												</>
											)}
											{file.type === "office" && (
												<div className="flex flex-col gap-1">
													<label className="text-[10px] text-slate-500 font-bold uppercase">
														Last Saved By
													</label>
													<input
														type="text"
														value={file.metadata.lastModifiedBy || ""}
														onChange={(e) =>
															updateFileMetadata(
																file.id,
																"lastModifiedBy",
																e.target.value,
															)
														}
														className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 outline-none focus:border-teal-500"
													/>
												</div>
											)}
											<div className="flex flex-col gap-1">
												<label className="text-[10px] text-slate-500 font-bold uppercase">
													Keywords
												</label>
												<input
													type="text"
													value={file.metadata.keywords || ""}
													onChange={(e) =>
														updateFileMetadata(
															file.id,
															"keywords",
															e.target.value,
														)
													}
													className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 outline-none focus:border-teal-500"
												/>
											</div>
										</div>
									)}
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

import Papa from 'papaparse';
import JSZip from 'jszip';
import { triggerBlobDownload } from '../../../utils/sharedHelpers';

export const parseCSV = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (error) => reject(error)
    });
  });
};

export const generateBatchZIP = async (
  stageRef: any,
  dataList: any[],
  updateInputs: (inputs: Record<string, string>) => void,
  onProgress: (progress: number) => void
) => {
  const zip = new JSZip();
  const folder = zip.folder('batch_export');

  for (let i = 0; i < dataList.length; i++) {
    const row = dataList[i];
    
    // Convert CSV headers/keys to variables format e.g., 'name' -> '{{name}}' (or just match if keys are already matching)
    // Actually, we'll map the raw row data. The user inputs map expects keys matching `variableName`.
    // Let's assume the CSV header "Name" maps to variableName "{{Name}}".
    const inputs: Record<string, string> = {};
    Object.keys(row).forEach(key => {
      // Map 'Name' to '{{Name}}' and also 'Name' to 'Name' just in case
      inputs[`{{${key}}}`] = row[key];
      inputs[key] = row[key];
    });

    updateInputs(inputs);
    
    // Wait for render
    await new Promise(res => setTimeout(res, 50));

    const dataURL = stageRef.current.toDataURL({ mimeType: 'image/png', quality: 1 });
    const base64Data = dataURL.replace(/^data:image\/png;base64,/, "");
    
    // Name file based on the first column or index
    const firstVal = Object.values(row)[0] as string;
    const fileName = firstVal ? `${firstVal.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${i}.png` : `export_${i}.png`;
    
    folder?.file(fileName, base64Data, { base64: true });
    onProgress(Math.round(((i + 1) / dataList.length) * 100));
  }

  const content = await zip.generateAsync({ type: 'blob' });
  triggerBlobDownload(content, 'template_batch_export.zip');
};

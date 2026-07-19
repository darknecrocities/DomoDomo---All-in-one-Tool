import time
from fastapi import APIRouter, BackgroundTasks

router = APIRouter(prefix="/api/ocr", tags=["ocr"])

@router.post("")
async def run_ocr(image_name: str, background_tasks: BackgroundTasks):
    def process_ocr(img_name: str):
        time.sleep(3)
        print(f"Finished local OCR on: {img_name}")

    background_tasks.add_task(process_ocr, image_name)
    return {"status": "processing", "message": "OCR job added to local background queue"}

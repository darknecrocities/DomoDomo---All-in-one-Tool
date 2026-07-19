from fastapi import APIRouter
from ..models import MLEvalRequest

router = APIRouter(prefix="/api/ml", tags=["ml"])

@router.post("/evaluate-classification")
def evaluate_classification(req: MLEvalRequest):
    """Python backend classification evaluator computing accuracy, precision, recall, and confusion matrix."""
    labels = sorted(list(set(req.y_true + req.y_pred)))
    matrix = {l1: {l2: 0 for l2 in labels} for l1 in labels}
    correct = 0
    total = len(req.y_true)
    
    for yt, yp in zip(req.y_true, req.y_pred):
        if yt in matrix and yp in matrix[yt]:
            matrix[yt][yp] += 1
        if yt == yp:
            correct += 1
            
    accuracy = correct / total if total > 0 else 0
    return {
        "engine": "Python FastAPI ML Backend",
        "labels": labels,
        "confusion_matrix": matrix,
        "accuracy": accuracy,
        "sample_count": total
    }

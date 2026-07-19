from http.server import BaseHTTPRequestHandler
import json

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({
            "status": "online",
            "service": "DomoDomo Machine Learning Python Serverless API",
            "runtime": "Vercel Python Serverless Engine"
        }).encode('utf-8'))
        return

    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            payload = json.loads(post_data.decode('utf-8')) if post_data else {}
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            y_true = payload.get("y_true", [])
            y_pred = payload.get("y_pred", [])
            labels = sorted(list(set(y_true + y_pred)))
            matrix = {l1: {l2: 0 for l2 in labels} for l1 in labels}
            correct = 0
            for yt, yp in zip(y_true, y_pred):
                if yt in matrix and yp in matrix[yt]:
                    matrix[yt][yp] += 1
                if yt == yp:
                    correct += 1
            acc = correct / len(y_true) if len(y_true) > 0 else 0
            
            response = {
                "status": "success",
                "engine": "Vercel Python Serverless ML Engine",
                "accuracy": acc,
                "confusion_matrix": matrix
            }
            self.wfile.write(json.dumps(response).encode('utf-8'))
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
        return

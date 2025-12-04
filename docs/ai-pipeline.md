# AI Pipeline

1. **Model**: Quantized MobileBERT QA ONNX exported with dynamic axes.
2. **Runtime**: `onnxruntime-web` (WASM) executes entirely client-side.
3. **Tokenization**: Use a lightweight tokenizer (not included yet) to convert user utterances to ids.
4. **Fallback**: If the model fails or the user is offline, the app searches a curated FAQ dataset and returns matches.
5. **Recommendations**: Each FAQ entry maps to a service id to quickly navigate to the service detail page.

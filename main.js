let pyodide;
let pyReady = false;

async function initPyodide() {
    pyodide = await loadPyodide();

    // Load formatter.py
    const formatter = await fetch("formatter.py").then(r => r.text());
    pyodide.runPython(formatter);

    // Mark ready
    pyReady = true;

    // Enable the button when ready
    document.getElementById("formatBtn").disabled = false;
}

initPyodide();

document.getElementById("formatBtn").onclick = async () => {
    if (!pyReady) {
        alert("Pyodide is still loading. Please wait a moment…");
        return;
    }

    const inputEl = document.getElementById("input");
    const outputEl = document.getElementById("output");

    // Purify input
    const cleanInput = DOMPurify.sanitize(inputEl.value, {
        SAFE_FOR_JAVA_SCRIPT: true
    });

    try {
        // Safely transfer string → Python
        pyodide.runPython(`input_code = ${JSON.stringify(cleanInput)}`);

        // Now run formatter (guaranteed to exist)
        const formatted = pyodide.runPython("format_python(input_code)");

        outputEl.textContent = formatted;

        // Syntax highlight
        hljs.highlightElement(outputEl);

    } catch (err) {
        outputEl.textContent = "Error: " + err;
    }
};

// Copy button
document.getElementById("copyBtn").onclick = () => {
    const text = document.getElementById("output").textContent;
    navigator.clipboard.writeText(text);

    const btn = document.getElementById("copyBtn");
    btn.textContent = "Copied!";
    setTimeout(() => btn.textContent = "Copy", 1500);
};

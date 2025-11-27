function fixIndentation() {
            const input = document.getElementById('inputCode').value;
            const indentSize = parseInt(document.getElementById('indentSize').value);
            const output = document.getElementById('outputCode');
            const status = document.getElementById('statusMessage');

            if (!input.trim()) {
                showStatus('Please enter some Python code first.', 'warning');
                return;
            }

            try {
                const fixed = analyzeAndFixIndentation(input, indentSize);
                output.textContent = fixed.code;
                
                if (fixed.changes === 0) {
                    showStatus('✓ Code indentation is already correct!', 'success');
                } else {
                    showStatus(`✓ Fixed ${fixed.changes} line(s) with indentation issues.`, 'success');
                }
            } catch (error) {
                showStatus(`Error: ${error.message}`, 'error');
                output.textContent = 'Error processing code. Please check your input.';
            }
        }

        function analyzeAndFixIndentation(code, indentSize) {
            const lines = code.split('\n');
            const indentUnit = ' '.repeat(indentSize);
            const result = [];
            let currentIndentLevel = 0;
            let changes = 0;
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const trimmed = line.trim();
                
                // Empty lines
                if (!trimmed) {
                    result.push('');
                    continue;
                }
                
                // Calculate original indent
                const originalIndent = line.search(/\S/);
                
                // Check for top-level definitions (def, class) - these reset to level 0
                const topLevelKeywords = ['def ', 'class ', '@'];
                const isTopLevel = topLevelKeywords.some(kw => trimmed.startsWith(kw));
                
                if (isTopLevel) {
                    currentIndentLevel = 0;
                }
                
                // Check if this line should dedent (else, elif, except, finally)
                const dedentKeywords = ['else:', 'elif ', 'except:', 'except ', 'finally:'];
                const shouldDedent = dedentKeywords.some(kw => trimmed.startsWith(kw));
                
                if (shouldDedent && currentIndentLevel > 0 && !isTopLevel) {
                    currentIndentLevel--;
                }
                
                // Apply current indentation
                const expectedIndent = currentIndentLevel * indentSize;
                const fixedLine = indentUnit.repeat(currentIndentLevel) + trimmed;
                result.push(fixedLine);
                
                // Track changes
                if (originalIndent !== expectedIndent) {
                    changes++;
                }
                
                // Check if this line starts a new block (ends with :)
                if (trimmed.endsWith(':')) {
                    currentIndentLevel++;
                }
                
                // Check if we need to dedent for the NEXT line
                // This happens when we're NOT starting a block and the next line is at a lower logical level
                if (!trimmed.endsWith(':')) {
                    // Look at the next non-empty line
                    let j = i + 1;
                    while (j < lines.length && !lines[j].trim()) {
                        j++;
                    }
                    
                    if (j < lines.length) {
                        const nextTrimmed = lines[j].trim();
                        const nextOriginalIndent = lines[j].search(/\S/);
                        
                        // If next line is dedented in the original (and not a special keyword)
                        const nextIsDedentKeyword = dedentKeywords.some(kw => nextTrimmed.startsWith(kw));
                        
                        if (!nextIsDedentKeyword && nextOriginalIndent !== -1 && originalIndent !== -1) {
                            // If next line is less indented than current in original code
                            if (nextOriginalIndent < originalIndent && currentIndentLevel > 0) {
                                // Calculate how many levels to dedent
                                const indentDiff = originalIndent - nextOriginalIndent;
                                const levelsToDedent = Math.ceil(indentDiff / Math.max(indentSize, 1));
                                currentIndentLevel = Math.max(0, currentIndentLevel - levelsToDedent);
                            }
                        }
                    }
                }
            }
            
            return { code: result.join('\n'), changes };
        }

        function copyToClipboard() {
            const output = document.getElementById('outputCode').textContent;
            
            if (output === 'Fixed code will appear here...' || !output.trim()) {
                showStatus('No code to copy. Please fix some code first.', 'warning');
                return;
            }

            navigator.clipboard.writeText(output).then(() => {
                showStatus('✓ Code copied to clipboard!', 'success');
            }).catch(() => {
                showStatus('Failed to copy code. Please copy manually.', 'error');
            });
        }

        function showStatus(message, type) {
            const status = document.getElementById('statusMessage');
            status.textContent = message;
            status.className = `status ${type}`;
            status.classList.remove('hidden');

            if (type === 'success') {
                setTimeout(() => {
                    status.classList.add('hidden');
                }, 5000);
            }
        }

        // Example code for testing
        const exampleCode = `def greet(name):
print("Hello")
if name:
print(f"Welcome, {name}!")
else:
print("Welcome, stranger!")
for i in range(3):
print(i)
print("Loop done")
print("Function done")

def another_function():
print("Another one")
return True`;

        // Auto-fill example on load
        window.addEventListener('load', () => {
            document.getElementById('inputCode').value = exampleCode;
        });
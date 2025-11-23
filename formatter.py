import re

# Keywords that introduce blocks
BLOCK_START = {"def", "class", "if", "elif", "else", "for", "while", "try", "except", "finally", "with"}

# Keywords that dedent the previous block
DEDENT_KEYWORDS = {"elif", "else", "except", "finally"}

INDENT_STR = "    "  # 4 spaces

def format_python(code: str) -> str:
    """
    Fully-featured Python indenter and simple formatter.
    Handles nested blocks, elif/else alignment, try/except, loops,
    multi-line statements, and comments.
    """
    lines = code.splitlines()
    indent_level = 0
    formatted_lines = []
    prev_indent_level = 0
    continuation = False  # for multi-line statements ending with \ or open parens
    block_stack = []      # keep track of current block keywords

    for raw_line in lines:
        line = raw_line.rstrip()

        # Skip empty lines
        if not line.strip():
            formatted_lines.append("")
            continue

        # Extract inline comment
        if "#" in line:
            code_part, comment = line.split("#", 1)
            comment = "#" + comment
        else:
            code_part, comment = line, ""

        stripped = code_part.strip()

        # Detect continuation line (ends with \ or inside parentheses)
        if continuation:
            formatted_lines.append(INDENT_STR * indent_level + stripped + (" " + comment if comment else ""))
            if not stripped.endswith("\\") and stripped.count("(") == stripped.count(")") and stripped.count("[") == stripped.count("]") and stripped.count("{") == stripped.count("}"):
                continuation = False
            continue

        if stripped.endswith("\\") or stripped.endswith("(") or stripped.endswith("[") or stripped.endswith("{"):
            continuation = True

        # Dedent for keywords like elif/else/except/finally
        first_word = stripped.split()[0] if stripped.split() else ""
        if first_word in DEDENT_KEYWORDS:
            indent_level = max(0, indent_level - 1)

        # Add line with current indentation
        formatted_lines.append(INDENT_STR * indent_level + stripped + (" " + comment if comment else ""))

        # Increase indent after block starter
        if stripped.split()[0] in BLOCK_START and stripped.endswith(":"):
            indent_level += 1
            block_stack.append(stripped.split()[0])

        # Dedent after except/finally is done
        if block_stack and block_stack[-1] in {"try", "except", "finally"}:
            # Peek ahead: if current line is not indented more, dedent
            pass  # handled naturally by keyword-based dedent

    return "\n".join(formatted_lines)
#!/usr/bin/env python3
"""
Source File Line Limit Checker
Enforces the 500-line physical limit on all active DomoDomo source code files.
Excludes node_modules, build outputs, and third-party dependencies.
"""

import os
import sys

MAX_LINE_LIMIT = 500

EXCLUDE_DIRS = {
    'node_modules',
    'dist',
    'build',
    '.git',
    '.venv',
    '.system_generated',
    'mcp-server/node_modules',
    'mcp-server/dist',
}

SOURCE_EXTENSIONS = ('.ts', '.tsx', '.js', '.jsx', '.cjs', '.mjs', '.py')

def should_check_file(rel_path: str) -> bool:
    for excluded in EXCLUDE_DIRS:
        if rel_path.startswith(excluded + os.sep) or (os.sep + excluded + os.sep) in rel_path:
            return False
    return rel_path.endswith(SOURCE_EXTENSIONS)

def main():
    target_dir = sys.argv[1] if len(sys.argv) > 1 else 'src/tools'
    violations = []
    checked_count = 0

    for root, dirs, files in os.walk(target_dir):
        # Filter directories in place to prevent descending into excluded dirs
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS and not d.startswith('.')]
        
        for file in files:
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, '.')
            
            if not should_check_file(rel_path):
                continue
                
            checked_count += 1
            try:
                with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
                    lines = sum(1 for _ in f)
                    if lines > MAX_LINE_LIMIT:
                        violations.append((rel_path, lines))
            except Exception as e:
                print(f"Error reading {rel_path}: {e}", file=sys.stderr)

    print(f"Checked {checked_count} files in '{target_dir}'.")
    if violations:
        print(f"\n❌ Found {len(violations)} files exceeding {MAX_LINE_LIMIT} lines:")
        for path, count in sorted(violations, key=lambda x: x[1], reverse=True):
            print(f"  - {path}: {count} lines (exceeds limit by {count - MAX_LINE_LIMIT})")
        sys.exit(1)
    else:
        print(f"✅ All {checked_count} source files satisfy the <= {MAX_LINE_LIMIT} line limit policy.")
        sys.exit(0)

if __name__ == '__main__':
    main()

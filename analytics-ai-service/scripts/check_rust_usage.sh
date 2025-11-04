#!/bin/bash
# Quick script to check if Rust module is being used
# Can be run inside Docker container

echo "=== Rust Extension Module Verification ==="
echo ""

# Check 1: Module file location and type
echo "1. Checking module location..."
python3 -c "
import analytics_rust_core
import os
module_file = analytics_rust_core.__file__
print(f'   Module file: {module_file}')
print(f'   File exists: {os.path.exists(module_file)}')
print(f'   Is binary (.so/.pyd): {module_file.endswith((\".so\", \".pyd\", \".dylib\"))}')
"

# Check 2: List available functions
echo ""
echo "2. Available functions:"
python3 -c "
import analytics_rust_core
funcs = [name for name in dir(analytics_rust_core) if not name.startswith('_')]
for func in funcs:
    print(f'   - {func}')
"

# Check 3: Test function call
echo ""
echo "3. Testing function execution:"
python3 -c "
import analytics_rust_core
result = analytics_rust_core.clean_generation_result('```sql\nSELECT 1\n```')
print(f'   Test result: {repr(result)}')
print(f'   ✅ Function works: {result.strip() == \"SELECT 1\"}')
"

# Check 4: Verify import path
echo ""
echo "4. Module import path:"
python3 -c "
import analytics_rust_core
import sys
module_path = analytics_rust_core.__file__
for path in sys.path:
    if module_path.startswith(path):
        print(f'   Found in sys.path: {path}')
        break
"

echo ""
echo "=== Verification Complete ==="






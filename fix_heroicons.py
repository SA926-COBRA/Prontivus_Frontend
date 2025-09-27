#!/usr/bin/env python3
"""
Script to fix Heroicons import issues
"""

import os
import re

def fix_heroicons_imports():
    """Fix incorrect Heroicons imports in all files"""
    
    # Common incorrect imports and their correct replacements
    icon_replacements = {
        'RefreshIcon': 'ArrowPathIcon',
        'TargetIcon': 'AdjustmentsHorizontalIcon', 
        'TrendingUpIcon': 'ArrowTrendingUpIcon',
        'PillsIcon': 'BeakerIcon',
        'DownloadIcon': 'ArrowDownTrayIcon',
        'BrainIcon': 'CpuChipIcon',
        'PlayIcon': 'PlayIcon',  # This one might be correct
        'StopIcon': 'StopIcon'   # This one might be correct
    }
    
    # Find all TypeScript files in pages directory
    pages_dir = 'src/pages'
    tsx_files = []
    
    for root, dirs, files in os.walk(pages_dir):
        for file in files:
            if file.endswith('.tsx'):
                tsx_files.append(os.path.join(root, file))
    
    print(f"Found {len(tsx_files)} TypeScript files to check...")
    
    for file_path in tsx_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            changes_made = False
            
            # Fix imports
            for incorrect, correct in icon_replacements.items():
                if incorrect in content:
                    # Replace in import statements
                    import_pattern = rf'(\s+){incorrect}(\s*,|\s*$)'
                    replacement = rf'\1{correct}\2'
                    new_content = re.sub(import_pattern, replacement, content, flags=re.MULTILINE)
                    
                    if new_content != content:
                        content = new_content
                        changes_made = True
                        print(f"  Fixed import: {incorrect} -> {correct}")
                    
                    # Replace in JSX usage
                    jsx_pattern = rf'<{incorrect}(\s+[^>]*)?>'
                    jsx_replacement = rf'<{correct}\1>'
                    new_content = re.sub(jsx_pattern, jsx_replacement, content)
                    
                    if new_content != content:
                        content = new_content
                        changes_made = True
                        print(f"  Fixed JSX usage: {incorrect} -> {correct}")
            
            if changes_made:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"✅ Fixed {file_path}")
            else:
                print(f"✓ No issues found in {file_path}")
                
        except Exception as e:
            print(f"❌ Error processing {file_path}: {e}")
    
    print("\n🎉 Heroicons import fixes completed!")

if __name__ == "__main__":
    fix_heroicons_imports()

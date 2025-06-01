#!/bin/bash

# Tool Suite Standardization Script
# This script reorganizes all tools to follow the standard directory structure
# specified in TOOL_DEVELOPMENT_GUIDE.md

echo "🏗️  Starting Tool Suite Standardization..."

# Function to create standard docs structure for a tool
create_docs_structure() {
    local tool_name=$1
    local tool_path="src/tools/$tool_name"
    
    echo "📁 Creating docs structure for $tool_name..."
    
    # Create docs directory if it doesn't exist
    mkdir -p "$tool_path/docs"
    
    # If no docs exist, create placeholder files
    if [ ! -f "$tool_path/docs/specification.md" ]; then
        echo "📄 Creating specification.md for $tool_name..."
        cat > "$tool_path/docs/specification.md" << EOF
# $tool_name - Design Specification

## Overview

[Tool description and purpose]

## Features

### Core Functionality
- [List main features]

## Architecture

### Component Structure
\`\`\`
$tool_name/
├── ui.tsx              # Main React component
├── toolInfo.ts         # Tool metadata
├── lib.ts              # Core logic (if needed)
├── lib/                # Complex logic modules
├── types.ts            # TypeScript definitions
└── docs/               # Documentation
\`\`\`

## User Interface

[Describe the UI layout and components]

## Technical Implementation

[Implementation details]

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Status**: In Development
EOF
    fi
    
    if [ ! -f "$tool_path/docs/user-guide.md" ]; then
        echo "📄 Creating user-guide.md for $tool_name..."
        cat > "$tool_path/docs/user-guide.md" << EOF
# $tool_name - User Guide

## Quick Start

[Basic usage instructions]

## Features

[Detailed feature descriptions]

## Usage Examples

[Step-by-step examples]

## Best Practices

[Recommendations for optimal usage]

## Troubleshooting

[Common issues and solutions]

---

**Need Help?** Refer to the [API Reference](./api-reference.md) for technical details.
EOF
    fi
    
    if [ ! -f "$tool_path/docs/api-reference.md" ]; then
        echo "📄 Creating api-reference.md for $tool_name..."
        cat > "$tool_path/docs/api-reference.md" << EOF
# $tool_name - API Reference

## Types and Interfaces

[TypeScript type definitions]

## Core Functions

[Function signatures and descriptions]

## React Component API

[Component props and usage]

## Integration Examples

[Code examples for integration]

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Compatibility**: Modern browsers with ES2020+ support
EOF
    fi
}

# Function to move types.ts to root level if it exists in lib/
standardize_types() {
    local tool_name=$1
    local tool_path="src/tools/$tool_name"
    
    if [ -f "$tool_path/lib/types.ts" ] && [ ! -f "$tool_path/types.ts" ]; then
        echo "🔄 Moving types.ts to root level for $tool_name..."
        mv "$tool_path/lib/types.ts" "$tool_path/types.ts"
        
        # Update import paths in other files
        echo "🔧 Updating import paths for types in $tool_name..."
        find "$tool_path" -name "*.ts" -o -name "*.tsx" | xargs sed -i.bak 's|from.*lib/types|from "../types"|g'
        find "$tool_path" -name "*.bak" -delete
    fi
}

# Function to move specification files to docs/
move_specification_files() {
    local tool_name=$1
    local tool_path="src/tools/$tool_name"
    
    # Check for specification file in src/tools/ root
    if [ -f "src/tools/$tool_name-specification.md" ]; then
        echo "🔄 Moving specification file for $tool_name..."
        mkdir -p "$tool_path/docs"
        mv "src/tools/$tool_name-specification.md" "$tool_path/docs/specification.md"
    fi
}

# Function to create lib.ts if complex logic exists in lib/ but no lib.ts
create_lib_index() {
    local tool_name=$1
    local tool_path="src/tools/$tool_name"
    
    if [ -d "$tool_path/lib" ] && [ ! -f "$tool_path/lib.ts" ]; then
        echo "📄 Creating lib.ts index for $tool_name..."
        cat > "$tool_path/lib.ts" << EOF
/**
 * $tool_name Core Library
 * 
 * This file provides the main exports for the $tool_name tool.
 * Complex logic is organized in the lib/ directory.
 */

// Re-export main functionality from lib directory
export * from './lib/index'
EOF
    fi
}

# List of all tools to standardize
TOOLS=(
    "uuid-generator"
    "color-palette" 
    "emoji-library"
    "unit-converter"
    "unix-timestamp-converter"
    "programmer-calculator"
    "arxml-parser"
    "layout-demo"
    "markdown-editor"
    "product-chart-generator"
    "world-clock"
)

echo "🎯 Found ${#TOOLS[@]} tools to standardize"

# Process each tool
for tool in "${TOOLS[@]}"; do
    echo ""
    echo "🔧 Processing $tool..."
    
    tool_path="src/tools/$tool"
    
    # Check if tool directory exists
    if [ ! -d "$tool_path" ]; then
        echo "⚠️  Tool directory not found: $tool_path"
        continue
    fi
    
    # Standardize types.ts location
    standardize_types "$tool"
    
    # Move specification files
    move_specification_files "$tool"
    
    # Create lib.ts index if needed
    create_lib_index "$tool"
    
    # Create docs structure
    create_docs_structure "$tool"
    
    echo "✅ Completed standardization for $tool"
done

# Clean up any remaining specification files in src/tools/
echo ""
echo "🧹 Cleaning up remaining specification files..."
find src/tools/ -maxdepth 1 -name "*-specification.md" -delete

echo ""
echo "🎉 Tool Suite Standardization Complete!"
echo ""
echo "📊 Summary:"
echo "   - ${#TOOLS[@]} tools processed"
echo "   - Standard directory structure applied"
echo "   - Documentation templates created"
echo "   - Type definitions standardized"
echo ""
echo "📚 Next steps:"
echo "   1. Review and customize the generated documentation"
echo "   2. Update import paths if needed"
echo "   3. Test all tools to ensure functionality"
echo "   4. Commit the standardized structure" 
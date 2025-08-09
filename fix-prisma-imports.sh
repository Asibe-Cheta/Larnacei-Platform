#!/bin/bash

# Fix all prisma imports to use default export for consistency

# Find all files with named prisma imports and replace with default imports
find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "import { prisma } from" | while read file; do
    echo "Fixing imports in: $file"
    sed -i 's/import { prisma } from/import prisma from/g' "$file"
done

echo "All prisma imports fixed to use default export"

#!/bin/bash

# Fix all imports from @affiliate-template/ to local imports
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@affiliate-template/db|@/lib/db|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@affiliate-template/ai|@/lib/ai|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@affiliate-template/shared-types|@/lib/types|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@affiliate-template/ui|@/components/ui|g'

echo "Import fixes completed"
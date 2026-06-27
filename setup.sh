#!/usr/bin/env bash
set -e

echo "begin setup alam-hakeem"

cd /workspaces/mizan-app

# 1) backup
echo "[1/6] backup..."
BACKUP_DIR="_backup_mizan_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r app "$BACKUP_DIR/" 2>/dev/null || true
cp -r data "$BACKUP_DIR/" 2>/dev/null || true
cp -r theme "$BACKUP_DIR/" 2>/dev/null || true
echo "    backup at: $BACKUP_DIR"

# 2) delete old mizan screens
echo "[2/6] deleting old screens..."
rm -rf "app/(tabs)" 2>/dev/null || true
rm -f app/chat.js app/experts.js app/notifications.js app/privacy.js app/terms.js app/TurnstileWidget.js 2>/dev/null || true
echo "    done."

# 3) delete old data
echo "[3/6] deleting old data..."
rm -f data/axes.js 2>/dev/null || true
echo "    done."

# 4) create new structure
echo "[4/6] creating structure..."
mkdir -p app core/ai core/gamification core/reading config lib
echo "    done."

# 5) install youtube library
echo "[5/6] installing youtube lib..."
npx expo install react-native-youtube-iframe 2>&1 | tail -3
echo "    done."

# 6) report
echo "[6/6] report:"
echo "    === app/ ==="
ls -la app/ 2>/dev/null || echo "    (empty)"
echo "    === new folders ==="
ls -d core config lib 2>/dev/null
echo "setup complete. backup: $BACKUP_DIR"

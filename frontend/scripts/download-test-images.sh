#!/bin/bash

# Change to frontend directory
cd "$(dirname "$0")/.." || exit 1

echo "Downloading test images from Lorem Picsum..."
echo

# Create public directory if it doesn't exist
mkdir -p public

# Download avatar placeholder
echo "Downloading avatar placeholder..."
curl -L "https://picsum.photos/400/400?random=avatar" -o public/placeholder-avatar.jpg

# Download general tattoo placeholder
echo "Downloading general tattoo placeholder..."
curl -L "https://picsum.photos/800/800?random=tattoo" -o public/placeholder-tattoo.jpg

# Download portfolio placeholders (12 different images)
echo "Downloading portfolio placeholders..."
for i in {1..12}; do
  echo "Downloading placeholder-tattoo-$i.jpg..."
  curl -L "https://picsum.photos/600/600?random=$i" -o "public/placeholder-tattoo-$i.jpg"
done

echo
echo "✅ All images downloaded successfully!"

# Show file sizes to confirm download
echo
echo "Downloaded files:"
ls -lh public/placeholder-*.jpg
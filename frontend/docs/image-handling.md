# Image Handling in Paltattoo Frontend

## Overview
The application uses placeholder images from Lorem Picsum for testing and development. All images are properly handled with helper functions to ensure consistent display.

## Placeholder Images

### Downloaded Images
- **Avatar**: `/placeholder-avatar.jpg` (400x400px)
- **General Tattoo**: `/placeholder-tattoo.jpg` (800x800px)
- **Portfolio Images**: `/placeholder-tattoo-1.jpg` to `/placeholder-tattoo-12.jpg` (600x600px each)

### Download Script
To re-download or update placeholder images:
```bash
cd frontend
./scripts/download-test-images.sh
```

## Image Helper Functions

Located in `src/utils/imageHelpers.js`:

### `getImageUrl(imagePath)`
- Handles all image URL generation
- Returns full URL for backend images
- Preserves external URLs and placeholder paths

### `getProfileImageUrl(imagePath)`
- Specifically for profile/avatar images
- Returns placeholder avatar if no image provided

### `getTattooImageUrl(imagePath, index)`
- For tattoo/portfolio images
- Can return indexed placeholder based on position
- Falls back to general tattoo placeholder

### `getRandomPlaceholderTattoo()`
- Returns a random tattoo placeholder image
- Useful for generating varied mock data

## Usage Examples

```javascript
import { getProfileImageUrl, getTattooImageUrl } from '../../utils/imageHelpers';

// Profile image
<img src={getProfileImageUrl(artist.profileImage)} alt={artist.name} />

// Tattoo image with fallback
<img src={getTattooImageUrl(offer.referenceImage)} alt={offer.title} />

// Portfolio with indexed placeholders
{mockImages.map((image, i) => (
  <img src={getTattooImageUrl(image.url, i)} alt={image.title} />
))}
```

## Backend Integration
When real images are uploaded:
- Profile images: stored in `/uploads/profiles/`
- Portfolio images: stored in `/uploads/portfolio/`
- Reference images: stored in `/uploads/references/`

The helper functions automatically handle the URL construction for backend images.
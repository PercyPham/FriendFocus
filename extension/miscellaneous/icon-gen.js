// This script generates the icons for the extension.
// Run this in Chrome's DevTool for generation and downloading.

// SVG Code for the icon
// Copied from ./icon.svg
const svgData = `
<svg width="512" height="512" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .cls-bg { fill: #0866FF }
      .cls-fill { fill: #ffffff; }

      .cls-stroke { stroke: #ffffff; stroke-width: 10; stroke-linecap: round; }
    </style>
  </defs>

  <circle cx="100" cy="100" r="100" class="cls-bg" />

  <line x1="100" y1="100" x2="100" y2="35" class="cls-stroke" />
  <line x1="100" y1="100" x2="156.29" y2="132.5" class="cls-stroke" />
  <line x1="100" y1="100" x2="43.71" y2="132.5" class="cls-stroke" />

  <circle cx="100" cy="100" r="32" class="cls-fill" />
  
  <circle cx="100" cy="35" r="20" class="cls-fill" />
  <circle cx="156.29" cy="132.5" r="20" class="cls-fill" />
  <circle cx="43.71" cy="132.5" r="20" class="cls-fill" />
</svg>
`;

const sizes = [16, 32, 48, 128];

function downloadIcon(size) {
  const img = new Image();
  // Convert SVG string to base64
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  img.onload = function () {
    // Create a canvas to draw the image
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Draw image resized
    ctx.drawImage(img, 0, 0, size, size);

    // Convert to PNG data URL
    const pngUrl = canvas.toDataURL('image/png');

    // Trigger download
    const link = document.createElement('a');
    link.download = `icon-${size}.png`;
    link.href = pngUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup
    URL.revokeObjectURL(url);
    console.log(`Downloaded icon-${size}.png`);
  };

  img.src = url;
}

// Trigger all downloads
sizes.forEach((size) => downloadIcon(size));

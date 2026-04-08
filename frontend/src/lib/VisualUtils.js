/**
 * Utilities for Perceptual Hashing and Visual Comparison
 * Used to detect semantically similar images (same scene/point of view).
 */

/**
 * Generates an 8x8 Average Hash (aHash) for a file.
 * Returns a 64-character binary string.
 */
export const calculateVisualHash = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Step 1: Reduce size to 8x8
        canvas.width = 8;
        canvas.height = 8;
        ctx.drawImage(img, 0, 0, 8, 8);
        
        // Step 2: Get Grayscale data
        const imageData = ctx.getImageData(0, 0, 8, 8);
        const pixels = imageData.data;
        let totalBrightness = 0;
        const grayscaleData = [];
        
        for (let i = 0; i < pixels.length; i += 4) {
          const brightness = (pixels[i] * 0.299 + pixels[i+1] * 0.587 + pixels[i+2] * 0.114);
          grayscaleData.push(brightness);
          totalBrightness += brightness;
        }
        
        // Step 3: Calculate average brightness
        const average = totalBrightness / 64;
        
        // Step 4: Generate hash (1 if > avg, else 0)
        let hash = '';
        for (let i = 0; i < 64; i++) {
          hash += grayscaleData[i] >= average ? '1' : '0';
        }
        
        resolve(hash);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Calculates the Hamming Distance between two binary hashes.
 * Returns the number of differing bits.
 */
export const getHammingDistance = (hash1, hash2) => {
  if (!hash1 || !hash2 || hash1.length !== hash2.length) return 999;
  
  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) distance++;
  }
  return distance;
};

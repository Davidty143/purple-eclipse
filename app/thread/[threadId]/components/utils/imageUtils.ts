/**
 * Optimizes the images in HTML content by replacing img tags with enhanced versions
 * that include loading attributes, error handling, and click-to-expand functionality.
 */
export const optimizeImages = (content: string): string => {
  // Skip processing during SSR since DOMParser is only available in the browser
  if (typeof window === 'undefined') {
    return content;
  }

  // For rich text content with embedded HTML, we can't directly use Next.js Image component
  // so we'll optimize the img tags to improve user experience but keep the HTML structure
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  const images = doc.getElementsByTagName('img');

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const src = img.getAttribute('src');
    if (src) {
      // Handle both storage URLs and any other valid image URLs
      const optimizedImg = document.createElement('div');
      optimizedImg.className = 'relative w-full max-w-xl mx-auto my-4';
      optimizedImg.innerHTML = `
        <div class="image-container flex justify-center">
          <img 
            src="${src}" 
            alt="" 
            class="rounded-lg shadow-md object-contain max-w-full cursor-pointer"
            style="max-height: 350px; width: auto;"
            loading="lazy" 
            onError="this.onerror=null; this.style.display='none';"
            onclick="this.classList.toggle('expanded'); 
                    if(this.classList.contains('expanded')) {
                      this.style.maxHeight = '90vh'; 
                      this.style.width = 'auto';
                      this.parentElement.classList.add('fixed', 'inset-0', 'z-50', 'bg-black/80', 'flex', 'items-center', 'justify-center', 'p-4');
                    } else {
                      this.style.maxHeight = '350px';
                      this.style.width = 'auto';
                      this.parentElement.classList.remove('fixed', 'inset-0', 'z-50', 'bg-black/80', 'flex', 'items-center', 'justify-center', 'p-4');
                    }"
          />
        </div>
      `;
      img.parentNode?.replaceChild(optimizedImg, img);
    }
  }

  return doc.body.innerHTML;
};

export const VISION_SCRIPT = `
(function() {
  console.log("👁️ Aether Vision Bridge Initialized");

  let hoveredElement = null;
  let selectedElement = null;
  let overlay = null;
  let selectionBox = null;

  // Create Overlay for Hover
  function createOverlay() {
    overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.pointerEvents = 'none';
    overlay.style.border = '2px solid #06b6d4'; // Cyan
    overlay.style.backgroundColor = 'rgba(6, 182, 212, 0.1)';
    overlay.style.zIndex = '9999';
    overlay.style.transition = 'all 0.1s ease';
    overlay.style.display = 'none';
    overlay.style.borderRadius = '4px';
    
    // Label
    const label = document.createElement('span');
    label.style.position = 'absolute';
    label.style.top = '-20px';
    label.style.left = '0';
    label.style.backgroundColor = '#06b6d4';
    label.style.color = 'black';
    label.style.fontSize = '10px';
    label.style.padding = '2px 4px';
    label.style.borderRadius = '2px';
    label.style.fontWeight = 'bold';
    label.innerText = 'COMPONENT';
    overlay.appendChild(label);

    document.body.appendChild(overlay);
  }

  // Init
  if (document.body) {
      createOverlay();
  } else {
      window.addEventListener('DOMContentLoaded', createOverlay);
  }

  // Hover Handler
  document.addEventListener('mouseover', (e) => {
    e.stopPropagation();
    const target = e.target;
    
    // Ignore overlay itself and body/html
    if (target === overlay || target === document.body || target === document.documentElement) return;
    
    hoveredElement = target;
    
    const rect = target.getBoundingClientRect();
    
    overlay.style.display = 'block';
    overlay.style.top = rect.top + 'px';
    overlay.style.left = rect.left + 'px';
    overlay.style.width = rect.width + 'px';
    overlay.style.height = rect.height + 'px';
    
    // Update Label
    const tagName = target.tagName.toLowerCase();
    const classes = Array.from(target.classList).slice(0, 2).join('.');
    overlay.firstChild.innerText = tagName + (classes ? '.' + classes : '');
  });

  document.addEventListener('mouseout', (e) => {
     // overlay.style.display = 'none';
  });

  // Click Handler (Selection)
  document.addEventListener('click', (e) => {
    // Only intercept if holding Ctrl/Cmd (to allow normal interaction otherwise)
    // OR if we are in "Edit Mode" (toggle via postMessage later)
    // For now, let's require Alt/Option key to select, to avoid breaking normal clicks
    if (e.altKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        
        selectedElement = e.target;
        
        // Flash effect
        overlay.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
        setTimeout(() => {
            overlay.style.backgroundColor = 'rgba(6, 182, 212, 0.1)';
        }, 150);

        // Send to Parent
        window.parent.postMessage({
            type: 'AETHER_ELEMENT_SELECTED',
            payload: {
                tagName: selectedElement.tagName.toLowerCase(),
                className: selectedElement.className,
                innerText: selectedElement.innerText.substring(0, 50),
                innerHTML: selectedElement.innerHTML.substring(0, 200), // Limit size
                rect: selectedElement.getBoundingClientRect()
            }
        }, '*');
    }
  });

  // Listen for messages from Parent
  window.addEventListener('message', (event) => {
      if (event.data.type === 'AETHER_UPDATE_STYLE') {
          if (selectedElement) {
              // Apply style changes directly for instant feedback
              Object.assign(selectedElement.style, event.data.payload);
          }
      }
      if (event.data.type === 'AETHER_UPDATE_TEXT') {
          if (selectedElement) {
              selectedElement.innerText = event.data.payload;
          }
      }
  });

})();
`;

const { Plugin } = require("obsidian");

class ImageOverlayPlugin extends Plugin {
    onload() {
        console.log("Image Overlay Plugin loaded!");

        // Add ribbon icon for toggling CSS styles
        this.addRibbonIcon('image-file', 'Toggle Image Styles', (evt) => {
            this.toggleImageStyles();
        });

        // Use setInterval to periodically check for images
        const intervalId = setInterval(() => {
            const images = document.querySelectorAll("img");
            if (images.length > 0) {
                clearInterval(intervalId); // Stop checking once images are found
                console.log("Images found, initializing.");
                this.initializeImageOverlay();
            }
        }, 100); // Check every 100ms

        // Add keydown event for Alt + R to open the first image
        document.addEventListener("keydown", (e) => this.handleGlobalKeydown(e));
        console.log("imgoverlay timeout Delay 3");
    }

    toggleImageStyles() {
        // Check if the styles are already applied
        const stylesApplied = document.body.classList.toggle("custom-img-style");
        // Apply styles if toggled on
        if (stylesApplied) {
            console.log("Applying custom image styles.");
            const style = document.createElement("style");
            style.textContent = `
                img {
                    position: absolute;
                    right: 0vw; 
                    width: 100px;
                    height: auto; /* Maintain aspect ratio */
                    margin-top: -18px;
                    padding: 20px;
                }
            `;
            document.head.appendChild(style);
            this.imageStyleElement = style; // Store reference to the style element
        } else {
            console.log("Removing custom image styles.");
            if (this.imageStyleElement) {
                this.imageStyleElement.remove();
                this.imageStyleElement = null; // Clear reference
            }
        }
        // Refresh images to ensure styles are reflected in the document
        this.initializeImageOverlay();
    }

    initializeImageOverlay() {
        this.images = Array.from(document.querySelectorAll("img")).map(img => img.src);
        console.log("imgoverlay timeout Delay 1");

        document.querySelectorAll("img").forEach(img => {
            img.classList.add("img-enlargable");
            img.addEventListener("click", () => this.enlargeImage(img.src));
            console.log("imgoverlay timeout Delay 2");
        });
    }

    onunload() {
        console.log("Image Overlay Plugin unloaded.");
        document.querySelectorAll(".image-overlay").forEach(el => el.remove());
        document.removeEventListener("keydown", this.handleGlobalKeydown);
    }

    enlargeImage(src) {
        this.removeExistingOverlay(); // Ensure only one overlay exists
        let currentIndex = this.images.indexOf(src);
        this.currentZoomLevel = 1; // Initialize zoom level

        const overlay = document.createElement("div");
        overlay.className = "image-overlay";
        overlay.style = `
            background: rgba(0, 0, 0, 0.8);
            position: fixed; top: 0; left: 0;
            backgroundSize: 'contain';
            width: 100%; height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            cursor: zoom-out;
        `;

        const image = document.createElement("img");
        image.src = src;
        image.style = `
            all: unset;
            max-width: 80%;
            max-height: 80%;
            display: block;
            transform: scale(${this.currentZoomLevel}); // Set initial scale
            transition: transform 0.2s; // Smooth zoom transition
        `;

        overlay.appendChild(image);
        document.body.appendChild(overlay);

        overlay.addEventListener("click", () => this.removeExistingOverlay());
        overlay.addEventListener("wheel", (e) => this.handleWheelZoom(e, image));

        document.addEventListener("keydown", (e) =>
            this.handleOverlayNavigation(e, currentIndex, overlay)
        );
    }

    removeExistingOverlay() {
        document.querySelectorAll(".image-overlay").forEach(el => el.remove());
        document.removeEventListener("keydown", this.handleOverlayNavigation);
    }

    handleOverlayNavigation(e, currentIndex, overlay) {
        if (e.key === "ArrowRight") this.navigateImage(1, currentIndex, overlay);
        else if (e.key === "ArrowLeft") this.navigateImage(-1, currentIndex, overlay);
        else if (e.key === "Escape" || e.key === "ArrowDown") this.removeExistingOverlay();
    }

    navigateImage(direction, currentIndex, overlay) {
        const newIndex = currentIndex + direction;
        if (newIndex >= 0 && newIndex < this.images.length) {
            const newSrc = this.images[newIndex];
            overlay.querySelector('img').src = newSrc;
        }
    }

    handleGlobalKeydown(e) {
        if (e.altKey && e.key === "r") {
            e.preventDefault();
            if (this.images.length > 0) {
                this.enlargeImage(this.images[0]);
            }
        }
    }

    handleWheelZoom(event, image) {
        event.preventDefault(); // Prevent page scrolling
        const zoomAmount = 0.1; // Define how much to zoom with each scroll
        if (event.deltaY < 0) {
            this.currentZoomLevel += zoomAmount; // Zoom in
        } else {
            this.currentZoomLevel = Math.max(1, this.currentZoomLevel - zoomAmount); // Zoom out but not below 1
        }
        image.style.transform = `scale(${this.currentZoomLevel})`; // Apply zoom
    }
}

module.exports = ImageOverlayPlugin;

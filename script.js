import { InferenceClient } from "https://esm.sh/@huggingface/inference";

const themeToggle = document.querySelector(".theme-toggle");
const promptForm = document.querySelector(".prompt-form");
const promptInput = document.querySelector(".prompt-input");
const promptBtn = document.querySelector(".prompt-btn");
const generateBtn = document.querySelector(".generate-btn");
const modelSelect = document.getElementById("model-select");
const countSelect = document.getElementById("count-select");
const ratioSelect = document.getElementById("ratio-select");
const gridGallery = document.querySelector(".gallery-grid");


const API_KEY = "#YOUR API KEY#";
const hf = new InferenceClient(API_KEY);

const examplePrompts = [
    "A magic forest with glowing plants and fairy homes",
    "An old steampunk airship floating through golden clouds",
    "A cyberpunk city with neon signs and flying cars",
    "A giant turtle carrying a village on its back"
];

// --- Core Image Logic ---
const getImageDimensions = (aspectRatio, baseSize = 512) => {
    const [width, height] = aspectRatio.split("/").map(Number);
    const scaleFactor = baseSize / Math.sqrt(width * height);
    return { 
        width: Math.floor((width * scaleFactor) / 16) * 16, 
        height: Math.floor((height * scaleFactor) / 16) * 16 
    };
};

const updateImageCard = (imgIndex, imgUrl) => {
    const imgCard = document.getElementById(`img-card-${imgIndex}`);
    if(!imgCard) return;
    imgCard.classList.remove("loading");
    imgCard.innerHTML = `
        <img src="${imgUrl}" class="result-image" />
        <div class="image-overlay">
            <a href="${imgUrl}" download="ai-art-${Date.now()}.png" class="image-download-btn">
                <i class="fa-solid fa-download"></i>
            </a>
        </div>`;
};

const generateImages = async (selectedModel, imageCount, aspectRatio, promptText) => {
    const { width, height } = getImageDimensions(aspectRatio);
    generateBtn.disabled = true;

    // Use a standard for-loop to generate one by one
    for (let i = 0; i < imageCount; i++) {
        try {
            const blob = await hf.textToImage({
                model: selectedModel,
                inputs: promptText,
                parameters: { width, height },
            });

            const imageUrl = URL.createObjectURL(blob);
            updateImageCard(i, imageUrl);
            
            // Optional: Add a small 500ms delay between requests to be safe
            // await new Promise(res => setTimeout(res, 500));

        } catch (error) {
            console.error(`Error on image ${i}:`, error);
            const card = document.getElementById(`img-card-${i}`);
            if (card) {
                card.classList.remove("loading");
                card.innerHTML = `<p class="status-text" style="color:#ff4d4d; padding:10px;">Failed: Rate limit or API error</p>`;
            }
        }
    }

    generateBtn.disabled = false;
};

// --- UI Event Handlers ---
promptForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const promptText = promptInput.value.trim();
    const selectedModel = modelSelect.value || "black-forest-labs/FLUX.1-schnell";
    const imageCount = parseInt(countSelect.value) || 1;
    const aspectRatio = ratioSelect.value || "1/1";

    gridGallery.innerHTML = "";
    for(let i=0; i<imageCount; i++) {
        gridGallery.innerHTML += `
            <div class="image-card loading" id="img-card-${i}" style="aspect-ratio: ${aspectRatio}">
                <div class="status-container">
                    <div class="spinner"></div>
                    <p class="status-text">Generating...</p>
                </div>
            </div>`;
    }
    generateImages(selectedModel, imageCount, aspectRatio, promptText);
});

// Random Prompt
promptBtn.addEventListener("click", () => {
    promptInput.value = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
});

// Theme Logic
themeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark-theme");
    themeToggle.querySelector("i").className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
});
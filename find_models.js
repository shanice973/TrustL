import axios from 'axios';

const findModel = async () => {
    try {
        console.log("Searching for popular vit/resnet models...");
        const response = await axios.get("https://huggingface.co/api/models", {
            params: {
                filter: "image-feature-extraction",
                sort: "downloads",
                direction: -1,
                limit: 100
            }
        });

        const models = response.data;
        const candidates = models.filter(m =>
            (m.id.includes('resnet') || m.id.includes('vit') || m.id.includes('mobilenet')) &&
            !m.id.includes('v2') // Avoid mivolo_v2 if it's niche
        ).slice(0, 10);

        console.log("Top Candidates:");
        candidates.forEach(m => console.log(`- ${m.id} (Downloads: ${m.downloads})`));

    } catch (error) {
        console.error("Error fetching models:", error.message);
    }
};

findModel();

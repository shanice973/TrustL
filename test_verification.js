import axios from 'axios';

// 1x1 Red Pixel GIF
const base64Image = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

const test = async () => {
    try {
        console.log("Testing API with Data URI...");
        const response = await axios.post('http://localhost:5000/api/verify', {
            imageUrl: base64Image,
            productUrl: "http://test.com",
            price: "$100"
        });
        console.log("Success:", JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
    }
};

test();

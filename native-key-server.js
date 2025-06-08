const express = require('express');
const { exec } = require('child_process');

const app = express();
app.use(express.json());

app.post('/press-down', (req, res) => {
    exec(`osascript -e 'tell application "System Events" to key code 125'`, (error) => {
        if (error) {
            console.error("Keypress failed:", error);
            return res.status(500).send("Failed to press key");
        }
        console.log("⬇️ Simulated ArrowDown key press");
        res.sendStatus(200);
    });
});

app.listen(3000, () => {
    console.log("🎯 Native key server running at http://localhost:3000");
});

// ------------------- Symptom Button Selection -------------------
document.querySelectorAll('.symptom-button').forEach(button => {
    button.addEventListener('click', () => {
        button.classList.toggle('selected');
    });
});

// ------------------- Medical History Button Selection -------------------
document.querySelectorAll('.medical-history-button').forEach(button => {
    button.addEventListener('click', function () {
        const noneButton = document.querySelector('.medical-history-button[data-history="None"]');

        if (this.dataset.history === 'None') {
            // Deselect all others if "None" is chosen
            document.querySelectorAll('.medical-history-button').forEach(btn => {
                btn.classList.remove('selected');
            });
            this.classList.add('selected');
        } else {
            // If another option is selected, ensure "None" is deselected
            if (noneButton) noneButton.classList.remove('selected');
            this.classList.toggle('selected');
        }
    });
});

// ------------------- Form Submission -------------------
const API_KEY = "AIzaSyAUGwptjyisi5_HynZGWh0SqhW8EX5-vN8"; // ⚠️ Replace with your Gemini API key

document.getElementById('symptomForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    // Collect input values
    const age = document.getElementById('age').value.trim();
    const gender = document.getElementById('gender').value.trim();
    const selectedSymptoms = [...document.querySelectorAll('.symptom-button.selected')]
        .map(button => button.dataset.symptom);
    const medicalHistory = [...document.querySelectorAll('.medical-history-button.selected')]
        .map(button => button.dataset.history);
    const additionalInfo = document.getElementById('additionalInfo').value.trim();

    if (selectedSymptoms.length === 0) {
        alert('⚠️ Please select at least one symptom');
        return;
    }

    // UI state: loading
    const loadingDiv = document.getElementById('loading');
    const resultsDiv = document.getElementById('results');
    const resultContent = document.getElementById('resultContent');

    loadingDiv.style.display = 'block';
    resultsDiv.style.display = 'none';
    resultContent.innerHTML = '';

    // Construct prompt
    const prompt = `
Medical Analysis Request:

Patient Information:
- Age: ${age || "Not provided"}
- Gender: ${gender || "Not provided"}
- Reported Symptoms: ${selectedSymptoms.join(', ')}
- Medical History: ${medicalHistory.length > 0 ? medicalHistory.join(', ') : 'None reported'}
- Additional Information: ${additionalInfo || 'No additional details provided'}

Please provide a detailed medical analysis with the following structure:

1. Recommended Actions
2. Important Guidelines (DO's and DON'Ts)
3. Red Flags

Make it clear, actionable, and return results in clean styled HTML.
`;

    try {
        // Call Gemini API
        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-goog-api-key": API_KEY
                },
                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",
                            parts: [{ text: prompt }]
                        }
                    ]
                })
            }
        );

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        const analysis = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No analysis received.";

        // UI state: show results
        loadingDiv.style.display = 'none';
        resultContent.innerHTML = `<div>${analysis}</div>`;
        resultsDiv.style.display = 'block';

    } catch (error) {
        loadingDiv.style.display = 'none';
        resultContent.innerHTML = `
            <p style="color: red;"><b>Error:</b> ${error.message}</p>
            <p>Please try again later or contact support if the problem persists.</p>
        `;
        resultsDiv.style.display = 'block';
    }
});


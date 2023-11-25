document.addEventListener('DOMContentLoaded', function () {
    const generateButton = document.getElementById('generatePaper');

    generateButton.addEventListener('click', generatePaper);
});

function generatePaper() {
    const form = document.getElementById('questionPaperForm');
    const formData = new FormData(form);
    console.log(formData)
    fetch('http://localhost:3000/generate-paper', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.fromEntries(formData)),
    })
        .then(response => response.json())
        .then(data => {
            console.log(data.message)
            const generatedPaperDiv = document.getElementById('generatedPaper');
            if (data.success) {
                generatedPaperDiv.innerHTML = formatGeneratedPaper(data.generatedPaper);
            } else {
                console.log(formData)
                generatedPaperDiv.innerHTML = 'Error generating paper.';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            const generatedPaperDiv = document.getElementById('generatedPaper');
            generatedPaperDiv.innerHTML = 'An unexpected error occurred.';
        });
}

function formatGeneratedPaper(paper) {
    let html = '<h2>Generated Paper Details</h2>';

    if (paper.questions && paper.questions.length > 0) {
        html += '<h3>Questions:</h3>';
        html += '<ul>';
        paper.questions.forEach(question => {
            html += `<li>${question.question}  - ${question.difficulty} -  marks - ${question.marks}</li>`;
        });
        html += '</ul>';
    } else {
        html += '<p>No questions generated.</p>';
    }

    return html;
}

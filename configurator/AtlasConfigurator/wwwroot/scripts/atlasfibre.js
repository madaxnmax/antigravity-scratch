window.toggleTheme = (forceDark) => {
    const isDark = forceDark !== undefined ? forceDark : localStorage.getItem('isDarkTheme') === 'true';
    document.body.classList.toggle('dark', isDark);
    localStorage.setItem('isDarkTheme', isDark);
    console.log("Theme applied:", isDark ? "Dark" : "Light");
};

document.addEventListener('DOMContentLoaded', () => {
    const initialThemeState = localStorage.getItem('isDarkTheme') === 'true';
    window.toggleTheme(initialThemeState);
});


function setAccessToken(token) {
    localStorage.setItem('access_token', token);
}

function getAccessToken() {
    return localStorage.getItem('access_token');
}

function removeAccessToken() {
    localStorage.removeItem('access_token');
}  
// const pdf = new window.jspdf.jsPDF();
//async function exportToPDF(modalContentId, filename) {
//    const modalContent = document.querySelector('.p-6.space-y-6.overflow-auto.max-h-96');
//    const originalStyle = modalContent.getAttribute('style'); // Store the original styles

//    // Expand the modal content for capturing
//    modalContent.style.overflow = 'visible';
//    modalContent.style.maxHeight = 'none';

//    // Use html2canvas to capture the expanded content
//    const canvas = await html2canvas(modalContent, {
//        useCORS: true,
//        logging: true,
//        windowWidth: document.body.scrollWidth,
//        windowHeight: document.body.scrollHeight
//    });


//    // Revert the modal content to its original style
//    modalContent.setAttribute('style', originalStyle);

//    // Generate the PDF with jsPDF
//    const imgData = canvas.toDataURL('image/png');
//    const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
//    const imgWidth = 210; // A4 width in mm
//    const imgHeight = (canvas.height * imgWidth) / canvas.width;
//    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
//    pdf.save('modal-content.pdf');
//}
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function () {
        console.log('Copied to clipboard successfully!');
    }, function (err) {
        console.error('Could not copy text: ', err);
    });
}
window.exportTableToPdf = (tableId) => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const table = document.getElementById(tableId);

    if (!table) {
        console.error(`Table with id ${tableId} not found`);
        return;
    }

    const rows = table.querySelectorAll("tr");

    let y = 10; // Y position in the PDF

    rows.forEach(row => {
        const cells = row.querySelectorAll("th, td");
        let x = 10; // X position in the PDF
        cells.forEach(cell => {
            doc.text(cell.innerText, x, y);
            x += 50; // Move to next column
        });
        y += 10; // Move to next row
    });

    doc.save("quotes.pdf");
};

window.exportIndividualToPdf = (submissionJson) => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const submission = JSON.parse(submissionJson);

    let y = 10; // Y position in the PDF
    for (const [key, value] of Object.entries(submission)) {
        doc.text(`${key}: ${value}`, 10, y);
        y += 10; // Move to next line
    }

    doc.save("submission.pdf");
};

// Singleton pattern for SignalR connection
if (!window.signalRConnection) {
    // Establish a connection to the SignalR hub
    const connection = new signalR.HubConnectionBuilder()
        .withUrl("/jobStatusHub") // SignalR hub endpoint
        .build();

    // Handle job status updates
    connection.on("ReceiveJobStatus", (jobId, status) => {
        console.log(`Job ${jobId} status: ${status}`);
        if (status === "Completed") {
            //alert(`Job ${jobId} is complete!`);
            // Update the UI or fetch job results if necessary
        }
    });

    // Start the connection
    connection.start()
        .then(() => {
            console.log("SignalR connected. Connection ID:", connection.connectionId);
        })
        .catch(err => console.error("Error connecting to SignalR:", err));

    // Expose connection ID to Blazor
    window.getSignalRConnectionId = async () => connection.connectionId;

    // Save the connection globally
    window.signalRConnection = connection;
}

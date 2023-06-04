const queryData = document.querySelector('#query-data');
const targetElement = document.querySelector('#results');
queryData.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(queryData);
    let query = {};
    for (const [key, value] of formData.entries()) {
        query[key] = value;
    }
    console.log(JSON.stringify(query));
    fetch('/search', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(query)
    })
        .then(response => response.json())
        .then(data => {
            let headerHTML = `<p>${data.header}`
            let tableHTML = '<table>';
            let footerHTML = '</p>'
            if (data.hasOwnProperty('results')) {
                tableHTML += '<tr>'
                tableHTML += '<th>ID</th>'
                tableHTML += '<th class="left-column">Application Name</th>'
                tableHTML += '</tr>'
                for (const row of data.results) {
                    tableHTML += '<tr>';
                    tableHTML += `<td>${row.ID}</td>`;
                    tableHTML += `<td class="left-column">${row.name}</td>`;
                    tableHTML += '</tr>';
                }
            }
            tableHTML += '</table>';
            targetElement.innerHTML = headerHTML + tableHTML + footerHTML;
        });
});
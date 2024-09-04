// Declaraciones de variables globales
let originalData = [];  // Almacenará todos los datos para restaurar después del filtrado
let activeFilters = {
    sex: null,
    ageRange: null,
    serviceType: null
};

// Mapeo de colores según el tipo de prestación
const prestationColors = {
    'CSM P': '#FBE4D5',
    'CSM R': '#FEF2CB',
    'R. TELEFONICO E': '#E2EFD9',
    'R. TELEFONICO N/E': '#D0CECE',
    'VISITA DOMICILIARIA': '#DEEAF6',
    'TALLER': '#DEBDFF',
    'COORDINACION INTERSECTORIAL': '#BDFDFF'
};

document.getElementById('uploadButton').addEventListener('click', () => {
    const fileUpload = document.getElementById('fileUpload');
    if (!fileUpload.files.length) {
        alert('Por favor, selecciona un archivo');
        return;
    }

    const file = fileUpload.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

        let jsonData = XLSX.utils.sheet_to_json(firstSheet, {
            defval: "", 
            header: ["Fecha", "Nombre", "Edad", "Rango de Edad", "Sexo", "Prestacion"]
        });

        jsonData = jsonData.filter(row => {
            const isTotalRow = Object.values(row).some(val => 
                typeof val === 'string' && val.toLowerCase().includes('total')
            );
            return !(row.Nombre === "RECUENTO" || row.Nombre === "RANGO EDAD" || 
                     row.Nombre === "SEXO" || row.Nombre === "PRESTACION" || isTotalRow);
        });

        jsonData = jsonData.filter(row => {
            return !(row.Fecha === "Fecha" && row.Nombre === "Nombre");
        });

        jsonData.forEach(row => {
            if (row["Fecha"] && typeof row["Fecha"] === "number") {
                row["Fecha"] = XLSX.SSF.format("yyyy-mm-dd", row["Fecha"]); 
            }
        });

        originalData = jsonData;
        displayResults(jsonData);

        document.getElementById('filterButtons').style.display = 'block';
    };

    reader.readAsArrayBuffer(file);
});

document.getElementById('filterM').addEventListener('click', () => {
    toggleFilter('sex', 'M', 'filterM');
});

document.getElementById('filterF').addEventListener('click', () => {
    toggleFilter('sex', 'F', 'filterF');
});

document.getElementById('clearFilter').addEventListener('click', () => {
    clearAllFilters();
    displayResults(originalData);
});

function toggleFilter(filterType, value, buttonId) {
    if (filterType === 'sex' || filterType === 'ageRange' || filterType === 'serviceType') {
        clearFilter(filterType);
    }
    if (activeFilters[filterType] === value) {
        activeFilters[filterType] = null;
        document.getElementById(buttonId).classList.remove('active');
    } else {
        activeFilters[filterType] = value;
        document.getElementById(buttonId).classList.add('active');
    }
    applyFilters();
}

function clearFilter(filterType) {
    if (activeFilters[filterType]) {
        const buttonId = filterType === 'sex'
            ? `filter${activeFilters[filterType]}`
            : filterType === 'ageRange'
            ? `age-${activeFilters[filterType].replace(/\s+/g, '')}`
            : `service-${activeFilters[filterType].replace(/\s+/g, '')}`;
        document.getElementById(buttonId).classList.remove('active');
        activeFilters[filterType] = null;
    }
}

function applyFilters() {
    let filteredData = originalData;

    if (activeFilters.sex) {
        filteredData = filteredData.filter(row => row.Sexo === activeFilters.sex);
    }
    if (activeFilters.ageRange) {
        filteredData = filteredData.filter(row => row["Rango de Edad"] === activeFilters.ageRange);
    }
    if (activeFilters.serviceType) {
        filteredData = filteredData.filter(row => row.Prestacion === activeFilters.serviceType);
    }

    displayResults(filteredData);
}

function clearAllFilters() {
    Object.keys(activeFilters).forEach(filterType => clearFilter(filterType));
    displayResults(originalData);
}

function filterByAge(ageRange) {
    toggleFilter('ageRange', ageRange, `age-${ageRange.replace(/\s+/g, '')}`);
}

function filterByServiceType(serviceType) {
    toggleFilter('serviceType', serviceType, `service-${serviceType.replace(/\s+/g, '')}`);
}

function displayResults(data) {
    const resultsSection = document.getElementById('resultsSection');
    const resultsDiv = document.getElementById('results');
    resultsSection.style.display = 'block';

    resultsDiv.innerHTML = '';

    const table = document.createElement('table');
    table.classList.add('table-container');

    const headers = ["Persona N°", "Fecha", "Nombre", "Edad", "Rango de Edad", "Sexo", "Prestacion"];
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        tr.appendChild(th);
    });
    thead.appendChild(tr);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    data.forEach((row, index) => {
        const tr = document.createElement('tr');

        const prestationType = row['Prestacion'];
        if (prestationColors[prestationType]) {
            tr.style.backgroundColor = prestationColors[prestationType];
        }

        const tdCounter = document.createElement('td');
        tdCounter.textContent = index + 1;
        tr.appendChild(tdCounter);

        headers.slice(1).forEach(header => {
            const td = document.createElement('td');
            td.textContent = row[header];
            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    resultsDiv.appendChild(table);

    const totalCounter = document.createElement('p');
    totalCounter.textContent = `Total de personas procesadas: ${data.length}`;
    totalCounter.style.fontSize = '20px';
    totalCounter.style.fontWeight = 'bold';
    totalCounter.style.textAlign = 'right';
    resultsDiv.appendChild(totalCounter);
}

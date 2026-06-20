// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('year').textContent = new Date().getFullYear();
});

// Mortar calculator function
function mortarcalculator() {
    const volumeInput = document.getElementById('moratrVolume');
    const gradeSelect = document.getElementById('ConcreteMarks');
    
    // Validate inputs
    if (!volumeInput.value || !gradeSelect.value) {
        clearResults();
        return;
    }

    const volume = parseFloat(volumeInput.value);
    const grade = gradeSelect.value;
    
    let aggregateResult = "";
    let sandResult = "";
    let cementResult = "";
    let steelResult = "";

    switch (grade) {
        case 'M5-1:5:10':
            aggregateResult = ((volume)*(10/16)).toFixed(2) + ' ft³';
            sandResult = ((volume*(5/16))).toFixed(2) + ' ft³';
            cementResult = ((volume*(1/16))/(1.25)).toFixed(2) + ' bags <span class="cementbag">(50 Kg)</span>';
            steelResult = steelWeight(volume);
            break;
        case 'M7.5-1:4:8':
            aggregateResult = ((volume)*(8/13)).toFixed(2) + ' ft³';
            sandResult = ((volume*(4/13))).toFixed(2) + ' ft³';
            cementResult = ((volume*(1/13))/(1.25)).toFixed(2) + ' bags <span class="cementbag">(50 Kg)</span>';
            steelResult = steelWeight(volume);
            break;
        case 'M10-1:3:6':
            aggregateResult = ((volume)*(6/10)).toFixed(2) + ' ft³';
            sandResult = ((volume*(3/10))).toFixed(2) + ' ft³';
            cementResult = ((volume*(1/10))/(1.25)).toFixed(2) + ' bags <span class="cementbag">(50 Kg)</span>';
            steelResult = steelWeight(volume);
            break;
        case 'M15-1:2:4':
            aggregateResult = ((volume)*(4/7)).toFixed(2) + ' ft³';
            sandResult = ((volume*(2/7))).toFixed(2) + ' ft³';
            cementResult = ((volume*(1/7))/(1.25)).toFixed(2) + ' bags <span class="cementbag">(50 Kg)</span>';
            steelResult = steelWeight(volume);
            break;
        case 'M20-1:1.5:3':
            aggregateResult = ((volume)*(3/5.5)).toFixed(2) + ' ft³';
            sandResult = ((volume*(1.5/5.5))).toFixed(2) + ' ft³';
            cementResult = ((volume*(1/5.5))/(1.25)).toFixed(2) + ' bags <span class="cementbag">(50 Kg)</span>';
            steelResult = steelWeight(volume);
            break;
        case 'M25-1:1:2':
            aggregateResult = ((volume)*(2/4)).toFixed(2) + ' ft³';
            sandResult = ((volume*(1/4))).toFixed(2) + ' ft³';
            cementResult = ((volume*(1/4))/(1.25)).toFixed(2) + ' bags <span class="cementbag">(50 Kg)</span>';
            steelResult = steelWeight(volume);
            break;
    }
    
    document.getElementById("aggregateResult").innerHTML = aggregateResult;
    document.getElementById("sandResult").innerHTML = sandResult;
    document.getElementById("cementResult").innerHTML = cementResult;
    document.getElementById("steelResult").innerHTML = steelResult;
}

function steelWeight(volume) {
    // Read selected steel type multiplier from the UI
    const steelSelect = document.getElementById('steelType');
    const type = steelSelect ? steelSelect.value : 'residential';

    let multiplier = 4; // default: residential slab
    switch (type) {
        case 'residential':
            multiplier = 4;
            break;
        case 'footing':
            multiplier = 6;
            break;
        case 'beam_column':
            multiplier = 8;
            break;
        case 'heavy':
            multiplier = 12;
            break;
    }

    // User requested: multiply the mortar volume by the selected multiplier
    const steelEstimate = volume * multiplier;
    return steelEstimate.toFixed(2) + ' Kg';
}

// Clear results function
function clearResults() {
    document.getElementById("aggregateResult").innerHTML = '-';
    document.getElementById("sandResult").innerHTML = '-';
    document.getElementById("cementResult").innerHTML = '-';
    document.getElementById("steelResult").innerHTML = '-';
}

// Volume calculator function
function calculate() {
    const widthInput = document.getElementById('a');
    const lengthInput = document.getElementById('b');
    const heightInput = document.getElementById('c');
    const resultBox = document.getElementById('result');
    
    // Validate inputs
    if (!widthInput.value || !lengthInput.value || !heightInput.value) {
        resultBox.innerHTML = '';
        return;
    }
    
    const width = parseFloat(widthInput.value);
    const length = parseFloat(lengthInput.value);
    const height = parseFloat(heightInput.value);

    // Validate positive numbers
    if (width <= 0 || length <= 0 || height <= 0) {
        resultBox.innerHTML = '<span style="color: #e74c3c;"><i class="fas fa-exclamation-circle"></i> Please enter positive values</span>';
        return;
    }

    const baseVolume = width * length * height;
    const totalWithWaste = baseVolume * 1.3;
    
    resultBox.innerHTML = `
        <div style="text-align: left;">
            <p style="margin: 0 0 10px 0;"><strong>Base Volume:</strong> ${baseVolume.toFixed(2)} ft³</p>
            <p style="margin: 0;"><strong>With 30% Waste:</strong> ${totalWithWaste.toFixed(2)} ft³ <small style="font-weight: 400;">✓ Recommended</small></p>
        </div>
    `;
}

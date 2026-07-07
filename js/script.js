// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('year').textContent = new Date().getFullYear();
});

// Ratios are cement:sand:aggregate parts for each RCC grade
const RCC_RATIOS = {
    'M5-1:5:10': [1, 5, 10],
    'M7.5-1:4:8': [1, 4, 8],
    'M10-1:3:6': [1, 3, 6],
    'M15-1:2:4': [1, 2, 4],
    'M20-1:1.5:3': [1, 1.5, 3],
    'M25-1:1:2': [1, 1, 2]
};

// Water-cement ratio by weight — thumb-rule values per IS 10262 guidance (richer mix = less water)
const RCC_WC_RATIO = {
    'M5-1:5:10': 0.60,
    'M7.5-1:4:8': 0.55,
    'M10-1:3:6': 0.55,
    'M15-1:2:4': 0.50,
    'M20-1:1.5:3': 0.50,
    'M25-1:1:2': 0.45
};

// Water-cement ratio for masonry mortar, following the same richer-mix-needs-less-water pattern as RCC
const MASONRY_WC_RATIO = {
    '1:3': 0.55,
    '1:4': 0.55,
    '1:6': 0.50,
    '1:8': 0.60
};

// Table used to build the results grid + cost summary rows from whatever mortarcalculator() computed
const MATERIAL_META = {
    cement: { label: 'Cement', unit: 'bags' },
    sand: { label: 'Sand', unit: 'ft³' },
    aggregate: { label: 'Aggregate', unit: 'ft³' },
    steel: { label: 'Steel', unit: 'Kg' },
    bricks: { label: 'Bricks', unit: 'nos' },
    stone: { label: 'Stone', unit: 'ft³' }
};

let lastQuantities = {};

// Mortar/concrete calculator — dispatches to the RCC or masonry branch based on the selected work type
function mortarcalculator() {
    const volumeInput = document.getElementById('moratrVolume');
    const workType = document.getElementById('workType').value;

    const volume = parseFloat(volumeInput.value);
    if (!volumeInput.value || !(volume > 0)) {
        clearResults();
        return;
    }

    lastQuantities = {};

    if (workType === 'rcc') {
        calculateRcc(volume);
    } else {
        calculateMasonry(volume, workType);
    }

    renderResults();
    updateSummary();
}

function calculateRcc(volume) {
    const grade = document.getElementById('ConcreteMarks').value;
    if (!grade) return;

    const [cementPart, sandPart, aggregatePart] = RCC_RATIOS[grade];
    const totalParts = cementPart + sandPart + aggregatePart;

    const cementBags = (volume * (cementPart / totalParts)) / 1.25;
    const sandVolume = volume * (sandPart / totalParts);
    const aggregateVolume = volume * (aggregatePart / totalParts);

    lastQuantities.cement = cementBags;
    lastQuantities.sand = sandVolume;
    lastQuantities.aggregate = aggregateVolume;
    lastQuantities.steel = steelWeight(volume);
    lastQuantities.water = waterRequired(cementBags, RCC_WC_RATIO[grade]);
}

function calculateMasonry(volume, workType) {
    const ratio = document.getElementById('masonryRatio').value;
    if (!ratio) return;

    const [cementPart, sandPart] = ratio.split(':').map(Number);
    let mortarVolume;

    if (workType === 'brick') {
        // Standard brick (9x4.5x3 in) laid with mortar joints: ~13.5 bricks per ft³, mortar ~30% of wall volume
        lastQuantities.bricks = Math.round(volume * 13.5);
        mortarVolume = volume * 0.30;
    } else {
        // Random rubble stone masonry: stone needed ≈1.25x wall volume to allow for voids/waste, mortar ~35%
        lastQuantities.stone = volume * 1.25;
        mortarVolume = volume * 0.35;
    }

    const cementBags = (mortarVolume * (cementPart / (cementPart + sandPart))) / 1.25;
    const sandVolume = mortarVolume * (sandPart / (cementPart + sandPart));

    lastQuantities.cement = cementBags;
    lastQuantities.sand = sandVolume;
    lastQuantities.water = waterRequired(cementBags, MASONRY_WC_RATIO[ratio]);
}

function steelWeight(volume) {
    const steelSelect = document.getElementById('steelType');
    const type = steelSelect ? steelSelect.value : 'residential';

    // kg of steel per ft³ of WET concrete — derived from: steel% × 7850 kg/m³ ÷ 35.315 ft³/m³
    // Footing: 0.67% → 1.49 | Slab: 0.7% → 1.56 | Beam/Col: 2% → 4.45 | Heavy: 3% → 6.67
    let kgPerFt3;
    switch (type) {
        case 'residential':  kgPerFt3 = 1.56; break; // lightly reinforced slab ~0.7% steel
        case 'footing':      kgPerFt3 = 1.49; break; // footing ~0.67% steel
        case 'beam_column':  kgPerFt3 = 4.45; break; // beam/col ~2% steel
        case 'heavy':        kgPerFt3 = 6.67; break; // heavy structural ~3% steel
    }

    // Steel % is defined relative to the wet/placed concrete volume, but the input
    // here is the dry (bulked) mortar volume, so convert back down before applying it.
    const wetVolume = volume / 1.54;

    return wetVolume * kgPerFt3;
}

function waterRequired(cementBags, wcRatio) {
    const cementKg = cementBags * 50;
    return cementKg * wcRatio;
}

// Renders lastQuantities into the results grid
function renderResults() {
    document.getElementById('aggregateResult').textContent = lastQuantities.aggregate != null ? lastQuantities.aggregate.toFixed(2) + ' ft³' : '-';
    document.getElementById('sandResult').textContent = lastQuantities.sand != null ? lastQuantities.sand.toFixed(2) + ' ft³' : '-';
    document.getElementById('cementResult').innerHTML = lastQuantities.cement != null ? lastQuantities.cement.toFixed(2) + ' bags <span class="cementbag">(50 Kg)</span>' : '-';
    document.getElementById('steelResult').textContent = lastQuantities.steel != null ? lastQuantities.steel.toFixed(2) + ' Kg' : '-';
    document.getElementById('waterResult').textContent = lastQuantities.water != null ? lastQuantities.water.toFixed(2) + ' L' : '-';
    document.getElementById('bricksResult').textContent = lastQuantities.bricks != null ? lastQuantities.bricks + ' nos' : '-';
    document.getElementById('stoneResult').textContent = lastQuantities.stone != null ? lastQuantities.stone.toFixed(2) + ' ft³' : '-';
}

// Clear results function
function clearResults() {
    lastQuantities = {};
    renderResults();
    updateSummary();
}

// Rebuilds the cost summary table from lastQuantities and the unit cost inputs
function updateSummary() {
    const tbody = document.getElementById('summaryTableBody');
    const grandTotalEl = document.getElementById('grandTotal');
    tbody.innerHTML = '';

    let grandTotal = 0;
    let rowsAdded = 0;

    Object.keys(MATERIAL_META).forEach(function(key) {
        if (lastQuantities[key] == null) return;

        const meta = MATERIAL_META[key];
        const qty = lastQuantities[key];
        const costInput = document.getElementById(key + 'Cost');
        const unitCost = costInput && costInput.value ? parseFloat(costInput.value) : 0;
        const totalCost = qty * unitCost;
        grandTotal += totalCost;
        rowsAdded++;

        const qtyDisplay = meta.unit === 'nos' ? Math.round(qty).toString() : qty.toFixed(2);

        const row = document.createElement('tr');
        row.innerHTML =
            '<td>' + meta.label + '</td>' +
            '<td>' + qtyDisplay + ' ' + meta.unit + '</td>' +
            '<td>' + unitCost.toFixed(2) + '</td>' +
            '<td>' + totalCost.toFixed(2) + '</td>';
        tbody.appendChild(row);
    });

    if (rowsAdded === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="summary-empty">Enter dimensions above to see the cost breakdown</td></tr>';
    }

    grandTotalEl.textContent = grandTotal.toFixed(2);
}

// Toggles which inputs/results apply for the selected type of work
function handleWorkTypeChange() {
    const workType = document.getElementById('workType').value;
    const isRcc = workType === 'rcc';
    const isBrick = workType === 'brick';

    document.getElementById('concreteGradeSection').style.display = isRcc ? 'block' : 'none';
    document.getElementById('structuralTypeSection').style.display = isRcc ? 'block' : 'none';
    document.getElementById('masonryRatioSection').style.display = isRcc ? 'none' : 'block';

    document.getElementById('volumeLabel').textContent = isRcc ? 'Dry Mortar Volume' : (isBrick ? 'Brick Masonry Volume' : 'Stone Masonry Volume');

    document.getElementById('aggregateItem').style.display = isRcc ? 'flex' : 'none';
    document.getElementById('steelItem').style.display = isRcc ? 'flex' : 'none';
    document.getElementById('bricksItem').style.display = isBrick ? 'flex' : 'none';
    document.getElementById('stoneItem').style.display = (!isRcc && !isBrick) ? 'flex' : 'none';

    mortarcalculator();
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

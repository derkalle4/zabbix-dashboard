/**
 * Formats a numeric value with units, converting between sizes if necessary.
 * @param {string|number} value - The numeric value to format.
 * @param {string} targetUnits - The desired units for display (e.g., "MB", "GBPS").
 * @param {string} [sourceUnits='B'] - The source units of the value (e.g., "B", "BPS").
 * @param {number} [decimals=2] - The number of decimal places for the formatted value.
 * @returns {string} The formatted value with units, or the original value if formatting is not possible.
 */
export function formatUnits(value, targetUnits, sourceUnits = 'B', decimals = 2) {
    const val = parseFloat(value);
    if (isNaN(val)) return String(value); // Return original string value if not a number

    const SIZES_BYTES = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const SIZES_BITS_PER_SEC = ['BPS', 'KBPS', 'MBPS', 'GBPS', 'TBPS', 'PBPS'];
    let k = 1024; // Factor for byte-based units
    let availableSourceSizes = SIZES_BYTES;

    const normalizedSourceUnits = sourceUnits.toUpperCase();
    const normalizedTargetUnits = targetUnits.toUpperCase();

    if (normalizedSourceUnits.endsWith('BPS') || normalizedSourceUnits.endsWith('BIT/S') || normalizedSourceUnits.endsWith('BITS')) {
        k = 1000; // Factor for bit-based units (usually decimal for network speeds)
        availableSourceSizes = SIZES_BITS_PER_SEC;
    } else if (normalizedSourceUnits.endsWith('HZ')) { // Basic support for Hz, KHz, MHz, GHz
        k = 1000;
        availableSourceSizes = ['HZ', 'KHZ', 'MHZ', 'GHZ', 'THZ'];
    }


    const targetIdx = availableSourceSizes.indexOf(normalizedTargetUnits);
    let sourceIdx = availableSourceSizes.indexOf(normalizedSourceUnits);

    if (targetIdx === -1 || sourceIdx === -1) {
        // If units are not recognized for conversion, return value with targetUnits appended
        // console.warn(`Cannot convert units: source "${sourceUnits}" or target "${targetUnits}" not recognized. Value: ${val}`);
        return `${val.toFixed(decimals)} ${targetUnits}`;
    }

    // Calculate the scaling factor.
    // If targetIdx > sourceIdx, we are converting to a larger unit (e.g., B to KB), so divide.
    // If targetIdx < sourceIdx, we are converting to a smaller unit (e.g., KB to B), so multiply.
    // The exponent is (targetIdx - sourceIdx).
    // finalValue = initialValue / k^(targetIdx - sourceIdx)
    // or initialValue * k^(sourceIdx - targetIdx)

    const finalConvertedValue = val / Math.pow(k, targetIdx - sourceIdx);

    return `${finalConvertedValue.toFixed(decimals)} ${targetUnits}`;
}
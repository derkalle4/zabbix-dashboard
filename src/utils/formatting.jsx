export function formatUnits(value, targetUnits, sourceUnits = 'B', decimals = 2) {
    const val = parseFloat(value);
    if (isNaN(val)) return String(value);

    const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const BPS_UNITS = ['BPS', 'KBPS', 'MBPS', 'GBPS', 'TBPS', 'PBPS'];
    const HZ_UNITS = ['HZ', 'KHZ', 'MHZ', 'GHZ', 'THZ'];

    const normalizedSource = sourceUnits.toUpperCase();
    const normalizedTarget = targetUnits.toUpperCase();

    let units, factor;
    if (normalizedSource.endsWith('BPS') || normalizedSource.endsWith('BIT/S') || normalizedSource.endsWith('BITS')) {
        units = BPS_UNITS;
        factor = 1000;
    } else if (normalizedSource.endsWith('HZ')) {
        units = HZ_UNITS;
        factor = 1000;
    } else {
        units = BYTE_UNITS;
        factor = 1024;
    }

    const sourceIdx = units.indexOf(normalizedSource);
    const targetIdx = units.indexOf(normalizedTarget);

    if (sourceIdx === -1 || targetIdx === -1) {
        return `${val.toFixed(decimals)} ${targetUnits}`;
    }

    const convertedValue = val / Math.pow(factor, targetIdx - sourceIdx);
    return `${convertedValue.toFixed(decimals)} ${targetUnits}`;
}
export function truncateString(str, frontChars, endChars) {
    if (str.length <= frontChars + endChars) {
        return str;
    }
    return `${str.slice(0, frontChars)}...${str.slice(-endChars)}`;
}

export function truncateAddress(address, frontChars = 6, endChars = 4) {
    return truncateString(address, frontChars, endChars);
}

export function formatBalance(balanceStr) {
    const number = parseFloat(balanceStr);
    if (isNaN(number)) {
        return "0.00";
    }
    return number.toFixed(2);
}

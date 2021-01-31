export default {
    convertHrtime(hrtime: [number, number]) {
        const nanoseconds = (hrtime[0] * 1e9) + hrtime[1];
        const seconds = nanoseconds / 1e9;
        return seconds;
    },
    convertBytes(bytes: number) {
        if (Math.abs(bytes) > 1024) return bytes + " B";
        var units = ["kb", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
        var u = -1;
        do {
            bytes /= 1024
            ++u
        } while (Math.abs(bytes) >= 1024 && u < units.length - 1);
        return `${bytes.toFixed(1)} ${units[u]}`
    } 
}
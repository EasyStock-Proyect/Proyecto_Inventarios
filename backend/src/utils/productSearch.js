function normalizeText(value = "") {
    return String(value)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");
}

function levenshteinDistance(first, second) {
    const previous = Array.from(
        { length: second.length + 1 },
        (_, index) => index
    );

    for (let row = 1; row <= first.length; row += 1) {
        const current = [row];

        for (let column = 1; column <= second.length; column += 1) {
            current[column] = Math.min(
                current[column - 1] + 1,
                previous[column] + 1,
                previous[column - 1] +
                    (first[row - 1] === second[column - 1] ? 0 : 1)
            );
        }

        for (let column = 0; column <= second.length; column += 1) {
            previous[column] = current[column];
        }
    }

    return previous[second.length];
}

function matchesSearch(product, query) {
    const normalizedQuery = normalizeText(query);
    const values = [product.name, product.sku].map(normalizeText);

    return values.some((value) => {
        if (!value) {
            return false;
        }

        if (value.includes(normalizedQuery) || normalizedQuery.length < 3) {
            return value.includes(normalizedQuery);
        }

        const maximumDistance = normalizedQuery.length >= 8 ? 2 : 1;

        return value.split(" ").some((word) => {
            if (word.startsWith(normalizedQuery)) {
                return true;
            }

            for (
                let start = 0;
                start <= word.length - Math.max(normalizedQuery.length - 1, 1);
                start += 1
            ) {
                const fragment = word.slice(
                    start,
                    start + normalizedQuery.length + 1
                );

                if (
                    levenshteinDistance(normalizedQuery, fragment) <=
                        maximumDistance ||
                    levenshteinDistance(
                        normalizedQuery,
                        fragment.slice(0, normalizedQuery.length)
                    ) <= maximumDistance
                ) {
                    return true;
                }
            }

            return false;
        });
    });
}

module.exports = {
    normalizeText,
    matchesSearch
};

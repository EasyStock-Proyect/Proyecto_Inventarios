export function normalizeText(value = "") {
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

function fuzzyTokenMatch(query, value) {
    if (!query || !value) {
        return false;
    }

    if (value.includes(query)) {
        return true;
    }

    if (query.length < 3) {
        return false;
    }

    const maximumDistance = query.length >= 8 ? 2 : 1;
    const words = value.split(" ");

    return words.some((word) => {
        if (word.startsWith(query)) {
            return true;
        }

        const windowLength = query.length;

        for (
            let start = 0;
            start <= word.length - Math.max(windowLength - 1, 1);
            start += 1
        ) {
            const fragment = word.slice(start, start + windowLength + 1);

            if (
                levenshteinDistance(query, fragment) <= maximumDistance ||
                levenshteinDistance(query, fragment.slice(0, windowLength)) <=
                    maximumDistance
            ) {
                return true;
            }
        }

        return false;
    });
}

export function getProductSearchScore(product, query) {
    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) {
        return 0;
    }

    const name = normalizeText(product?.name);
    const sku = normalizeText(product?.sku);

    if (name === normalizedQuery || sku === normalizedQuery) {
        return 100;
    }

    if (name.includes(normalizedQuery) || sku.includes(normalizedQuery)) {
        return 80;
    }

    if (
        fuzzyTokenMatch(normalizedQuery, name) ||
        fuzzyTokenMatch(normalizedQuery, sku)
    ) {
        return 50;
    }

    return -1;
}

export function filterAndRankProducts(products, query) {
    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) {
        return products;
    }

    return products
        .map((product, index) => ({
            product,
            index,
            score: getProductSearchScore(product, normalizedQuery)
        }))
        .filter(({ score }) => score >= 0)
        .sort(
            (first, second) =>
                second.score - first.score || first.index - second.index
        )
        .map(({ product }) => product);
}

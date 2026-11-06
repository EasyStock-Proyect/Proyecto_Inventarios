import { describe, expect, it } from "vitest";

import {
    filterAndRankProducts,
    normalizeText
} from "./productSearch";

const products = [
    { id: 1, name: "Camisa", sku: "CAM-001" },
    { id: 2, name: "Camión", sku: "CAM-002" },
    { id: 3, name: "Teléfono", sku: "TEL-001" },
    { id: 4, name: "José Martínez", sku: "PER-001" }
];

describe("productSearch", () => {
    it("normaliza mayúsculas, tildes y espacios", () => {
        expect(normalizeText("  CamiÓN   ")).toBe("camion");
    });

    it("encuentra coincidencias exactas, parciales y con typos", () => {
        expect(filterAndRankProducts(products, "cammisa")).toEqual([
            products[0]
        ]);
        expect(filterAndRankProducts(products, "tlefono")).toEqual([
            products[2]
        ]);
        expect(filterAndRankProducts(products, "  CAMI ")).toEqual([
            products[0],
            products[1]
        ]);
    });

    it("hace coincidir nombres con y sin tilde", () => {
        expect(filterAndRankProducts(products, "camion")).toEqual([
            products[1]
        ]);
        expect(filterAndRankProducts(products, "jose")).toEqual([
            products[3]
        ]);
    });

    it("descarta coincidencias irrelevantes y ordena por relevancia", () => {
        expect(filterAndRankProducts(products, "camisa")).toEqual([
            products[0]
        ]);
    });
});

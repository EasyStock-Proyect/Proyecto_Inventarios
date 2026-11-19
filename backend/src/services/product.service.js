const path = require("path");
const xlsx = require("xlsx");
const prisma = require ("../config/prisma");
const { matchesSearch } = require("../utils/productSearch");

async function generateSku(userId, categoryId) {

    const category = await prisma.category.findFirst({

        where: {
            id: categoryId,
            userId
        }

    });

    if (!category) {
        throw new Error("Categoría no encontrada.");
    }

    const prefix = category.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z]/g, "")
        .substring(0, 3)
        .toUpperCase();

    const products = await prisma.product.findMany({

        where: {
            userId,
            categoryId
        },

        select: {
            sku: true
        }

    });

    let maxNumber = 0;

    products.forEach(product => {

        const parts = product.sku.split("-");

        if (parts.length === 2) {

            const number = Number(parts[1]);

            if (!isNaN(number) && number > maxNumber) {

                maxNumber = number;

            }

        }

    });

    const nextNumber = maxNumber + 1;

    return `${prefix}-${String(nextNumber).padStart(4, "0")}`;

}

async function createProduct(userId, data) {

    const {
        name,
        sku,
        categoryId,
        price,
        stockCurrent,
        stockMinimum
    } = data;

    if (
        !name ||
        !categoryId ||
        price === undefined ||
        stockCurrent === undefined ||
        stockMinimum === undefined
    ) {
        throw new Error("Todos los campos son obligatorios.");
    }

    if (!name.trim()) {
        throw new Error("El nombre del producto es obligatorio.");
    }

    if (stockCurrent < 0) {
        throw new Error("El stock inicial no puede ser negativo.");
    }

    if (stockMinimum < 0) {
        throw new Error("El stock mínimo no puede ser negativo.");
    }

    if (price <= 0) {
        throw new Error("El precio debe ser mayor que cero.");
    }

    let finalSku;

    if (sku && sku.trim()) {

        finalSku = sku.trim();

        const existingProduct = await prisma.product.findFirst({

            where: {
                userId,
                sku: finalSku
            }

        });

        if (existingProduct) {
            throw new Error("Ya existe un producto con ese SKU.");
        }

    } else {

        finalSku = await generateSku(
            userId,
            categoryId
        );

    }

    const category = await prisma.category.findFirst({

        where: {
            id: categoryId,
            userId
        }

    });

    if (!category) {
        throw new Error("Categoría no encontrada.");
    }

    const product = await prisma.product.create({

        data: {
            userId,
            categoryId,
            name: name.trim(),
            sku: finalSku,
            price,
            stockCurrent,
            stockMinimum
        }
    });

    return product;

}

async function getProducts(userId, query) {

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    const search = query.search?.trim() || "";
    const categoryId = query.categoryId || null;

    const where = {
        userId,
        deletedAt: null,
    };

    if (categoryId) {

        where.categoryId = categoryId;

    }

    const candidates = await prisma.product.findMany({
        where,
        orderBy: { name: "asc" },
        include: {
            category: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });

    const filteredProducts = search
        ? candidates.filter((product) => matchesSearch(product, search))
        : candidates;

    const total = filteredProducts.length;
    const products = filteredProducts.slice(
        (page - 1) * limit,
        page * limit
    );

    return {
        data: products,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };

}

async function updateProduct(userId, productId, data) {

    const product = await prisma.product.findFirst({

        where: {
            id: productId,
            userId,
            deletedAt: null
        }

    });

    if (!product) {
        throw new Error("Producto no encontrado.");
    }

    const updateData = {};

    if (data.name !== undefined) {

        if (!data.name.trim()) {
            throw new Error("El nombre del producto es obligatorio.");
        }

        updateData.name = data.name.trim();

    }

    if (data.sku !== undefined) {

        if (!data.sku.trim()) {
            throw new Error("El SKU del producto es obligatorio.");
        }

        const existingProduct = await prisma.product.findFirst({

            where: {
                userId,
                sku: data.sku.trim(),

                NOT: {
                    id: productId
                }
            }

        });

        if (existingProduct) {
            throw new Error("Ya existe un producto con ese SKU.");
        }

        updateData.sku = data.sku.trim();

    }

    

    if (data.categoryId !== undefined) {

        const category = await prisma.category.findFirst({

            where: {
                id: data.categoryId,
                userId
            }
        
        });
    
        if (!category) {
            throw new Error("Categoría no encontrada.");
        }

        updateData.categoryId = data.categoryId;

    }

    if (data.price !== undefined) {
        updateData.price = data.price;
    }

    if (data.stockMinimum !== undefined) {
        updateData.stockMinimum = data.stockMinimum;
    }

    const updatedProduct = await prisma.product.update({
        where: {
            id: productId
        },
        data: updateData,
        include: {
            category: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });

    return updatedProduct;

}

async function deleteProduct(userId, productId) {

    const product = await prisma.product.findFirst({

        where: {
            id: productId,
            userId,
            deletedAt: null
        }

    });

    if (!product) {
        throw new Error("Producto no encontrado.");
    }

    const deletedProduct = await prisma.product.update({

        where: {
            id: productId
        },

        data: {
            deletedAt: new Date()
        }

    });

    return deletedProduct;

}

async function adjustStock(userId, productId, data) {

    const  { quantity, reason, direction, notes } = data;

    const product = await prisma.product.findFirst({

        where: {
            id: productId,
            userId,
            deletedAt: null
        }
    
    });

    if (!product) {
        throw new Error("Producto no encontrado.");
    }

    if (quantity === undefined) {
        throw new Error("La cantidad es obligatoria.");
    }

    if (typeof quantity !== "number") {
        throw new Error("La cantidad debe ser un número.");
    }

    if (!Number.isInteger(quantity)) {
        throw new Error("La cantidad debe ser un número entero.");
    }

    if (quantity <= 0) {
        throw new Error("La cantidad debe ser mayor que cero.");
    }

    if (!reason) {
        throw new Error("La razón del ajuste es obligatoria.");
    }
    
    const validReasons = [
        "ENTRY",
        "DEVOLUTION",
        "LOSS",
        "CORRECTION"
    ];

    if (!validReasons.includes(reason)) {
        throw new Error("Razón de ajuste inválida.");
    }
    
    if (reason === "CORRECTION") {

        if (!direction) {
            throw new Error("La dirección de la corrección es obligatoria.");
        }

        const validDirections = [
            "INCREASE",
            "DECREASE"
        ];

        if (!validDirections.includes(direction)) {
            throw new Error(
                "La dirección de la corrección es inválida."
            );
        }

    }

    let stockAdjustment;

    switch (reason) {

        case "ENTRY":
        case "DEVOLUTION":

            stockAdjustment = quantity;
            break;

        case "LOSS":

            stockAdjustment = -quantity;
            break;

        case "CORRECTION":

            stockAdjustment =
                direction === "INCREASE"
                    ? quantity
                    : -quantity;

            break;

    }

    const newStock = product.stockCurrent + stockAdjustment;

    if (newStock < 0) {
        
        const error = new Error(
            "El ajuste de stock no puede resultar en un stock negativo."
        );

        error.status = 422;

        throw error;

    }

    const stockMovement = await prisma.$transaction(async (tx) => {

        await tx.product.update({

            where: {
                id: productId
            },

            data: {
                stockCurrent: newStock
            }

        });

        const movement = await tx.stockMovement.create({

            data: {
                productId,
                userId,
                quantity: stockAdjustment,
                reason,
                notes
            }
        });

        return movement;

    });

    return stockMovement;

}

async function getStockAdjustments(userId, productId, query) {

    const product = await prisma.product.findFirst({

        where: {
            id: productId,
            userId,
            deletedAt: null
        }
    
    });

    if (!product) {
        throw new Error("Producto no encontrado.");
    }

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    const skip = (page - 1) * limit;

    const adjustments = await prisma.stockMovement.findMany({

        where: {
            productId,
            userId
        },

        skip,
        take: limit,

        orderBy: {
            createdAt: "desc"
        }

    });

    const total = await prisma.stockMovement.count({

        where: {
            productId
        }

    });

    return {

        data: adjustments,

        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }

    };

}

function normalizeHeaderKey(key) {
    return String(key)
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[\s-]+/g, "_");
}

function generateExcelTemplate() {
    const data = [
        {
            nombre: "Arroz Diana 1kg",
            categoria: "Granos",
            precio: 4500,
            stock_inicial: 50,
            stock_minimo: 10
        }
    ];

    const worksheet = xlsx.utils.json_to_sheet(data, {
        header: ["nombre", "categoria", "precio", "stock_inicial", "stock_minimo"]
    });

    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Productos");

    return xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
}

async function importProductsFromExcel(userId, file) {
    if (!file || !file.buffer) {
        const error = new Error("No se proporcionó ningún archivo.");
        error.status = 400;
        throw error;
    }

    const extension = path.extname(file.originalname || "").toLowerCase();
    if (extension !== ".xlsx" && extension !== ".xls") {
        const error = new Error("El archivo debe ser un formato Excel válido (.xlsx o .xls).");
        error.status = 400;
        throw error;
    }

    let workbook;
    try {
        workbook = xlsx.read(file.buffer, { type: "buffer" });
    } catch {
        const error = new Error("No se pudo leer el archivo Excel. Asegúrate de que no esté dañado.");
        error.status = 400;
        throw error;
    }

    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
        const error = new Error("El archivo Excel no contiene hojas de cálculo.");
        error.status = 400;
        throw error;
    }

    const worksheet = workbook.Sheets[sheetName];
    const rawRows = xlsx.utils.sheet_to_json(worksheet, { defval: "" });

    if (!rawRows || rawRows.length === 0) {
        const error = new Error("El archivo no contiene filas de datos para importar.");
        error.status = 422;
        error.errors = [
            {
                row: 0,
                field: "file",
                message: "El archivo no contiene filas de datos para importar.",
                error: "El archivo no contiene filas de datos para importar."
            }
        ];
        error.details = ["El archivo no contiene filas de datos para importar."];
        throw error;
    }

    const errors = [];
    const validatedRows = [];

    for (let index = 0; index < rawRows.length; index++) {
        const row = rawRows[index];
        const rowNumber = index + 2;

        const normalizedRow = {};
        for (const key of Object.keys(row)) {
            normalizedRow[normalizeHeaderKey(key)] = row[key];
        }

        const isRowEmpty = Object.values(normalizedRow).every(
            (val) => val === "" || val === null || val === undefined
        );

        if (isRowEmpty) {
            continue;
        }

        const rawName = normalizedRow["nombre"];
        const rawCategory = normalizedRow["categoria"];
        const rawPrice = normalizedRow["precio"];
        const rawStock = normalizedRow["stock_inicial"];
        const rawMinStock = normalizedRow["stock_minimo"];

        const name = rawName !== undefined && rawName !== null ? String(rawName).trim() : "";
        const category = rawCategory !== undefined && rawCategory !== null ? String(rawCategory).trim() : "";

        if (!name) {
            errors.push({
                row: rowNumber,
                field: "nombre",
                message: "El nombre del producto no puede estar vacío.",
                error: `Fila ${rowNumber}: El nombre del producto no puede estar vacío.`
            });
        }

        if (!category) {
            errors.push({
                row: rowNumber,
                field: "categoria",
                message: "La categoría no puede estar vacía.",
                error: `Fila ${rowNumber}: La categoría no puede estar vacía.`
            });
        }

        let price = null;
        if (rawPrice === "" || rawPrice === null || rawPrice === undefined) {
            errors.push({
                row: rowNumber,
                field: "precio",
                message: "El precio es obligatorio y debe ser un número entero mayor o igual a 0.",
                error: `Fila ${rowNumber}: El precio es obligatorio y debe ser un número entero mayor o igual a 0.`
            });
        } else {
            const parsedPrice = Number(rawPrice);
            if (isNaN(parsedPrice) || !Number.isInteger(parsedPrice) || parsedPrice < 0) {
                errors.push({
                    row: rowNumber,
                    field: "precio",
                    message: "El precio debe ser un número entero mayor o igual a 0.",
                    error: `Fila ${rowNumber}: El precio debe ser un número entero mayor o igual a 0.`
                });
            } else {
                price = parsedPrice;
            }
        }

        let stock = null;
        if (rawStock === "" || rawStock === null || rawStock === undefined) {
            errors.push({
                row: rowNumber,
                field: "stock_inicial",
                message: "El stock inicial es obligatorio y debe ser un número entero mayor o igual a 0.",
                error: `Fila ${rowNumber}: El stock inicial es obligatorio y debe ser un número entero mayor o igual a 0.`
            });
        } else {
            const parsedStock = Number(rawStock);
            if (isNaN(parsedStock) || !Number.isInteger(parsedStock) || parsedStock < 0) {
                errors.push({
                    row: rowNumber,
                    field: "stock_inicial",
                    message: "El stock inicial debe ser un número entero mayor o igual a 0.",
                    error: `Fila ${rowNumber}: El stock inicial debe ser un número entero mayor o igual a 0.`
                });
            } else {
                stock = parsedStock;
            }
        }

        let minStock = 1;
        if (rawMinStock !== "" && rawMinStock !== null && rawMinStock !== undefined) {
            const parsedMinStock = Number(rawMinStock);
            if (isNaN(parsedMinStock) || !Number.isInteger(parsedMinStock) || parsedMinStock < 0) {
                errors.push({
                    row: rowNumber,
                    field: "stock_minimo",
                    message: "El stock mínimo debe ser un número entero mayor o igual a 0.",
                    error: `Fila ${rowNumber}: El stock mínimo debe ser un número entero mayor o igual a 0.`
                });
            } else {
                minStock = parsedMinStock;
            }
        }

        if (name && category && price !== null && stock !== null) {
            validatedRows.push({
                name,
                category,
                price,
                stock,
                minStock
            });
        }
    }

    if (errors.length > 0) {
        const error = new Error("Se encontraron errores de validación en el archivo Excel.");
        error.status = 422;
        error.errors = errors;
        error.details = errors.map((item) => item.error);
        throw error;
    }

    if (validatedRows.length === 0) {
        const error = new Error("El archivo no contiene filas válidas para importar.");
        error.status = 422;
        error.errors = [
            {
                row: 0,
                field: "file",
                message: "El archivo no contiene filas válidas para importar.",
                error: "El archivo no contiene filas válidas para importar."
            }
        ];
        error.details = ["El archivo no contiene filas válidas para importar."];
        throw error;
    }

    return await prisma.$transaction(async (tx) => {
        const existingCategories = await tx.category.findMany({
            where: {
                userId,
                deletedAt: null
            }
        });

        const categoryMap = new Map();
        const categoryNameMap = new Map();

        for (const cat of existingCategories) {
            categoryMap.set(cat.name.trim().toLowerCase(), cat.id);
            categoryNameMap.set(cat.id, cat.name.trim());
        }

        let createdCategories = 0;
        let createdProducts = 0;
        const categorySkuCounters = new Map();

        for (const rowData of validatedRows) {
            const normalizedCategoryName = rowData.category.trim().toLowerCase();
            let categoryId = categoryMap.get(normalizedCategoryName);
            let categoryOriginalName = categoryNameMap.get(categoryId);

            if (!categoryId) {
                const newCategory = await tx.category.create({
                    data: {
                        userId,
                        name: rowData.category.trim()
                    }
                });

                categoryId = newCategory.id;
                categoryOriginalName = newCategory.name;
                categoryMap.set(normalizedCategoryName, categoryId);
                categoryNameMap.set(categoryId, categoryOriginalName);
                createdCategories += 1;
            }

            if (!categorySkuCounters.has(categoryId)) {
                const prefix = (categoryOriginalName || "PRD")
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-zA-Z]/g, "")
                    .substring(0, 3)
                    .toUpperCase() || "PRD";

                const productsInCategory = await tx.product.findMany({
                    where: {
                        userId,
                        categoryId
                    },
                    select: {
                        sku: true
                    }
                });

                let maxNumber = 0;
                for (const product of productsInCategory) {
                    const parts = product.sku.split("-");
                    if (parts.length === 2) {
                        const number = Number(parts[1]);
                        if (!isNaN(number) && number > maxNumber) {
                            maxNumber = number;
                        }
                    }
                }

                categorySkuCounters.set(categoryId, {
                    prefix,
                    nextNumber: maxNumber + 1
                });
            }

            const counter = categorySkuCounters.get(categoryId);
            const sku = `${counter.prefix}-${String(counter.nextNumber).padStart(4, "0")}`;
            counter.nextNumber += 1;

            await tx.product.create({
                data: {
                    userId,
                    categoryId,
                    name: rowData.name,
                    sku,
                    price: rowData.price,
                    stockCurrent: rowData.stock,
                    stockMinimum: rowData.minStock
                }
            });

            createdProducts += 1;
        }

        return {
            created_products: createdProducts,
            created_categories: createdCategories,
            createdProducts,
            createdCategories
        };
    });
}

module.exports = {
    createProduct,
    getProducts,
    updateProduct,
    deleteProduct,
    adjustStock,
    getStockAdjustments,
    generateSku,
    importProductsFromExcel,
    generateExcelTemplate
};
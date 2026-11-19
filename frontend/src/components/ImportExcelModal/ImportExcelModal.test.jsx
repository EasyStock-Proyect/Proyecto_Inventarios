import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as XLSX from "xlsx";
import ImportExcelModal from "./ImportExcelModal";
import * as productService from "../../services/product.service";

vi.mock("../../services/product.service", () => ({
    importProductsFromExcel: vi.fn(),
    downloadExcelTemplate: vi.fn()
}));

vi.mock("xlsx", () => ({
    utils: {
        json_to_sheet: vi.fn(() => ({})),
        book_new: vi.fn(() => ({})),
        book_append_sheet: vi.fn()
    },
    writeFile: vi.fn()
}));

describe("ImportExcelModal", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("no renderiza nada si open es false", () => {
        const { container } = render(
            <ImportExcelModal open={false} onClose={vi.fn()} onSuccess={vi.fn()} />
        );
        expect(container).toBeEmptyDOMElement();
    });

    it("renderiza el modal correctamente cuando open es true", () => {
        render(
            <ImportExcelModal open={true} onClose={vi.fn()} onSuccess={vi.fn()} />
        );

        expect(
            screen.getByText("Importar productos desde Excel")
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Descargar plantilla" })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Importar productos" })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Cancelar" })
        ).toBeInTheDocument();
    });

    it("descarga la plantilla de ejemplo al hacer clic en el botón", () => {
        render(
            <ImportExcelModal open={true} onClose={vi.fn()} onSuccess={vi.fn()} />
        );

        const downloadButton = screen.getByRole("button", {
            name: "Descargar plantilla"
        });
        fireEvent.click(downloadButton);

        expect(XLSX.writeFile).toHaveBeenCalledWith(
            expect.anything(),
            "plantilla_productos.xlsx"
        );
    });

    it("valida que solo se permitan archivos con extensión .xlsx o .xls", () => {
        render(
            <ImportExcelModal open={true} onClose={vi.fn()} onSuccess={vi.fn()} />
        );

        const input = document.querySelector('input[type="file"]');
        const invalidFile = new File(["dummy"], "archivo.txt", {
            type: "text/plain"
        });

        fireEvent.change(input, { target: { files: [invalidFile] } });

        expect(
            screen.getByText("Solo se permiten archivos Excel (.xlsx o .xls).")
        ).toBeInTheDocument();
    });

    it("muestra el nombre del archivo seleccionado cuando es válido", () => {
        render(
            <ImportExcelModal open={true} onClose={vi.fn()} onSuccess={vi.fn()} />
        );

        const input = document.querySelector('input[type="file"]');
        const validFile = new File(["excel-content"], "productos.xlsx", {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });

        fireEvent.change(input, { target: { files: [validFile] } });

        expect(screen.getByText("productos.xlsx")).toBeInTheDocument();
    });

    it("muestra estado de éxito tras una importación correcta", async () => {
        const onSuccess = vi.fn();
        productService.importProductsFromExcel.mockResolvedValueOnce({
            created_products: 12,
            created_categories: 3
        });

        render(
            <ImportExcelModal open={true} onClose={vi.fn()} onSuccess={onSuccess} />
        );

        const input = document.querySelector('input[type="file"]');
        const validFile = new File(["excel-content"], "productos.xlsx", {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });

        fireEvent.change(input, { target: { files: [validFile] } });

        const submitButton = screen.getByRole("button", {
            name: "Importar productos"
        });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText("¡Importación exitosa!")).toBeInTheDocument();
            expect(
                screen.getByText("12 productos creados")
            ).toBeInTheDocument();
            expect(
                screen.getByText("3 categorías nuevas")
            ).toBeInTheDocument();
            expect(onSuccess).toHaveBeenCalledTimes(1);
        });
    });

    it("muestra errores de validación por fila cuando el servidor responde 422", async () => {
        const errorResponse = {
            response: {
                status: 422,
                data: {
                    message: "Errores de validación en el archivo Excel.",
                    errors: [
                        {
                            row: 2,
                            field: "nombre",
                            message: "El nombre del producto no puede estar vacío."
                        },
                        {
                            row: 3,
                            field: "precio",
                            message: "El precio debe ser un número entero mayor o igual a 0."
                        }
                    ]
                }
            }
        };

        productService.importProductsFromExcel.mockRejectedValueOnce(errorResponse);

        render(
            <ImportExcelModal open={true} onClose={vi.fn()} onSuccess={vi.fn()} />
        );

        const input = document.querySelector('input[type="file"]');
        const validFile = new File(["excel-content"], "productos.xlsx", {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });

        fireEvent.change(input, { target: { files: [validFile] } });

        const submitButton = screen.getByRole("button", {
            name: "Importar productos"
        });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(
                screen.getByText("Errores de validación en el archivo Excel.")
            ).toBeInTheDocument();
            expect(screen.getByText("Fila 2")).toBeInTheDocument();
            expect(
                screen.getByText("El nombre del producto no puede estar vacío.")
            ).toBeInTheDocument();
            expect(screen.getByText("Fila 3")).toBeInTheDocument();
            expect(
                screen.getByText(
                    "El precio debe ser un número entero mayor o igual a 0."
                )
            ).toBeInTheDocument();
        });
    });

    it("cierra el modal al hacer clic en Cancelar", () => {
        const onClose = vi.fn();
        render(
            <ImportExcelModal open={true} onClose={onClose} onSuccess={vi.fn()} />
        );

        const cancelButton = screen.getByRole("button", { name: "Cancelar" });
        fireEvent.click(cancelButton);

        expect(onClose).toHaveBeenCalledTimes(1);
    });
});

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ProductSearch from "./ProductSearch";

describe("ProductSearch", () => {
    it("muestra clear, limpia el texto, enfoca el input y dispara la búsqueda", async () => {
        const onSearch = vi.fn();

        render(<ProductSearch onSearch={onSearch} />);

        const input = screen.getByRole("textbox");
        fireEvent.change(input, { target: { value: "camisa" } });

        expect(
            screen.getByRole("button", { name: "Limpiar búsqueda" })
        ).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole("button", { name: "Limpiar búsqueda" })
        );

        expect(input).toHaveValue("");
        expect(input).toHaveFocus();

        await waitFor(() => {
            expect(onSearch).toHaveBeenLastCalledWith("");
        });
    });
});

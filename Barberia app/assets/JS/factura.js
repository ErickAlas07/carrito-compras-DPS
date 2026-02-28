document.addEventListener("DOMContentLoaded", function () {

    const contenedor = document.getElementById("factura-contenedor");
    const btnImprimir = document.getElementById("btn-imprimir");

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    if (carrito.length === 0) {
        contenedor.innerHTML = "<h2>No hay productos en el carrito.</h2>";
        return;
    }

    let totalGeneral = 0;
    let ivaPorcentaje = 0.13; // 13% IVA incluido

    let html = `
        <div class="factura-page">
            <div class="factura-header">
                <h2>Detalle de Factura - Barbería</h2>
            </div>

            <table class="factura-tabla">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Precio</th>
                        <th>IVA</th>
                        <th>Cantidad</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
    `;

    carrito.forEach(producto => {

        const subtotal = producto.precio * producto.cantidad; // Ya incluye IVA
        const iva = subtotal - (subtotal / (1 + ivaPorcentaje)); // Extraer IVA incluido
        const total = subtotal; // Total ya incluye IVA

        totalGeneral += total;

        html += `
            <tr>
                <td>${producto.nombre}</td>
                <td>$${producto.precio.toFixed(2)}</td>
                <td>$${iva.toFixed(2)}</td>
                <td>${producto.cantidad}</td>
                <td>$${total.toFixed(2)}</td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>

            <h3 style="text-align:right;">Total General: $${totalGeneral.toFixed(2)}</h3>
        </div>
    `;

    contenedor.innerHTML = html;

    // Generar PDF al hacer clic en el botón
    btnImprimir.addEventListener("click", function () {
        // Crear PDF usando jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const pageWidth = doc.internal.pageSize.getWidth();

        doc.setFontSize(18);
        const titulo = "Detalle de Factura - Barbería";
        const textWidth = doc.getTextWidth(titulo);
        const x = (pageWidth - textWidth) / 2;
        doc.text(titulo, x, 20);

        let filas = [];
        let totalFinal = 0;

        carrito.forEach(producto => {

            const subtotal = producto.precio * producto.cantidad;
            const iva = subtotal - (subtotal / (1 + ivaPorcentaje));
            const total = subtotal;

            totalFinal += total;

            filas.push([
                producto.nombre,
                "$" + producto.precio.toFixed(2),
                "$" + iva.toFixed(2),
                producto.cantidad,
                "$" + total.toFixed(2)
            ]);
        });

        doc.autoTable({
            head: [["Producto", "Precio", "IVA", "Cantidad", "Total"]],
            body: filas,
            startY: 30
        });

        // Agregar total al final de la tabla
        doc.setFontSize(14);
        const totalTexto = "Total General: $" + totalFinal.toFixed(2);
        const totalWidth = doc.getTextWidth(totalTexto);
        doc.text(totalTexto, pageWidth - totalWidth - 14, doc.lastAutoTable.finalY + 10);

        doc.save("factura_barberia.pdf");

        localStorage.removeItem("carrito");
        window.location.href = "productos.html";
    });

    // --- DESCONTAR DEL INVENTARIO ---
    let inventario = JSON.parse(localStorage.getItem("inventario")) || [];

    // Recorrer el carrito para actualizar el inventario
    carrito.forEach(itemCarrito => {
        
        // Buscar por id o por nombre para encontrar el producto en el inventario
        let itemEnInventario = inventario.find(inv => inv.id == itemCarrito.id || inv.nombre === itemCarrito.nombre);
                
        if (itemEnInventario && itemEnInventario.tipo === "producto" && itemEnInventario.stock !== null) {
            
            itemEnInventario.stock -= itemCarrito.cantidad;
            
            // evitar que el stock sea negativo
            if(itemEnInventario.stock < 0) {
                itemEnInventario.stock = 0; 
            }
        }
    });

    // Guardar el inventario actualizado en localStorage
    localStorage.setItem("inventario", JSON.stringify(inventario));
});
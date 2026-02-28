document.addEventListener("DOMContentLoaded", function () {
    const contenedor = document.getElementById("factura-contenedor");
    const btnConfirmar = document.getElementById("btn-confirmar");
    const btnImprimirManual = document.getElementById("btn-imprimir"); // El botón secundario
    const formCheckout = document.getElementById("formCheckout");

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    // Redirigir si no hay nada
    if (carrito.length === 0) {
        alert("Tu carrito está vacío. Serás redirigido a la tienda.");
        window.location.href = "productos.html";
        return;
    }

    let totalGeneral = 0;
    let ivaPorcentaje = 0.13; // 13% IVA

    // Dibujar la tabla en el HTML
    let html = `
        <table class="factura-tabla">
            <thead>
                <tr>
                    <th>Producto</th>
                    <th>Cant.</th>
                    <th>IVA</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
    `;

    carrito.forEach(producto => {
        const subtotal = producto.precio * producto.cantidad;
        const iva = subtotal - (subtotal / (1 + ivaPorcentaje)); 
        totalGeneral += subtotal; 

        html += `
            <tr>
                <td><strong>${producto.nombre}</strong><br><small style="color:#666">$${producto.precio.toFixed(2)} c/u</small></td>
                <td>${producto.cantidad}</td>
                <td>$${iva.toFixed(2)}</td>
                <td><strong>$${subtotal.toFixed(2)}</strong></td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
        <div class="factura-total-caja">
            <span style="font-size:1.2rem; font-weight:bold;">Total General:</span>
            <span class="total-numero">$${totalGeneral.toFixed(2)}</span>
        </div>
    `;

    contenedor.innerHTML = html;

    // --- FUNCIÓN PARA GENERAR EL PDF ---
    function generarPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // logo en la esquina superior derecha
        const logoImg = document.getElementById('logoPDF');
        if (logoImg) {
            doc.addImage(logoImg, 'PNG', pageWidth - 40, 10, 30, 30);
        }

        doc.setFontSize(18);
        const titulo = "Detalle de Factura - Barbería Alura";
        const textWidth = doc.getTextWidth(titulo);
        doc.text(titulo, (pageWidth - textWidth) / 2, 25);

        // datos del cliente
        const nombreCliente = document.getElementById('clienteNombre')?.value || '';
        const correoCliente = document.getElementById('clienteCorreo')?.value || '';
        const telefonoCliente = document.getElementById('clienteTelefono')?.value || '';

        doc.setFontSize(12);
        let infoY = 35;
        if (nombreCliente) {
            doc.text(`Nombre: ${nombreCliente}`, 14, infoY);
            infoY += 6;
        }
        if (correoCliente) {
            doc.text(`Correo: ${correoCliente}`, 14, infoY);
            infoY += 6;
        }
        if (telefonoCliente) {
            doc.text(`Teléfono: ${telefonoCliente}`, 14, infoY);
            infoY += 6;
        }

        let filas = [];
        let totalFinal = 0;

        carrito.forEach(producto => {
            const subtotal = producto.precio * producto.cantidad;
            const iva = subtotal - (subtotal / (1 + ivaPorcentaje));
            totalFinal += subtotal;

            filas.push([
                producto.nombre,
                "$" + producto.precio.toFixed(2),
                "$" + iva.toFixed(2),
                producto.cantidad,
                "$" + subtotal.toFixed(2)
            ]);
        });
        // Usamos autoTable para crear la tabla en el PDF
        doc.autoTable({
            head: [["Producto", "Precio", "IVA", "Cantidad", "Total"]],
            body: filas,
            startY: infoY + 4,
            headStyles: { fillColor: [199, 140, 25] }  
        });

        doc.setFontSize(14);
        const totalTexto = "Total General: $" + totalFinal.toFixed(2);
        const totalWidth = doc.getTextWidth(totalTexto);
        doc.text(totalTexto, pageWidth - totalWidth - 14, doc.lastAutoTable.finalY + 10);

        doc.save("factura_barberia.pdf");
    }

    // --- BOTÓN SECUNDARIO (Solo descargar PDF sin pagar) ---
    if(btnImprimirManual) {
        btnImprimirManual.addEventListener("click", function(e) {
            e.preventDefault();
            generarPDF();
        });
    }

    // --- BOTÓN PRINCIPAL: CONFIRMAR, DESCONTAR, IMPRIMIR Y REDIRIGIR ---
    if(btnConfirmar) {
        btnConfirmar.addEventListener("click", function (e) {
            e.preventDefault();

            // 1. Validar que llenó el formulario
            if (!formCheckout.checkValidity()) {
                formCheckout.reportValidity();
                return;
            }

            // Cambiamos el estado del botón para que no le dé doble clic
            btnConfirmar.disabled = true;
            btnConfirmar.innerHTML = "Generando Factura...";

            // 2. Descontar del inventario
            let inventario = JSON.parse(localStorage.getItem("inventario")) || [];

            carrito.forEach(itemCarrito => {
                let itemEnInventario = inventario.find(inv => inv.id == itemCarrito.id || inv.nombre === itemCarrito.nombre);
                if (itemEnInventario && itemEnInventario.tipo === "producto" && itemEnInventario.stock !== null) {
                    itemEnInventario.stock -= itemCarrito.cantidad;
                    if(itemEnInventario.stock < 0) itemEnInventario.stock = 0; 
                }
            });

            localStorage.setItem("inventario", JSON.stringify(inventario));

            // 3. Generar e Imprimir el PDF automáticamente
            generarPDF();

            // 4. Limpiar el carrito y Redirigir a la tienda
            localStorage.removeItem("carrito");

            const nombre = document.getElementById("clienteNombre").value;
            alert(`¡Gracias por tu compra, ${nombre}!\n\nTu pedido ha sido procesado y tu factura se está descargando.`);
            
            setTimeout(() => {
                window.location.href = "productos.html";
            }, 800);
        });
    }
});
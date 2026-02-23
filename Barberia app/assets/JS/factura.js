document.addEventListener("DOMContentLoaded", function () {

    const contenedor = document.getElementById("factura-contenedor");
    const btnImprimir = document.getElementById("btn-imprimir");

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    if (carrito.length === 0) {
        contenedor.innerHTML = "<h2>No hay productos en el carrito.</h2>";
        return;
    }

    let totalGeneral = 0;

    let html = `
        <h2>Factura - Barbería Alura</h2>
        <table border="1" width="100%" cellpadding="10">
            <thead>
                <tr>
                    <th>Producto</th>
                    <th>Precio</th>
                    <th>Cantidad</th>
                    <th>Subtotal</th>
                </tr>
            </thead>
            <tbody>
    `;

    carrito.forEach(producto => {

        const subtotal = producto.precio * producto.cantidad;
        totalGeneral += subtotal;

        html += `
            <tr>
                <td>${producto.nombre}</td>
                <td>$${producto.precio.toFixed(2)}</td>
                <td>${producto.cantidad}</td>
                <td>$${subtotal.toFixed(2)}</td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
        <h3 style="text-align:right;">Total: $${totalGeneral.toFixed(2)}</h3>
    `;

    contenedor.innerHTML = html;

    // Generar factura en formato CSV al finalizar la compra

    btnImprimir.addEventListener("click", function () {

        let csv = "Producto,Precio,Cantidad,Subtotal\n";

        carrito.forEach(producto => {
            const subtotal = producto.precio * producto.cantidad;

            csv += `${producto.nombre},${producto.precio.toFixed(2)},${producto.cantidad},${subtotal.toFixed(2)}\n`;
        });

        csv += `\nTotal General,,,${totalGeneral.toFixed(2)}`;

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "factura_barberia_alura.csv";
        link.click();

        URL.revokeObjectURL(url);
        localStorage.removeItem("carrito"); //Vacia el carrito al imprimir CSV
        window.location.href = "productos.html"; //Redirige a Productos al imprimir la factura. 
    });

});
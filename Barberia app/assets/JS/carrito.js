document.addEventListener("DOMContentLoaded", function () {

    // Selección de los botonos de compra
    const botonesAgregar = document.querySelectorAll(".btn-agregar");

    botonesAgregar.forEach(boton => {
        boton.addEventListener("click", function () {

            // Extraer información del producto seleccionado
            const producto = this.closest("li");
            const nombre = producto.querySelector("h2").textContent;
            const precioTexto = producto.querySelector(".producto-precio").textContent;
            const precio = parseFloat(precioTexto.replace("$", ""));
            const cantidad = parseInt(producto.querySelector(".producto-cantidad").value);

            // lectura de localstorga
            let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

            // Verificar si ya existe el producto. Si existe se adiciona una cantidad más.
            const productoExistente = carrito.find(item => item.nombre === nombre);

            if (productoExistente) {
                productoExistente.cantidad += cantidad;
            } else {
                carrito.push({
                    nombre: nombre,
                    precio: precio,
                    cantidad: cantidad
                });
            }

            // Guardado en localstorage
            localStorage.setItem("carrito", JSON.stringify(carrito));
            alert("Producto agregado al carrito 🛒");
        });
    });

    // Se muestran los productos en la tabla
    const carritoLista = document.getElementById("carrito-lista");
    const carritoVacio = document.getElementById("carritoVacio");
    const carritoConProductos = document.getElementById("carritoConProductos");

    // Ejecución de la función para mostrar el carrito al cargar la página
    if (carritoLista) {
        let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

        // Alteración del DOM dependiendo si el carrito está vacío o tiene productos
        if (carrito.length === 0) {
            carritoVacio.style.display = "block";
            carritoConProductos.style.display = "none";
        } else {
            carritoVacio.style.display = "none";
            carritoConProductos.style.display = "block";
            carritoLista.innerHTML = "";
            let totalGeneral = 0;

            // Construcción de la tabla con los productos del carrito
            carrito.forEach((producto, index) => {
                const subtotal = producto.precio * producto.cantidad;
                totalGeneral += subtotal;
                
                const fila = document.createElement("tr");
                fila.innerHTML = `
                    <td>${producto.nombre}</td>
                    <td>$${producto.precio.toFixed(2)}</td>
                    <td>${producto.cantidad}</td>
                    <td>$${subtotal.toFixed(2)}</td>
                    <td><button onclick="eliminarProducto(${index})">Eliminar</button></td>
                `;
                carritoLista.appendChild(fila);
            });

            // ACTUALIZAR TOTAL
            const totalElemento = document.getElementById("total-general");
            if (totalElemento) {
                totalElemento.textContent = totalGeneral.toFixed(2);
            }
        }
    }

    // Redirección a la página de factura al finalizar la compra
    const btnFinalizar = document.querySelector(".btn-finalizar-compra");

    if (btnFinalizar) {
        btnFinalizar.addEventListener("click", function() {
            window.location.href = "Factura.html";
        });
    }

});

//Boton para eliminar productos del carrito.
function eliminarProducto(index) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    carrito.splice(index, 1);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    location.reload();
}

// function generarCSV() {
//     let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
//     if (carrito.length === 0) {
//         alert("El carrito está vacío.");
//         return;
//     }
//     let csv = "Producto,Precio,Cantidad,Subtotal\n";
//     let totalGeneral = 0;

//     carrito.forEach(producto => {
//         const subtotal = producto.precio * producto.cantidad;
//         totalGeneral += subtotal;

//         csv += `${producto.nombre},${producto.precio.toFixed(2)},${producto.cantidad},${subtotal.toFixed(2)}\n`;
//     });

//     csv += `\nTotal General,,,${totalGeneral.toFixed(2)}`;

//     // Crear archivo descargable
//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);

//     const link = document.createElement("a");
//     link.href = url;
//     link.download = "factura_barberia_alura.csv";
//     link.click();

//     URL.revokeObjectURL(url);
// }

//Vaciar carrito. 
const btnVaciar = document.querySelector(".btn-vaciar-carrito");
if (btnVaciar) {
    btnVaciar.addEventListener("click", function () {
        const confirmar = confirm("¿Estás seguro de que deseas vaciar el carrito?");
        if (confirmar) {
            localStorage.removeItem("carrito");
            location.reload();
        }
    });
}
import { productos } from "../data/productos.js";

export function mostrarProductos(contenedorId = 'lista-productoo') {
    const contenedor = document.getElementById(contenedorId)

    if (!contenedor) {
        console.error(`No se encontro contenedor`)
    } else {

        let htmlProductos = ''

        productos.forEach(producto => {
            htmlProductos += `
            <li class="producto-item" data-id="${producto.id}">
                <h2>${producto.nombre}</h2>
                <img src="${producto.imagen}" alt="${producto.nombre}">
                <p class="descripcion">${producto.descripcion}</p>
                <p class="precio">${producto.precio.toFixed(2)}${producto.moneda}</p>
                <p class="stock">Stock: ${producto.stock} unidades</p>
                <button class="btn-agregar" onclick="agregarAlCarrito(${producto.id})">
                    Agregar al carrito
                </button>
            </li>           
            `;
        });
        contenedor.innerHTML = htmlProductos;
    }
}
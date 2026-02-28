document.addEventListener("DOMContentLoaded", function () {
  // --- Lógica para dropdown de admin ---
  const btnAdmin = document.getElementById("btnAdmin");
  const adminDropdown = document.getElementById("adminDropdown");

  if (btnAdmin && adminDropdown) {
    btnAdmin.addEventListener("click", (e) => {
      e.preventDefault();
      adminDropdown.classList.toggle("active");
    });

    // Cerrar el dropdown al hacer clic fuera de él
    document.addEventListener("click", (e) => {
      if (!btnAdmin.contains(e.target) && !adminDropdown.contains(e.target)) {
        adminDropdown.classList.remove("active");
      }
    });
  }

  // --- Carga de inventario por defecto ---
  const inventarioDefault = [
    { id: 1, nombre: "Corte de Cabello", descripcion: "Corte profesional con tijera o máquina.", precio: 10.0, imagen: "assets/Imagenes/cabello.jpg", tipo: "servicio", stock: null },
    { id: 2, nombre: "Diseño de Barba", descripcion: "Perfilado profesional y tratamiento.", precio: 8.0, imagen: "assets/Imagenes/barba.jpg", tipo: "servicio", stock: null },
    { id: 3, nombre: "Shampoo Profesional", descripcion: "Fórmula con biotina y keratina.", precio: 12.0, imagen: "assets/Imagenes/shampoo.jpg", tipo: "producto", stock: 20 },
    { id: 4, nombre: "Aceite Premium", descripcion: "Aceite multiusos para barba y cabello.", precio: 15.0, imagen: "assets/Imagenes/aceite.jpg", tipo: "producto", stock: 15 },
  ];

  let inventario = JSON.parse(localStorage.getItem("inventario")) || inventarioDefault;
  if (!inventario || inventario.length === 0) {
    inventario = inventarioDefault;
    localStorage.setItem("inventario", JSON.stringify(inventario));
  }

  // --- Función para pintar tarjetas (sirve para Home y Tienda) ---
  function cargarProductos(contenedor, listaProductos) {
    if (!contenedor) return;

    contenedor.innerHTML = "";

    listaProductos.forEach((producto) => {
      let etiquetaStock = "";
      let btnDisabled = "";

      // Lógica visual del stock
      if (producto.tipo === "producto") {
        if (producto.stock > 0) {
          etiquetaStock = `<p class="card-description" style="color:var(--color-dorado); font-weight:bold;">Stock: ${producto.stock}</p>`;
        } else {
          etiquetaStock = `<p class="card-description" style="color:red; font-weight:bold;">Agotado</p>`;
          btnDisabled = "disabled style='opacity: 0.5; cursor: not-allowed;'";
        }
      }

      const tarjetaHtml = `
        <div class="product-card">
          <div class="card-image-container">
            <img src="${producto.imagen}" alt="${producto.nombre}">
          </div>
          <div class="card-content">
            <h3 class="card-title">${producto.nombre}</h3>
            <p class="card-description">${producto.descripcion}</p>
            ${etiquetaStock}
            <div class="card-footer flex-container">
              <span class="card-price">$${producto.precio.toFixed(2)}</span>
              <button class="btn-icon-cart" ${btnDisabled} onclick="agregarAlCarritoDinamico(${producto.id}, '${producto.nombre}', ${producto.precio}, '${producto.tipo}')" aria-label="Añadir al carrito">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `;
      contenedor.innerHTML += tarjetaHtml;
    });
  }

  // A. Mostrar TODOS los productos en la página de Tienda
  const productosContainer = document.getElementById("productos-container");
  if (productosContainer) {
    cargarProductos(productosContainer, inventario);
  }

  // B. Mostrar SOLO LOS 3 PRIMEROS en la página de Home
  const destacadosContainer = document.getElementById("destacados-container");
  if (destacadosContainer) {
    const top3Productos = inventario.slice(0, 3);
    cargarProductos(destacadosContainer, top3Productos);
  }

  // --- Lógica para modal lateral del carrito ---
  const cartIcon = document.getElementById("cartIcon");
  const cartModal = document.querySelector(".cart-modal");
  const cartOverlay = document.getElementById("cartOverlay");
  const closeModal = document.getElementById("closeModal");

  window.toggleModal = function () {
    if (cartModal && cartOverlay) {
      cartModal.classList.toggle("active");
      cartOverlay.classList.toggle("active");
    }
  };

  if (cartIcon) {
    cartIcon.addEventListener("click", (e) => {
      e.preventDefault();
      window.toggleModal();
    });
  }
  if (closeModal) closeModal.addEventListener("click", window.toggleModal);
  if (cartOverlay) cartOverlay.addEventListener("click", window.toggleModal);

  // --- Funciones para redirecciones y vaciar carrito ---
  const btnFinalizarCompra = document.querySelector(".btn-finalizar-compra");
  if (btnFinalizarCompra) {
    btnFinalizarCompra.addEventListener("click", function () {
      window.location.href = "Factura.html";
    });
  }

  const btnVaciar = document.querySelector(".btn-vaciar-carrito");
  if (btnVaciar) {
    btnVaciar.addEventListener("click", function () {
      const confirmar = confirm("¿Estás seguro de que deseas vaciar el carrito?");
      if (confirmar) {
        localStorage.removeItem("carrito");
        window.actualizarCarritoScreen();
      }
    });
  }
  // Arrancar actualizando la pantalla del carrito
  window.actualizarCarritoScreen();
});

// =================================================================
// FUNCIONES GLOBALES 
// =================================================================

// 1. Mostrar Notificación 
window.mostrarNotificacion = function(mensaje, esError = false) {
    const toastViejo = document.querySelector(".toast-notificacion");
    if (toastViejo) toastViejo.remove();

    const toast = document.createElement("div");
    toast.className = `toast-notificacion ${esError ? 'toast-error' : ''}`;
    const icono = esError ? '⚠️' : '🛒';
    toast.innerHTML = `<span style="margin-right:8px">${icono}</span> <span>${mensaje}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("mostrar"), 10);
    setTimeout(() => {
        toast.classList.remove("mostrar");
        setTimeout(() => toast.remove(), 300);
    }, 4000);
};

// 2. Agregar al carrito
window.agregarAlCarritoDinamico = function(id, nombre, precio, tipo) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    let inventario = JSON.parse(localStorage.getItem("inventario")) || [];
    
    const productoExistenteEnCarrito = carrito.find((item) => item.id === id);
    const itemEnInventario = inventario.find(item => item.id === id);
    let cantidadActual = productoExistenteEnCarrito ? productoExistenteEnCarrito.cantidad : 0;

    // Validación de cantidad máxima por producto
    if (cantidadActual >= 5) {
        window.mostrarNotificacion(`No puedes agregar más de 5 unidades de "${nombre}".`, true);
        return;
    }

    // Validación de Stock
    if (tipo === "producto") {
        if (cantidadActual + 1 > itemEnInventario.stock) {
            window.mostrarNotificacion(`Solo tenemos ${itemEnInventario.stock} unidades de "${nombre}" en stock.`, true);
            return;
        }
    }

    // Agrega o suma 1
    if (productoExistenteEnCarrito) {
        productoExistenteEnCarrito.cantidad += 1;
    } else {
        carrito.push({ id, nombre, precio, cantidad: 1, tipo });
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    window.actualizarCarritoScreen();
    
    // Notificación de éxito
    window.mostrarNotificacion(`¡"${nombre}" añadido a tu carrito!`);
};

// 3. Modificar cantidad desde el carrito
window.cambiarCantidad = function(index, delta) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    let inventario = JSON.parse(localStorage.getItem("inventario")) || [];
    
    if(!carrito[index]) return;
    let item = carrito[index];
    let nuevaCantidad = item.cantidad + delta;
    
    if (nuevaCantidad < 1) return; // Si llega a 0, ignora. El usuario debe usar la 'X' para borrar.
    
    if (nuevaCantidad > 5) {
        window.mostrarNotificacion(`Límite de 5 unidades alcanzado.`, true);
        return;
    }
    
    if (item.tipo === "producto" && delta > 0) {
        const itemEnInventario = inventario.find(inv => inv.id === item.id);
        if (itemEnInventario && nuevaCantidad > itemEnInventario.stock) {
            window.mostrarNotificacion(`Stock máximo alcanzado para este producto.`, true);
            return;
        }
    }
    
    item.cantidad = nuevaCantidad;
    localStorage.setItem("carrito", JSON.stringify(carrito));
    window.actualizarCarritoScreen();
};

// 4. Eliminar del carrito
window.eliminarProducto = function (index) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    carrito.splice(index, 1);
    localStorage.setItem("carrito", JSON.stringify(carrito));

    window.actualizarCarritoScreen();
    
    const carritoLista = document.getElementById("carrito-lista");
    if(carritoLista) location.reload(); 
};

// 5. Actualizar todos los contadores e interfaces del carrito
window.actualizarCarritoScreen = function() {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    let totalGeneral = 0;
    let cantidadTotal = 0;

    // Actualización del badge (contador)
    const cartBadge = document.getElementById("cartCount");
    if (cartBadge) {
        carrito.forEach((item) => (cantidadTotal += item.cantidad));
        cartBadge.textContent = cantidadTotal;
    }

    // Actualización del Modal Lateral
    const modalCartItems = document.getElementById("modalCartItems");
    const contenedorTotal = document.querySelector(".modal-total");

    if (modalCartItems && contenedorTotal) {
        if (carrito.length === 0) {
            modalCartItems.innerHTML = '<div class="cart-empty"><p>Tu carrito está vacío.</p></div>';
            contenedorTotal.innerHTML = `<span>Total:</span> <span class="total-price" id="modalTotal">$0.00</span>`;
        } else {
            modalCartItems.innerHTML = "";

            carrito.forEach((producto, index) => {
                const subtotal = producto.precio * producto.cantidad;
                totalGeneral += subtotal;

                modalCartItems.innerHTML += `
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding: 15px 0;">
                        <div style="flex: 1;">
                            <p style="font-weight: bold; margin: 0 0 8px 0; color: #333;">${producto.nombre}</p>
                            
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div style="display: flex; border: 1px solid #ddd; border-radius: 4px; overflow: hidden;">
                                    <button onclick="cambiarCantidad(${index}, -1)" style="background: #f8f9fa; border: none; padding: 3px 10px; cursor: pointer; color:#333; font-weight: bold; transition: 0.2s;">-</button>
                                    <span style="padding: 3px 12px; border-left: 1px solid #ddd; border-right: 1px solid #ddd; font-size: 0.95em;">${producto.cantidad}</span>
                                    <button onclick="cambiarCantidad(${index}, 1)" style="background: #f8f9fa; border: none; padding: 3px 10px; cursor: pointer; color:#333; font-weight: bold; transition: 0.2s;">+</button>
                                </div>
                                <span style="color: #666; font-size: 0.85em;">x $${producto.precio.toFixed(2)}</span>
                            </div>
                        </div>
                        
                        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 10px;">
                            <span style="font-weight: bold; color: var(--color-dorado); font-size: 1.1em;">$${subtotal.toFixed(2)}</span>
                            <button onclick="eliminarProducto(${index})" style="background:none; border:none; color:#e74c3c; cursor:pointer; font-size:1.3em;" title="Quitar todo">&times;</button>
                        </div>
                    </div>
                `;
            });

            // DESGLOSE DEL IVA
            let subtotalSinIva = totalGeneral / 1.13;
            let iva = totalGeneral - subtotalSinIva;

            contenedorTotal.innerHTML = `
                <div style="width: 100%; display: flex; flex-direction: column; gap: 6px; font-size: 0.9rem; color: #666;">
                    <div style="display: flex; justify-content: space-between;">
                        <span>Subtotal:</span>
                        <span>$${subtotalSinIva.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>IVA (13%):</span>
                        <span>$${iva.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 1.2rem; color: #333; font-weight: bold; margin-top: 8px; border-top: 2px solid #eee; padding-top: 8px;">
                        <span>Total General:</span>
                        <span class="total-price" id="modalTotal">$${totalGeneral.toFixed(2)}</span>
                    </div>
                </div>
            `;
        }
    }

    // Actualización de la Tabla grande de la página Carrito 
    const carritoLista = document.getElementById("carrito-lista");
    const carritoVacio = document.getElementById("carritoVacio");
    const carritoConProductos = document.getElementById("carritoConProductos");
    const totalElementoTabla = document.getElementById("total-general");

    if (carritoLista) {
        if (carrito.length === 0) {
            if (carritoVacio) carritoVacio.style.display = "block";
            if (carritoConProductos) carritoConProductos.style.display = "none";
        } else {
            if (carritoVacio) carritoVacio.style.display = "none";
            if (carritoConProductos) carritoConProductos.style.display = "block";

            carritoLista.innerHTML = "";
            let totalTabla = 0;

            carrito.forEach((producto, index) => {
                const subtotal = producto.precio * producto.cantidad;
                totalTabla += subtotal;

                const fila = document.createElement("tr");
                fila.innerHTML = `
                    <td>${producto.nombre}</td>
                    <td>$${producto.precio.toFixed(2)}</td>
                    <td>${producto.cantidad}</td>
                    <td>$${subtotal.toFixed(2)}</td>
                    <td><button onclick="eliminarProducto(${index})" style="padding: 5px 10px; cursor: pointer;">Eliminar</button></td>
                `;
                carritoLista.appendChild(fila);
            });

            if (totalElementoTabla) {
                totalElementoTabla.textContent = totalTabla.toFixed(2);
            }
        }
    }
};
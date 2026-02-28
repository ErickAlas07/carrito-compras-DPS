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

  // --- Funcinones para redirecciones y vaciar carrito ---
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

// Agregar al carrito verificando el stock
window.agregarAlCarritoDinamico = function(id, nombre, precio, tipo) {
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  let inventario = JSON.parse(localStorage.getItem("inventario")) || [];
  
  const productoExistenteEnCarrito = carrito.find((item) => item.id === id);
  const itemEnInventario = inventario.find(item => item.id === id);

  // Validación de Stock ANTES de agregar
  if (tipo === "producto") {
      let cantidadActual = productoExistenteEnCarrito ? productoExistenteEnCarrito.cantidad : 0;
      if (cantidadActual + 1 > itemEnInventario.stock) {
          alert(`Lo sentimos, solo tenemos ${itemEnInventario.stock} unidades de ${nombre} en stock.`);
          return; // Detiene la función, no lo agrega
      }
  }

  // Agrega o suma 1
  if (productoExistenteEnCarrito) {
      productoExistenteEnCarrito.cantidad += 1;
  } else {
      carrito.push({ id, nombre, precio, cantidad: 1, tipo });
  }

  localStorage.setItem("carrito", JSON.stringify(carrito));
  
  // Actualiza la pantalla del modal
  window.actualizarCarritoScreen();
  
  // Abre el modal lateral si está cerrado
  const cartModal = document.querySelector(".cart-modal");
  if (cartModal && !cartModal.classList.contains("active")) {
      window.toggleModal();
  }
};

// Eliminar del carrito
window.eliminarProducto = function (index) {
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  carrito.splice(index, 1);
  localStorage.setItem("carrito", JSON.stringify(carrito));

  window.actualizarCarritoScreen();
    
  const carritoLista = document.getElementById("carrito-lista");
  if(carritoLista) location.reload(); 
};

// Actualizar todos los contadores e interfaces del carrito
window.actualizarCarritoScreen = function() {
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  let totalGeneral = 0;
  let cantidadTotal = 0;

  // Actualización del badge
  const cartBadge = document.getElementById("cartCount");
  if (cartBadge) {
    carrito.forEach((item) => (cantidadTotal += item.cantidad));
    cartBadge.textContent = cantidadTotal;
  }

  // Actualización del Modal Lateral
  const modalCartItems = document.getElementById("modalCartItems");
  const modalTotal = document.getElementById("modalTotal");

  if (modalCartItems && modalTotal) {
    if (carrito.length === 0) {
      modalCartItems.innerHTML = '<div class="cart-empty"><p>Tu carrito está vacío.</p></div>';
      modalTotal.textContent = "$0.00";
    } else {
      modalCartItems.innerHTML = "";

      carrito.forEach((producto, index) => {
        const subtotal = producto.precio * producto.cantidad;
        totalGeneral += subtotal;

        modalCartItems.innerHTML += `
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding: 10px 0; margin-bottom: 10px;">
              <div>
                  <p style="font-weight: bold; margin: 0; color: #333;">${producto.nombre}</p>
                  <p style="margin: 0; color: #666; font-size: 0.9em;">${producto.cantidad} x $${producto.precio.toFixed(2)}</p>
              </div>
              <button onclick="eliminarProducto(${index})" style="background:none; border:none; color:red; cursor:pointer; font-size:1.2em;">&times;</button>
          </div>
        `;
      });

      modalTotal.textContent = `$${totalGeneral.toFixed(2)}`;
    }
  }

  // Actualización de la Tabla de la página de Carrito 
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
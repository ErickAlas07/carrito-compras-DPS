document.addEventListener("DOMContentLoaded", function () {
  // Lógica para dropdown de admin
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

  // Carga de inventario
  const productosContainer = document.getElementById("productos-container");

  // Definición del inventario por defecto
  const inventarioDefault = [
    {
      id: 1,
      nombre: "Corte de Cabello",
      descripcion: "Corte profesional con tijera o máquina.",
      precio: 10.0,
      imagen: "assets/Imagenes/cabello.jpg",
      tipo: "servicio",
      stock: null,
    },
    {
      id: 2,
      nombre: "Diseño de Barba",
      descripcion: "Perfilado profesional y tratamiento.",
      precio: 8.0,
      imagen: "assets/Imagenes/barba.jpg",
      tipo: "servicio",
      stock: null,
    },
    {
      id: 3,
      nombre: "Shampoo Profesional",
      descripcion: "Fórmula con biotina y keratina.",
      precio: 12.0,
      imagen: "assets/Imagenes/shampoo.jpg",
      tipo: "producto",
      stock: 20,
    },
    {
      id: 4,
      nombre: "Aceite Premium",
      descripcion: "Aceite multiusos para barba y cabello.",
      precio: 15.0,
      imagen: "assets/Imagenes/aceite.jpg",
      tipo: "producto",
      stock: 15,
    },
  ];

  // Intentamos cargar el inventario desde localStorage, si no existe se carga el inventario por defecto
  let inventario =
    JSON.parse(localStorage.getItem("inventario")) || inventarioDefault;
  if (!inventario) {
    inventario = inventarioDefault;
    localStorage.setItem("inventario", JSON.stringify(inventario));
  }

  function cargarProductos() {
    if (!productosContainer) return;

    productosContainer.innerHTML = "";

    inventario.forEach((producto) => {
      let etiquetaStock = "";
      if (producto.tipo === "producto") {
        etiquetaStock = `<p class="card-stock">Stock: ${producto.stock}</p>`;
      }

      const tarjetaHtml = `<div class="product-card">
                    <div class="card-image-container">
                        <img src="${producto.imagen}" alt="${producto.nombre}">
                    </div>
                    <div class="card-content">
                        <h3 class="card-title">${producto.nombre}</h3>
                        <p class="card-description">${producto.descripcion}</p>
                        ${etiquetaStock}
                        <div class="card-footer flex-container">
                            <span class="card-price">$${producto.precio.toFixed(2)}</span>
                            <button class="btn-icon-cart" onclick="agregarAlCarrito(this)" data-id="${producto.id}" data-nombre="${producto.nombre}" data-precio="${producto.precio}" data-tipo="${producto.tipo}" aria-label="Añadir al carrito">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            `;
      productosContainer.innerHTML += tarjetaHtml;
    });
  }

  cargarProductos();

  // Lógica para modal lateral
  const cartIcon = document.getElementById("cartIcon");
  const cartModal = document.querySelector(".cart-modal");
  const cartOverlay = document.getElementById("cartOverlay");
  const closeModal = document.getElementById("closeModal");

  // Lógica para abrir y cerrar el modal
  function toggleModal() {
    if (cartModal && cartOverlay) {
      cartModal.classList.toggle("active");
      cartOverlay.classList.toggle("active");
    }
  }

  if (cartIcon)
    cartIcon.addEventListener("click", (e) => {
      e.preventDefault();
      toggleModal();
    });
  if (closeModal) closeModal.addEventListener("click", toggleModal);
  if (cartOverlay) cartOverlay.addEventListener("click", toggleModal);

  // Selección de los botonos de compra
  const botonesAgregar = document.querySelectorAll(".btn-icon-cart");

  botonesAgregar.forEach((boton) => {
    boton.addEventListener("click", function () {
      const productoCard = this.closest(".product-card");

      const nombre = productoCard.querySelector(".card-title").textContent;
      const precioTexto = productoCard.querySelector(".card-price").textContent;
      const precio = parseFloat(precioTexto.replace("$", ""));

      const cantidad = 1;

      // lectura de localstorga
      let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

      // Verificar si ya existe el producto. Si existe se adiciona una cantidad más.
      const productoExistente = carrito.find((item) => item.nombre === nombre);

      if (productoExistente) {
        productoExistente.cantidad += cantidad;
      } else {
        carrito.push({
          nombre,
          precio,
          cantidad,
        });
      }

      // Guardado en localstorage
      localStorage.setItem("carrito", JSON.stringify(carrito));

      //   alert("Producto agregado al carrito 🛒");

      actualizarCarritoScreen();

      if (cartModal && !cartModal.classList.contains("active")) {
        toggleCartModal();
      }
    });
  });

  // Función para actualizar la pantalla del carrito
  function actualizarCarritoScreen() {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    let totalGeneral = 0;
    let cantidadTotal = 0;

    // Actualización del badge del carrito
    const cartBadge = document.getElementById("cartCount");
    if (cartBadge) {
      carrito.forEach((item) => (cantidadTotal += item.cantidad));
      cartBadge.textContent = cantidadTotal;
    }

    const modalCarrito = document.getElementById("modalCartItems");
    const modalTotal = document.getElementById("modalTotal");

    if (modalCarrito && modalTotal) {
      if (carrito.length === 0) {
        modalCartItems.innerHTML =
          '<div class="cart-empty"><p>Tu carrito está vacío.</p></div>';
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

    // Actualizar la Tabla de la página Carrito
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
        // Reiniciamos total para calcularlo solo para la tabla
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
  }

  actualizarCarritoScreen();

  const btnFinalizarCompra = document.querySelector(".btn-finalizar-compra");
  if (btnFinalizarCompra) {
    btnFinalizarCompra.addEventListener("click", function () {
      window.location.href = "Factura.html";
    });
  }

  // Vaciar el carrito después de finalizar la compra
  const btnVaciar = document.querySelector(".btn-vaciar-carrito");
  if (btnVaciar) {
    btnVaciar.addEventListener("click", function () {
      const confirmar = confirm(
        "¿Estás seguro de que deseas vaciar el carrito?",
      );
      if (confirmar) {
        localStorage.removeItem("carrito");
        actualizarCarritoScreen(); // Actualizar interfaz sin recargar la página entera
      }
    });
  }
});

window.eliminarProducto = function (index) {
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  carrito.splice(index, 1);
  localStorage.setItem("carrito", JSON.stringify(carrito));

  document.dispatchEvent(new Event("carritoActualizado"));
};

// Escuchar el evento personalizado para actualizar la interfaz del carrito
document.addEventListener("carritoActualizado", () => {
  location.reload();
});



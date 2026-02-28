document.addEventListener("DOMContentLoaded", function() {
    
    // Elementos del DOM
    const formInventario = document.getElementById("formInventario");
    const tablaBody = document.getElementById("tablaInventarioBody");
    const selectTipo = document.getElementById("itemTipo");
    const grupoStock = document.getElementById("grupoStock");
    const inputStock = document.getElementById("itemStock");
    
    // Modo Edición
    const formTitulo = document.getElementById("form-titulo");
    const btnCancelar = document.getElementById("btnCancelar");
    const inputId = document.getElementById("itemId");

    // Mostrar u ocultar campo de stock según tipo
    selectTipo.addEventListener("change", function() {
        if (this.value === "producto") {
            grupoStock.style.display = "block";
            inputStock.required = true;
        } else {
            grupoStock.style.display = "none";
            inputStock.required = false;
            inputStock.value = ""; 
        }
    });

    // --- Carga de inventario por defecto ---
    const inventarioDefault = [
        { id: 1, nombre: "Corte de Cabello", descripcion: "Corte profesional con tijera o máquina.", precio: 10.0, imagen: "assets/Imagenes/cabello.jpg", tipo: "servicio", stock: null },
        { id: 2, nombre: "Diseño de Barba", descripcion: "Perfilado profesional y tratamiento.", precio: 8.0, imagen: "assets/Imagenes/barba.jpg", tipo: "servicio", stock: null },
        { id: 3, nombre: "Shampoo Profesional", descripcion: "Fórmula con biotina y keratina.", precio: 12.0, imagen: "assets/Imagenes/shampoo.jpg", tipo: "producto", stock: 20 },
        { id: 4, nombre: "Aceite Premium", descripcion: "Aceite multiusos para barba y cabello.", precio: 15.0, imagen: "assets/Imagenes/aceite.jpg", tipo: "producto", stock: 15 },
    ];

    let inventario = [];

    try {
        const guardado = localStorage.getItem("inventario");
        if (guardado) {
            inventario = JSON.parse(guardado);
        }
    } catch (error) {
        console.warn("La información del inventario en localStorage está vacío. Se cargará el inventario por defecto.");
    }

    if (!inventario || !Array.isArray(inventario) || inventario.length === 0) {
        inventario = inventarioDefault;
        localStorage.setItem("inventario", JSON.stringify(inventario));
    }
    
    function guardarInventario(inventario) {
        localStorage.setItem("inventario", JSON.stringify(inventario));
        renderizarTabla();
    }

    // Pintar la tabla
    function renderizarTabla() {
        const inventario = obtenerInventario();
        tablaBody.innerHTML = "";

        inventario.forEach(item => {
            let textoStock = item.tipo === "producto" ? item.stock : "N/A (Servicio)";
            
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${item.id}</td>
                <td><strong>${item.nombre}</strong></td>
                <td>${item.tipo === 'producto' ? 'Producto' : 'Servicio'}</td>
                <td>$${item.precio.toFixed(2)}</td>
                <td>${textoStock}</td>
                <td>
                    <div class="acciones-tabla">
                        <button class="btn-accion btn-editar-icon" onclick="editarItem(${item.id})" title="Editar">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="btn-accion btn-eliminar-icon" onclick="eliminarItem(${item.id})" title="Eliminar">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                    </div>
                </td>
            `;
            tablaBody.appendChild(tr);
        });
    }

    // Guardar o Actualizar Item 
    formInventario.addEventListener("submit", function(e) {
        e.preventDefault();

        const inventario = obtenerInventario();
        
        // Recoger datos del formulario
        const nuevoItem = {
            id: inputId.value ? parseInt(inputId.value) : Date.now(), // Usa ID existente o crea uno nuevo con la fecha
            nombre: document.getElementById("itemNombre").value,
            descripcion: document.getElementById("itemDesc").value,
            precio: parseFloat(document.getElementById("itemPrecio").value),
            tipo: selectTipo.value,
            stock: selectTipo.value === "producto" ? parseInt(inputStock.value) : null,
            imagen: document.getElementById("itemImg").value
        };

        if (inputId.value) {
            // EDITAR: Encontrar el index y reemplazar
            const index = inventario.findIndex(i => i.id === parseInt(inputId.value));
            if (index !== -1) inventario[index] = nuevoItem;
            alert("Ítem actualizado correctamente");
        } else {
            // CREAR: Agregar al array
            inventario.push(nuevoItem);
            alert("Ítem agregado al inventario");
        }

        guardarInventario(inventario);
        resetearFormulario();
    });

    // --- Funciones Globales para los botones de la tabla ---
    window.eliminarItem = function(id) {
        if (confirm("¿Seguro que deseas borrar este ítem del inventario?")) {
            let inventario = obtenerInventario();
            inventario = inventario.filter(item => item.id !== id); 
            guardarInventario(inventario);
        }
    };

    window.editarItem = function(id) {
        const inventario = obtenerInventario();
        const item = inventario.find(i => i.id === id);
        
        if (item) {
            formTitulo.textContent = "Editando Item: " + item.nombre;
            inputId.value = item.id;
            document.getElementById("itemNombre").value = item.nombre;
            document.getElementById("itemDesc").value = item.descripcion;
            document.getElementById("itemPrecio").value = item.precio;
            selectTipo.value = item.tipo;
            document.getElementById("itemImg").value = item.imagen;

            // Disparar manualmente el evento change para mostrar/ocultar stock
            selectTipo.dispatchEvent(new Event("change"));
            if (item.tipo === "producto") {
                inputStock.value = item.stock;
            }

            btnCancelar.style.display = "block";
            window.scrollTo(0, 0); 
        }
    };

    // Botón Cancelar Edición
    btnCancelar.addEventListener("click", resetearFormulario);

    function resetearFormulario() {
        formInventario.reset();
        inputId.value = "";
        formTitulo.textContent = "Agregar Nuevo Item";
        btnCancelar.style.display = "none";
        selectTipo.dispatchEvent(new Event("change")); 
    }

    renderizarTabla();
});
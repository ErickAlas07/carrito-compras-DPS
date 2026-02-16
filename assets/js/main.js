import {mostrarProductos} from '../js/modules/inventario.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando aplicación...');
    
    // Verificar en qué página estamos y mostrar productos si es necesario
    if (document.getElementById('lista-productos')) {
        mostrarProductos('lista-productos');
    }
}); 
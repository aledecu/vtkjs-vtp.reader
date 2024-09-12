// Importación de los 
import '../scss/styles.scss'
import '../scss/styles_control_panel.scss'
import '../scss/styles_header.scss'

import '@kitware/vtk.js/Rendering/Profiles/Geometry';
import '@kitware/vtk.js/Rendering/Profiles/Volume';
import '@kitware/vtk.js/Rendering/Profiles/Glyph';
import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkXMLPolyDataReader from '@kitware/vtk.js/IO/XML/XMLPolyDataReader';

// Definición de colores RGB para cada estructura
const color_rgb = [
  [1.000000, 0.000000, 0.000000],  // Rojo para estructura 1
  [1.000000, 0.560784, 0.941176],  // Rosa para estructura 2
  [0.000000, 1.000000, 0.000000],  // Verde para estructura 3
];

// Ruta base para los archivos VTP
const vtp_path = "./vtps/";

// Variable que contiene la ruta de un archivo VTP a cargar
const vtpFile =  vtp_path + 'estructura.vtp';
// Array que contiene las rutas completas de los archivos VTP a cargar
const vtpFiles = [
  vtp_path + 'estructura_1.vtp',  // Ruta para estructura 1
  vtp_path + 'estructura_2.vtp',  // Ruta para estructura 2
  vtp_path + 'estructura_3.vtp',  // Ruta para estructura 3
];

// Array de IDs de los checkboxes asociados con cada archivo VTP
const checkboxIds = [
  'chk_estructura_1',  // ID del checkbox para estructura 1
  'chk_estructura_2',  // ID del checkbox para estructura 2
  'chk_estructura_3',  // ID del checkbox para estructura 3
];

// Crear la ventana de renderizado a pantalla completa
const fullScreenRenderWindow = vtkFullScreenRenderWindow.newInstance({
  rootContainer: document.getElementById('container'),
  containerStyle: { width: '100%', height: '100%' },
});
const renderer = fullScreenRenderWindow.getRenderer();
const renderWindow = fullScreenRenderWindow.getRenderWindow();

// Configuración de la cámara inicial
const camera = renderer.getActiveCamera();
const orientation_default_camera = [-153.37809709399468, -0.19259069519352057, 0.5810544083189143, 0.7907493905770862];

camera.setOrientationWXYZ(...orientation_default_camera);

// Array para almacenar los actores (objetos 3D) cargados en la escena
const actors = [];

/**
 * Función para cargar todos los archivos VTP definidos en el array 'vtpFiles', 
 * crear actores y añadirlos al renderer.
 */
function loadVTP() {
  vtpFiles.forEach((file, index) => {
    const reader = vtkXMLPolyDataReader.newInstance();
    const mapper = vtkMapper.newInstance();
    const actor = vtkActor.newInstance();

    actor.setMapper(mapper);
    actor.getProperty().setColor(color_rgb[index]);
    actor.getProperty().setOpacity(1.0);

    mapper.setInputConnection(reader.getOutputPort());

    reader.setUrl(file).then(() => {
      reader.loadData().then(() => {
        renderer.addActor(actor);
        actors[index] = actor;  // Guardar el actor para usarlo después

        // Obtener el checkbox correspondiente al índice del actor para ajustar su visibilidad
        const checkbox = document.getElementById(checkboxIds[index]);
        if (checkbox) {
          // Establecer la visibilidad del actor basada en el estado del checkbox
          actor.setVisibility(checkbox.checked);
        }

        renderer.resetCamera();
        renderWindow.render();
      });
    }).catch((error) => {
      console.error(`Error al cargar el archivo VTP: ${file}`, error);
    });
  });
}

/**
 * Función para cargar un archivo VTP específico, crear un actor y añadirlo al renderer.
 * @param {string} file - Ruta del archivo VTP a cargar.
 * @param {Array} color - Array RGB que define el color del actor.
 */
function loadSingleVTP(file, color) {
  const reader = vtkXMLPolyDataReader.newInstance();
  const mapper = vtkMapper.newInstance();
  const actor = vtkActor.newInstance();

  actor.setMapper(mapper);
  actor.getProperty().setColor(color);
  actor.getProperty().setOpacity(0.1);

  mapper.setInputConnection(reader.getOutputPort());

  reader.setUrl(file).then(() => {
    reader.loadData().then(() => {
      renderer.addActor(actor);
      renderer.resetCamera();
      renderWindow.render();
    });
  }).catch((error) => {
    console.error(`Error al cargar el archivo VTP: ${file}`, error);
  });
}



// Esperar a que el documento esté completamente cargado antes de ejecutar el script
document.addEventListener('DOMContentLoaded', () => {

  // Asignar un evento de clic al botón para cargar el archivo VTP específico
  document.getElementById('loadVTPButton').addEventListener('click', () => {
    const file = vtpFile; 
    const color = [0.0, 0.0, 1.0]; 
    loadSingleVTP(file, color);
  });

  // Cargar todos los archivos VTP basados en el estado de los checkboxes
  loadVTP();

  // Asignar eventos de cambio a cada checkbox individualmente para controlar la visibilidad de las estructuras
  document.getElementById('chk_estructura_1').addEventListener('change', (event) => {
    toggleActorVisibility(event, 0);
  });
  document.getElementById('chk_estructura_2').addEventListener('change', (event) => {
    toggleActorVisibility(event, 1);
  });
  document.getElementById('chk_estructura_3').addEventListener('change', (event) => {
    toggleActorVisibility(event, 2);
  });
});

/**
 * Función para alternar la visibilidad de un actor cuando se cambia el estado de su checkbox.
 * @param {Event} event - El evento de cambio generado por el checkbox.
 * @param {number} index - El índice del actor correspondiente en el array 'actors'.
 */
function toggleActorVisibility(event, index) {
  if (actors[index]) {
    actors[index].setVisibility(event.target.checked);
    renderer.resetCamera();
    renderWindow.render();
  }
}


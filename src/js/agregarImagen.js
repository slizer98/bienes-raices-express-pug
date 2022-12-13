import { Dropzone } from 'dropzone';

const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

Dropzone.options.imagen = {
    dictDefaultMessage: 'Arrastre la imagen o da click aqui',
    acceptedFiles: '.png, .jpg, .jpeg',
    maxFilesize: 5,
    maxFiles: 1,
    parallelUploads: 1,
    autoProcessQueue: false,
    addRemoveLinks: true,
    dictRemoveFile: 'Eliminar',
    dictMaxFilesExceeded: 'No puedes subir mas de 5 imagenes',
    headers: {
        'CSRF-token': token
    },
    paramName: 'imagen',
    init: function() {
        const dropzone = this;
        const btnPublicar = document.querySelector('#publicar');

        btnPublicar.addEventListener('click', function() {
            dropzone.processQueue();
        });

        dropzone.on('queuecomplete', function() {
            if(dropzone.getActiveFiles().length === 0) {
                window.location.href = '/mis-propiedades';
            }
        })
    }

};
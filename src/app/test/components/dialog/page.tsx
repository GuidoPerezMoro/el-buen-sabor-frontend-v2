'use client'

import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import useDialog from '@/hooks/useDialog'
import CheckIcon from '@/assets/icons/check2.svg'
import WarningIcon from '@/assets/icons/exclamation-circle.svg'
import InfoIcon from '@/assets/icons/info-circle.svg'

export default function DialogTestPage() {
  const {openDialog, closeDialog} = useDialog()

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Pruebas de Diálogos</h1>

      <div className="flex flex-col items-center gap-4">
        <Button onClick={() => openDialog('simple')}>Dialog simple</Button>
        <Button onClick={() => openDialog('conIcono')}>Con ícono y mensaje</Button>
        <Button onClick={() => openDialog('soloTitulo')}>Solo título</Button>
        <Button onClick={() => openDialog('acciones')}>Con acciones</Button>
        <Button onClick={() => openDialog('large-content-dialog')}>Contenido grande</Button>
        <Button onClick={() => openDialog('fullscreen')}>Pantalla completa</Button>
      </div>

      {/* Simple */}
      <Dialog name="simple" title="Hola mundo" message="Este es un mensaje de prueba.">
        <p className="text-sm">Este contenido está dentro del diálogo.</p>
      </Dialog>

      {/* Con ícono y mensaje */}
      <Dialog
        name="conIcono"
        icon={InfoIcon}
        iconColor="text-primary"
        title="Información importante"
        message="Este diálogo incluye un ícono y colores personalizados."
      >
        <p className="text-sm">Contenido adicional que puedes colocar aquí.</p>
      </Dialog>

      {/* Solo título */}
      <Dialog name="soloTitulo" title="Solo título">
        <p className="text-sm">No hay ícono ni mensaje, solo el título.</p>
      </Dialog>

      {/* Con acciones */}
      <Dialog
        name="acciones"
        icon={WarningIcon}
        iconColor="text-danger"
        title="¿Estás seguro?"
        message="Esta acción no se puede deshacer."
        onSecondary={() => closeDialog('acciones')}
        onPrimary={() => {
          alert('Acción confirmada')
          closeDialog('acciones')
        }}
        secondaryLabel="Cancelar"
        primaryLabel="Aceptar"
      >
        <p className="text-sm">Puedes confirmar o cancelar la operación.</p>
      </Dialog>

      {/* Contenido grande */}
      <Dialog
        name="large-content-dialog"
        title="Large Content Example"
        onClose={() => console.log('Closed')}
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {Array.from({length: 30}).map((_, i) => (
            <p key={i} className="text-sm">
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Exercitationem, magni illo
              consequatur, a ut ipsum autem aut in aliquam asperiores molestiae voluptatibus neque
              quia, cumque provident fuga. Beatae, quibusdam minima.
            </p>
          ))}
        </div>
      </Dialog>

      {/* Fullscreen */}
      <Dialog
        name="fullscreen"
        title="Modo pantalla completa"
        message="Este diálogo ocupa toda la pantalla"
        fullscreen
        onPrimary={() => closeDialog('fullscreen')}
        primaryLabel="Cerrar"
        icon={CheckIcon}
        iconColor="text-success"
      >
        <p className="text-sm">Ideal para formularios grandes u operaciones complejas.</p>
      </Dialog>
    </main>
  )
}

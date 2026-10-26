import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Avatar, BarChart, Badge, Button, ConfirmDialog, Dialog, EmptyState, Field, Notice, Sheet, StatTile } from './ui';

describe('Button', () => {
  it('ejecuta la acción al presionar', () => {
    const alPresionar = jest.fn();
    render(<Button title="Guardar" onPress={alPresionar} />);
    fireEvent.press(screen.getByText('Guardar'));
    expect(alPresionar).toHaveBeenCalledTimes(1);
  });

  it('no ejecuta la acción mientras carga o está deshabilitado', () => {
    const alPresionar = jest.fn();
    const { rerender } = render(<Button title="Guardar" onPress={alPresionar} loading />);
    fireEvent.press(screen.getByLabelText('Guardar'));
    rerender(<Button title="Guardar" onPress={alPresionar} disabled />);
    fireEvent.press(screen.getByText('Guardar'));
    expect(alPresionar).not.toHaveBeenCalled();
  });
});

describe('Field', () => {
  it('muestra el error y tiene prioridad sobre la ayuda', () => {
    render(<Field label="Email" error="Obligatorio" hint="Ayuda" />);
    expect(screen.getByText('Obligatorio')).toBeTruthy();
    expect(screen.queryByText('Ayuda')).toBeNull();
  });

  it('muestra la ayuda cuando no hay error', () => {
    render(<Field label="Email" hint="Ayuda" />);
    expect(screen.getByText('Ayuda')).toBeTruthy();
  });

  it('propaga los cambios de texto y el enfoque', () => {
    const alCambiar = jest.fn();
    const alEnfocar = jest.fn();
    const alDesenfocar = jest.fn();
    render(<Field label="Nombre" onChangeText={alCambiar} onFocus={alEnfocar} onBlur={alDesenfocar} />);
    const campo = screen.getByLabelText('Nombre');
    fireEvent(campo, 'focus');
    fireEvent.changeText(campo, 'Ana');
    fireEvent(campo, 'blur');
    expect(alCambiar).toHaveBeenCalledWith('Ana');
    expect(alEnfocar).toHaveBeenCalled();
    expect(alDesenfocar).toHaveBeenCalled();
  });
});

describe('piezas de presentación', () => {
  it('Avatar muestra la inicial', () => {
    render(<Avatar name="luz" />);
    expect(screen.getByText('L')).toBeTruthy();
  });

  it('Notice, Badge y EmptyState muestran su contenido', () => {
    render(
      <>
        <Notice tone="danger">Algo falló</Notice>
        <Badge label="Admin" tone="warning" />
        <EmptyState icon="search-outline" title="Sin resultados" message="Prueba otra cosa" />
      </>,
    );
    expect(screen.getByText('Algo falló')).toBeTruthy();
    expect(screen.getByText('Admin')).toBeTruthy();
    expect(screen.getByText('Sin resultados')).toBeTruthy();
    expect(screen.getByText('Prueba otra cosa')).toBeTruthy();
  });

  it('Dialog solo se ve cuando está visible y se cierra con OK', () => {
    const alCerrar = jest.fn();
    const { rerender } = render(<Dialog visible={false} title="Listo" message="Guardado" onClose={alCerrar} />);
    expect(screen.queryByText('Listo')).toBeNull();
    rerender(<Dialog visible title="Listo" message="Guardado" onClose={alCerrar} />);
    fireEvent.press(screen.getByText('OK'));
    expect(alCerrar).toHaveBeenCalled();
  });

  it('Sheet muestra su contenido y se cierra', () => {
    const alCerrar = jest.fn();
    render(
      <Sheet visible title="Detalle" onClose={alCerrar}>
        <Text>Contenido</Text>
      </Sheet>,
    );
    expect(screen.getByText('Contenido')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Close'));
    expect(alCerrar).toHaveBeenCalled();
  });

  it('BarChart etiqueta cada columna y redondea los valores', () => {
    render(<BarChart data={[8.46, 0, 4]} labels={['Mon', 'Tue', 'Wed']} />);
    expect(screen.getByText('8.5h')).toBeTruthy();
    expect(screen.getByText('4h')).toBeTruthy();
    expect(screen.getByText('Tue')).toBeTruthy();
  });

  it('ConfirmDialog pide confirmación y permite cancelar', () => {
    const alConfirmar = jest.fn();
    const alCancelar = jest.fn();
    render(
      <ConfirmDialog
        visible
        title="¿Eliminar?"
        message="No se puede deshacer"
        confirmLabel="Eliminar"
        onConfirm={alConfirmar}
        onCancel={alCancelar}
      />,
    );
    fireEvent.press(screen.getByText('Eliminar'));
    expect(alConfirmar).toHaveBeenCalledTimes(1);
    fireEvent.press(screen.getByText('Cancel'));
    expect(alCancelar).toHaveBeenCalledTimes(1);
  });

  it('StatTile muestra la etiqueta y el valor', () => {
    render(<StatTile label="Hours" value="8h 30m" icon="time-outline" tone="success" />);
    expect(screen.getByLabelText('Hours: 8h 30m')).toBeTruthy();
    expect(screen.getByText('8h 30m')).toBeTruthy();
  });
});

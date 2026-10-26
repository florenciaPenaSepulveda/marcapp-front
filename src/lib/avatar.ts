const COLORES = ['#0AA5F2', '#E8590C', '#2F9E44', '#9C36B5', '#C2255C', '#1971C2', '#E67700'];

export const colorDeAvatar = (nombre: string): string => {
  const suma = [...nombre].reduce((total, letra) => total + letra.charCodeAt(0), 0);
  return COLORES[suma % COLORES.length];
};

export const inicial = (nombre: string): string => nombre.trim().charAt(0).toUpperCase();

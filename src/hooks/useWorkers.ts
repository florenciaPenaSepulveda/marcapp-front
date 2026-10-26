import { useCallback, useEffect, useRef, useState } from 'react';
import { searchWorkerService, teamStatusService } from '../services/searchWorker.service';
import { EstadoDeHoy, Usuario } from '../services/types';

const ESPERA_DE_BUSQUEDA_MS = 350;

export const useWorkers = () => {
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<Usuario[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Record<number, EstadoDeHoy>>({});
  const solicitud = useRef(0);

  const cargarEstado = useCallback(async () => {
    const respuesta = await teamStatusService();
    if (respuesta.success) {
      setStatus(Object.fromEntries(respuesta.data.map((estado) => [estado.idUser, estado])));
    }
  }, []);

  const cargar = useCallback(async (termino: string, offset: number) => {
    const actual = ++solicitud.current;
    if (offset === 0) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    const respuesta = await searchWorkerService(termino, offset);
    if (actual !== solicitud.current) {
      return;
    }
    if (respuesta.success) {
      setError(null);
      setTotal(respuesta.data.total);
      setItems((previos) =>
        offset === 0 ? respuesta.data.items : [...previos, ...respuesta.data.items],
      );
    } else {
      setError(respuesta.message);
      if (offset === 0) {
        setItems([]);
        setTotal(0);
      }
    }
    setLoading(false);
    setLoadingMore(false);
  }, []);

  useEffect(() => {
    const espera = setTimeout(() => cargar(search, 0), search ? ESPERA_DE_BUSQUEDA_MS : 0);
    return () => clearTimeout(espera);
  }, [search, cargar]);

  useEffect(() => {
    cargarEstado();
  }, [cargarEstado]);

  const loadMore = useCallback(() => {
    if (!loading && !loadingMore && items.length < total) {
      cargar(search, items.length);
    }
  }, [cargar, items.length, loading, loadingMore, search, total]);

  const reload = useCallback(() => {
    cargar(search, 0);
    cargarEstado();
  }, [cargar, cargarEstado, search]);

  return {
    search,
    setSearch,
    items,
    total,
    loading,
    loadingMore,
    error,
    status,
    hasMore: items.length < total,
    loadMore,
    reload,
  };
};

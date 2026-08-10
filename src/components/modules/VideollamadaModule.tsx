import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Video, 
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Users
} from 'lucide-react';
import { salasVideollamadaMock, crearSalaVideollamada, gapsMock } from '@/data/mockData';

interface VideollamadaModuleProps {
  onVolver: () => void;
}

const VideollamadaModule: React.FC<VideollamadaModuleProps> = ({ onVolver }) => {
  const { usuario, tema } = useAuth();
  const [salas, setSalas] = useState(salasVideollamadaMock);
  const [salaActiva, setSalaActiva] = useState<string | null>(null);
  const [micActivo, setMicActivo] = useState(true);
  const [videoActivo, setVideoActivo] = useState(true);
  const [tiempoConexion, setTiempoConexion] = useState(0);

  const esPastorPrincipal = usuario?.rol === 'pastor_principal';
  const esTimoteo = usuario?.rol === 'timoteo';
  
  // Filtrar salas que el timoteo puede ver (solo las iniciadas por Pastor Principal)
  const salasVisiblesParaTimoteo = useMemo(() => {
    if (!esTimoteo) return salas;
    return salas.filter(sala => 
      sala.iniciadaPorRol === 'pastor_principal' && sala.activa
    );
  }, [salas, esTimoteo]);

  // Obtener GAPs activos
  const gapsActivos = gapsMock.filter(g => g.activo);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (salaActiva) {
      interval = setInterval(() => {
        setTiempoConexion(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [salaActiva]);

  const formatearTiempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const iniciarVideollamada = (gapId: string) => {
    if (usuario) {
      const gap = gapsMock.find(g => g.id === gapId);
      if (gap) {
        const nuevaSala = crearSalaVideollamada({
          gapId,
          gapCodigo: gap.codigo,
          iniciadaPor: usuario.id,
          iniciadaPorNombre: `${usuario.nombre} ${usuario.apellidos}`,
          iniciadaPorRol: usuario.rol,
          activa: true,
          participantes: [{
            usuarioId: usuario.id,
            nombre: `${usuario.nombre} ${usuario.apellidos}`,
            rol: usuario.rol,
            fechaUnion: new Date().toISOString(),
            activo: true,
          }],
        });
        setSalas([...salas, nuevaSala]);
        setSalaActiva(nuevaSala.id);
        setTiempoConexion(0);
      }
    }
  };

  const unirseASala = (salaId: string) => {
    if (usuario) {
      setSalas(salas.map(sala => {
        if (sala.id === salaId) {
          const yaUnido = sala.participantes.some(p => p.usuarioId === usuario.id);
          if (!yaUnido) {
            return {
              ...sala,
              participantes: [...sala.participantes, {
                usuarioId: usuario.id,
                nombre: `${usuario.nombre} ${usuario.apellidos}`,
                rol: usuario.rol,
                fechaUnion: new Date().toISOString(),
                activo: true,
              }]
            };
          }
        }
        return sala;
      }));
      setSalaActiva(salaId);
      setTiempoConexion(0);
    }
  };

  const finalizarLlamada = () => {
    if (salaActiva) {
      setSalas(salas.map(sala => 
        sala.id === salaActiva ? { ...sala, activa: false } : sala
      ));
      setSalaActiva(null);
      setTiempoConexion(0);
    }
  };

  const salaActual = salas.find(s => s.id === salaActiva);

  // Vista de videollamada activa
  if (salaActiva && salaActual) {
    return (
      <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={finalizarLlamada} className="text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-white font-semibold">Videollamada - {salaActual.gapCodigo}</h2>
              <p className="text-gray-400 text-sm">{formatearTiempo(tiempoConexion)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-600">
              <Users className="w-3 h-3 mr-1" />
              {salaActual.participantes.length}
            </Badge>
          </div>
        </div>

        {/* Área de video */}
        <div className="flex-1 p-4 grid grid-cols-2 md:grid-cols-3 gap-4 overflow-auto">
          {/* Video del usuario */}
          <div className="relative bg-gray-700 rounded-lg aspect-video flex items-center justify-center">
            {videoActivo ? (
              <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 rounded-lg flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {usuario?.nombre?.charAt(0)}{usuario?.apellidos?.charAt(0)}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <VideoOff className="w-12 h-12 text-gray-500" />
                <span className="text-gray-500 mt-2">Cámara Apagada</span>
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-sm">
              {usuario?.nombre} {usuario?.apellidos} (Tú)
            </div>
          </div>

          {/* Videos de otros participantes */}
          {salaActual.participantes
            .filter(p => p.usuarioId !== usuario?.id)
            .map((participante) => (
              <div key={participante.usuarioId} className="relative bg-gray-700 rounded-lg aspect-video flex items-center justify-center">
                <div className="w-full h-full bg-gradient-to-br from-green-900 to-teal-900 rounded-lg flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {participante.nombre?.charAt(0)}{participante.nombre?.split(' ')[1]?.charAt(0)}
                  </span>
                </div>
                <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-sm">
                  {participante.nombre}
                </div>
              </div>
            ))}
        </div>

        {/* Controles */}
        <div className="bg-gray-800 p-4 flex items-center justify-center gap-4">
          <Button
            variant={micActivo ? "outline" : "secondary"}
            size="lg"
            onClick={() => setMicActivo(!micActivo)}
            className={`rounded-full w-14 h-14 ${!micActivo ? 'bg-red-600 hover:bg-red-700' : ''}`}
          >
            {micActivo ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </Button>
          <Button
            variant={videoActivo ? "outline" : "secondary"}
            size="lg"
            onClick={() => setVideoActivo(!videoActivo)}
            className={`rounded-full w-14 h-14 ${!videoActivo ? 'bg-red-600 hover:bg-red-700' : ''}`}
          >
            {videoActivo ? <VideoIcon className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </Button>
          <Button
            variant="destructive"
            size="lg"
            onClick={finalizarLlamada}
            className="rounded-full w-16 h-16 bg-red-600 hover:bg-red-700"
          >
            <PhoneOff className="w-8 h-8" />
          </Button>
        </div>
      </div>
    );
  }

  // Vista de lista de salas
  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onVolver} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Videollamadas GAP</h1>
        </div>
      </div>

      {/* GAPs disponibles para videollamada */}
      {esPastorPrincipal && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Iniciar Videollamada</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gapsActivos.map((gap) => (
              <Card key={gap.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{gap.codigo}</h3>
                      <p className="text-sm text-gray-500">Líder: {gap.liderGapNombre}</p>
                    </div>
                    <Button
                      onClick={() => iniciarVideollamada(gap.id)}
                      className="text-white"
                      style={{ backgroundColor: tema.primario }}
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Iniciar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Salas activas */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {esTimoteo ? 'Llamadas del Pastor Principal' : 'Llamadas En Curso'}
        </h2>
        
        {salasVisiblesParaTimoteo.filter(s => s.activa).length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Video className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500">
                {esTimoteo 
                  ? 'No hay videollamadas activas del Pastor Principal' 
                  : 'No Hay Videollamadas Activas'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {salasVisiblesParaTimoteo.filter(s => s.activa).map((sala) => (
              <Card key={sala.id} className="hover:shadow-md transition-shadow border-green-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <Video className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{sala.gapCodigo}</h3>
                        <p className="text-sm text-gray-500">
                          Iniciada Por: {sala.iniciadaPorNombre}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            <Users className="w-3 h-3 mr-1" />
                            {sala.participantes.length} Participantes
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => unirseASala(sala.id)}
                      className="text-white bg-green-600 hover:bg-green-700"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Unirse
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideollamadaModule;

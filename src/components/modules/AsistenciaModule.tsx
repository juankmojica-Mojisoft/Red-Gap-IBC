import React, { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  Save,
  AlertCircle,
  Clock,
  MapPin,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  gapsMock, 
  asistenciasMock,
  crearRegistroAsistencia,
  getMiembrosByGAP
} from '@/data/mockData';
import { subWeeks } from 'date-fns';

interface AsistenciaModuleProps {
  onVolver: () => void;
}

const AsistenciaModule: React.FC<AsistenciaModuleProps> = ({ onVolver }) => {
  const { usuario, tema } = useAuth();
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split('T')[0]);
  const [guardando, setGuardando] = useState(false);
  const [asistenciasLocal, setAsistenciasLocal] = useState<Record<string, boolean>>({});
  const [nuevosMiembros, setNuevosMiembros] = useState(0);
  const [visitantes, setVisitantes] = useState(0);
  const [observaciones, setObservaciones] = useState('');

  // Obtener el GAP del usuario
  const gapUsuario = useMemo(() => {
    if (!usuario) return null;
    if (usuario.rol === 'timoteo') {
      return gapsMock.find(g => g.timoteoId === usuario.id);
    }
    if (usuario.rol === 'lider_gap') {
      return gapsMock.find(g => g.liderGapId === usuario.id);
    }
    if (usuario.gapId) {
      return gapsMock.find(g => g.id === usuario.gapId);
    }
    return null;
  }, [usuario]);

  // Obtener miembros del GAP
  const miembrosGAP = useMemo(() => {
    if (!gapUsuario) return [];
    return getMiembrosByGAP(gapUsuario.id);
  }, [gapUsuario]);

  // Verificar si ya hay registro para esta fecha
  const registroExistente = useMemo(() => {
    if (!gapUsuario) return null;
    return asistenciasMock.find(a => 
      a.gapId === gapUsuario.id && 
      a.fecha === fechaSeleccionada
    );
  }, [gapUsuario, fechaSeleccionada]);

  // Estadísticas de asistencia
  const estadisticas = useMemo(() => {
    if (!gapUsuario) return null;
    
    const registrosGAP = asistenciasMock.filter(a => a.gapId === gapUsuario.id);
    const ultimas4Semanas = registrosGAP.filter(a => {
      const fechaRegistro = new Date(a.fecha);
      const hace4Semanas = subWeeks(new Date(), 4);
      return fechaRegistro >= hace4Semanas;
    });
    
    const totalAsistencias = ultimas4Semanas.reduce((sum, r) => sum + r.totalAsistentes, 0);
    const promedioAsistencia = ultimas4Semanas.length > 0 
      ? Math.round(totalAsistencias / ultimas4Semanas.length) 
      : 0;
    
    const totalMiembros = miembrosGAP.length + 2; // +2 por líder y timoteo
    const porcentajeAsistencia = totalMiembros > 0 
      ? Math.round((promedioAsistencia / totalMiembros) * 100) 
      : 0;

    return {
      promedioAsistencia,
      porcentajeAsistencia,
      totalReuniones: ultimas4Semanas.length,
      nuevosUltimoMes: ultimas4Semanas.reduce((sum, r) => sum + r.nuevosMiembros, 0),
      visitantesUltimoMes: ultimas4Semanas.reduce((sum, r) => sum + r.visitantes, 0),
    };
  }, [gapUsuario, miembrosGAP.length]);

  // Inicializar asistencias desde registro existente
  React.useEffect(() => {
    if (registroExistente) {
      const asistencias: Record<string, boolean> = {};
      registroExistente.asistencias.forEach(a => {
        asistencias[a.miembroId] = a.presente;
      });
      setAsistenciasLocal(asistencias);
      setNuevosMiembros(registroExistente.nuevosMiembros);
      setVisitantes(registroExistente.visitantes);
      setObservaciones(registroExistente.observaciones || '');
    } else {
      setAsistenciasLocal({});
      setNuevosMiembros(0);
      setVisitantes(0);
      setObservaciones('');
    }
  }, [registroExistente]);

  const toggleAsistencia = (miembroId: string) => {
    setAsistenciasLocal(prev => ({
      ...prev,
      [miembroId]: !prev[miembroId]
    }));
  };

  const handleGuardar = async () => {
    if (!usuario || !gapUsuario) return;

    setGuardando(true);
    
    // Preparar datos de asistencias
    const asistenciasData = miembrosGAP.map(miembro => ({
      miembroId: miembro.id,
      presente: asistenciasLocal[miembro.id] || false,
    }));

    // Agregar asistencia del líder y timoteo si están presentes
    if (asistenciasLocal['lider']) {
      asistenciasData.push({ miembroId: 'lider', presente: true });
    }
    if (asistenciasLocal['timoteo']) {
      asistenciasData.push({ miembroId: 'timoteo', presente: true });
    }

    const totalAsistentes = asistenciasData.filter(a => a.presente).length;

    // Crear o actualizar registro
    crearRegistroAsistencia({
      gapId: gapUsuario.id,
      fecha: fechaSeleccionada,
      asistencias: asistenciasData,
      totalAsistentes,
      nuevosMiembros,
      visitantes,
      observaciones,
      registradoPor: usuario.id,
      registradoPorNombre: `${usuario.nombre} ${usuario.apellidos}`,
    });

    await new Promise(resolve => setTimeout(resolve, 800));
    
    setGuardando(false);
    toast.success(registroExistente ? 'Asistencia actualizada' : 'Asistencia registrada exitosamente');
  };

  if (!gapUsuario) {
    return (
      <div className="p-6 max-w-4xl mx-auto animate-fade-in">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={onVolver}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold">Registro de Asistencia</h1>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-orange-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes un GAP asignado</h3>
            <p className="text-gray-500">Contacta a tu pastor para que te asigne a un GAP.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalPresentes = Object.values(asistenciasLocal).filter(Boolean).length;
  const totalMiembros = miembrosGAP.length + 2; // + líder y timoteo

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto animate-fade-in pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onVolver}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold">Registro de Asistencia</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            <MapPin className="w-3 h-3 mr-1" />
            {gapUsuario.codigo}
          </Badge>
        </div>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold" style={{ color: tema.primario }}>
                {estadisticas.porcentajeAsistencia}%
              </p>
              <p className="text-xs text-gray-500">Promedio Asistencia</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold" style={{ color: tema.exito }}>
                {estadisticas.promedioAsistencia}
              </p>
              <p className="text-xs text-gray-500">Asistentes Promedio</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold" style={{ color: tema.secundario }}>
                {estadisticas.nuevosUltimoMes}
              </p>
              <p className="text-xs text-gray-500">Nuevos (Últ. Mes)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold" style={{ color: tema.info }}>
                {estadisticas.visitantesUltimoMes}
              </p>
              <p className="text-xs text-gray-500">Visitantes (Últ. Mes)</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Formulario de asistencia */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5" style={{ color: tema.primario }} />
            Registrar Asistencia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Fecha */}
          <div className="space-y-2">
            <Label htmlFor="fecha">Fecha de la Reunión</Label>
            <Input
              id="fecha"
              type="date"
              value={fechaSeleccionada}
              onChange={(e) => setFechaSeleccionada(e.target.value)}
              className="max-w-xs"
            />
          </div>

          {/* Lista de miembros */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium flex items-center gap-2">
                <Users className="w-4 h-4" style={{ color: tema.primario }} />
                Miembros del GAP
              </h3>
              <Badge variant="outline">
                {totalPresentes} / {totalMiembros} presentes
              </Badge>
            </div>

            <div className="border rounded-lg divide-y">
              {/* Líder del GAP */}
              <div className="flex items-center justify-between p-3 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: tema.primario }}
                  >
                    {gapUsuario.liderGapNombre.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{gapUsuario.liderGapNombre}</p>
                    <p className="text-xs text-gray-500">Líder del GAP</p>
                  </div>
                </div>
                <Checkbox
                  checked={asistenciasLocal['lider'] || false}
                  onCheckedChange={() => toggleAsistencia('lider')}
                />
              </div>

              {/* Timoteo */}
              <div className="flex items-center justify-between p-3 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: tema.secundario }}
                  >
                    {gapUsuario.timoteoNombre.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{gapUsuario.timoteoNombre}</p>
                    <p className="text-xs text-gray-500">Timoteo</p>
                  </div>
                </div>
                <Checkbox
                  checked={asistenciasLocal['timoteo'] || false}
                  onCheckedChange={() => toggleAsistencia('timoteo')}
                />
              </div>

              {/* Miembros */}
              {miembrosGAP.map((miembro) => (
                <div key={miembro.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: tema.info }}
                    >
                      {miembro.nombres.charAt(0)}{miembro.apellidos.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{miembro.nombres} {miembro.apellidos}</p>
                      <p className="text-xs text-gray-500">Miembro</p>
                    </div>
                  </div>
                  <Checkbox
                    checked={asistenciasLocal[miembro.id] || false}
                    onCheckedChange={() => toggleAsistencia(miembro.id)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Nuevos miembros y visitantes */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nuevosMiembros">Nuevos Miembros</Label>
              <Input
                id="nuevosMiembros"
                type="number"
                min={0}
                value={nuevosMiembros}
                onChange={(e) => setNuevosMiembros(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="visitantes">Visitantes</Label>
              <Input
                id="visitantes"
                type="number"
                min={0}
                value={visitantes}
                onChange={(e) => setVisitantes(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observaciones" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Observaciones
            </Label>
            <textarea
              id="observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Notas sobre la reunión, peticiones, etc."
              className="w-full min-h-[100px] p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Botón guardar */}
          <Button 
            onClick={handleGuardar}
            disabled={guardando}
            className="w-full text-white"
            style={{ backgroundColor: tema.primario }}
          >
            {guardando ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {registroExistente ? 'Actualizar Asistencia' : 'Guardar Asistencia'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AsistenciaModule;

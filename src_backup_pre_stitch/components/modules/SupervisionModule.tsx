import React, { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { formatearHora12 } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Target,
  Lightbulb,
  MapPin,
  Activity,
  Search,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  getGAPsByLiderMentor,
  getMiembrosByGAP,
  getAsistenciasByGAP,
  getEscalamientosByUsuario,
  usuariosMock
} from '@/data/mockData';
import { subWeeks } from 'date-fns';

interface SupervisionModuleProps {
  onVolver: () => void;
}

const SupervisionModule: React.FC<SupervisionModuleProps> = ({ onVolver }) => {
  const { usuario, tema } = useAuth();
  const [gapExpandido, setGapExpandido] = useState<string | null>(null);
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activo' | 'atencion' | 'critico'>('todos');

  const misGAPs = useMemo(() => {
    if (!usuario) return [];
    return getGAPsByLiderMentor(usuario.id);
  }, [usuario]);

  // Líderes y timoteos bajo supervisión (para futuras expansiones)
  useMemo(() => {
    if (!usuario) return { lideres: [], timoteos: [] };
    const lideres = usuariosMock.filter(u => u.rol === 'lider_gap' && u.liderMentorId === usuario.id);
    const timoteos = usuariosMock.filter(u => u.rol === 'timoteo');
    return { lideres, timoteos };
  }, [usuario]);

  const escalamientos = useMemo(() => {
    if (!usuario) return [];
    return getEscalamientosByUsuario(usuario);
  }, [usuario]);

  // Análisis de cada GAP
  const analisisGAPs = useMemo(() => {
    return misGAPs.map(gap => {
      const miembros = getMiembrosByGAP(gap.id);
      const asistencias = getAsistenciasByGAP(gap.id);
      const escalamientosGAP = escalamientos.filter(e => e.gapId === gap.id);
      
      // Calcular asistencia promedio últimas 4 semanas
      const ultimas4Semanas = asistencias.filter(a => {
        const fechaRegistro = new Date(a.fecha);
        const hace4Semanas = subWeeks(new Date(), 4);
        return fechaRegistro >= hace4Semanas;
      });
      
      // Calcular porcentaje de asistencia (total asistentes vs total miembros + 2 por líder y timoteo)
      const totalMiembrosGAP = miembros.length + 2; // +2 por líder y timoteo
      const promedioAsistencia = ultimas4Semanas.length > 0
        ? Math.round(ultimas4Semanas.reduce((sum, r) => sum + (r.totalAsistentes / totalMiembrosGAP * 100), 0) / ultimas4Semanas.length)
        : 0;
      
      // Determinar estado del GAP
      let estado: 'activo' | 'atencion' | 'critico' = 'activo';
      const escalamientosAbiertos = escalamientosGAP.filter(e => e.estado === 'Abierto' || e.estado === 'En Tratamiento').length;
      if (promedioAsistencia < 50 || escalamientosAbiertos > 3) {
        estado = 'critico';
      } else if (promedioAsistencia < 70 || escalamientosAbiertos > 0) {
        estado = 'atencion';
      }
      
      // Detectar problemas
      const problemas: string[] = [];
      if (promedioAsistencia < 70) problemas.push('Baja asistencia');
      if (miembros.length === 0) problemas.push('Sin integrantes registrados');
      if (escalamientosAbiertos > 0) problemas.push('Casos pendientes');
      if (!gap.reunionConfirmada) problemas.push('Reunión no confirmada');
      
      // Mejores prácticas
      const mejoresPracticas: string[] = [];
      if (promedioAsistencia >= 85) mejoresPracticas.push('Excelente asistencia');
      if (miembros.length >= 10) mejoresPracticas.push('GAP numeroso');
      if (escalamientosGAP.filter(e => e.estado === 'Cerrado').length > 5) mejoresPracticas.push('Buena gestión de casos');
      if (gap.reunionConfirmada) mejoresPracticas.push('Reuniones confirmadas');
      
      return {
        ...gap,
        miembrosCount: miembros.length,
        promedioAsistencia,
        escalamientosPendientes: escalamientosGAP.filter(e => e.estado === 'Abierto' || e.estado === 'En Tratamiento').length,
        escalamientosTotal: escalamientosGAP.length,
        estado,
        problemas,
        mejoresPracticas,
      };
    });
  }, [misGAPs, escalamientos]);

  // Filtrar GAPs
  const gapsFiltrados = useMemo(() => {
    return analisisGAPs.filter(gap => {
      const coincideBusqueda = 
        gap.codigo.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
        gap.barrio.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
        gap.liderGapNombre.toLowerCase().includes(filtroBusqueda.toLowerCase());
      
      const coincideEstado = filtroEstado === 'todos' || gap.estado === filtroEstado;
      
      return coincideBusqueda && coincideEstado;
    });
  }, [analisisGAPs, filtroBusqueda, filtroEstado]);

  // Estadísticas generales
  const estadisticas = useMemo(() => {
    const totalGAPs = misGAPs.length;
    const gapsActivos = analisisGAPs.filter(g => g.estado === 'activo').length;
    const gapsAtencion = analisisGAPs.filter(g => g.estado === 'atencion').length;
    const gapsCriticos = analisisGAPs.filter(g => g.estado === 'critico').length;
    const promedioAsistenciaGeneral = analisisGAPs.length > 0
      ? Math.round(analisisGAPs.reduce((sum, g) => sum + g.promedioAsistencia, 0) / analisisGAPs.length)
      : 0;
    const totalIntegrantes = analisisGAPs.reduce((sum, g) => sum + g.miembrosCount, 0);
    const totalEscalamientosPendientes = analisisGAPs.reduce((sum, g) => sum + g.escalamientosPendientes, 0);
    
    return {
      totalGAPs,
      gapsActivos,
      gapsAtencion,
      gapsCriticos,
      promedioAsistenciaGeneral,
      totalIntegrantes,
      totalEscalamientosPendientes,
    };
  }, [misGAPs, analisisGAPs]);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo': return 'bg-green-100 text-green-700 border-green-300';
      case 'atencion': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'critico': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'activo': return 'Activo';
      case 'atencion': return 'Requiere Atención';
      case 'critico': return 'Crítico';
      default: return estado;
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onVolver} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Supervisión de Estructura</h1>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500">GAPs Supervisados</p>
                <h3 className="text-2xl font-bold mt-1">{estadisticas.totalGAPs}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${tema.primario}20` }}>
                <MapPin className="w-5 h-5" style={{ color: tema.primario }} />
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <Badge className="bg-green-100 text-green-700 text-xs">{estadisticas.gapsActivos} Activos</Badge>
              <Badge className="bg-yellow-100 text-yellow-700 text-xs">{estadisticas.gapsAtencion} Atención</Badge>
              <Badge className="bg-red-100 text-red-700 text-xs">{estadisticas.gapsCriticos} Críticos</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500">Total Integrantes</p>
                <h3 className="text-2xl font-bold mt-1">{estadisticas.totalIntegrantes}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${tema.info}20` }}>
                <Users className="w-5 h-5" style={{ color: tema.info }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500">Asistencia Promedio</p>
                <h3 className="text-2xl font-bold mt-1">{estadisticas.promedioAsistenciaGeneral}%</h3>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${tema.exito}20` }}>
                <Activity className="w-5 h-5" style={{ color: tema.exito }} />
              </div>
            </div>
            <Progress value={estadisticas.promedioAsistenciaGeneral} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500">Casos Pendientes</p>
                <h3 className="text-2xl font-bold mt-1">{estadisticas.totalEscalamientosPendientes}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${tema.advertencia}20` }}>
                <AlertTriangle className="w-5 h-5" style={{ color: tema.advertencia }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs con herramientas */}
      <Tabs defaultValue="gaps" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="gaps">GAPs</TabsTrigger>
          <TabsTrigger value="alertas">Alertas y Problemas</TabsTrigger>
          <TabsTrigger value="mejores">Mejores Prácticas</TabsTrigger>
        </TabsList>

        {/* Tab GAPs */}
        <TabsContent value="gaps" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por código, barrio o líder..."
                    value={filtroBusqueda}
                    onChange={(e) => setFiltroBusqueda(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={filtroEstado === 'todos' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFiltroEstado('todos')}
                  >
                    Todos
                  </Button>
                  <Button
                    variant={filtroEstado === 'activo' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFiltroEstado('activo')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Activos
                  </Button>
                  <Button
                    variant={filtroEstado === 'atencion' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFiltroEstado('atencion')}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    Atención
                  </Button>
                  <Button
                    variant={filtroEstado === 'critico' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFiltroEstado('critico')}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Críticos
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de GAPs */}
          <div className="space-y-3">
            {gapsFiltrados.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MapPin className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">No se encontraron GAPs</p>
                </CardContent>
              </Card>
            ) : (
              gapsFiltrados.map((gap) => (
                <Card key={gap.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    {/* Header del GAP */}
                    <div 
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setGapExpandido(gapExpandido === gap.id ? null : gap.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{gap.codigo}</h3>
                            <Badge className={getEstadoColor(gap.estado)}>
                              {getEstadoLabel(gap.estado)}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-gray-600">
                            <div><span className="text-gray-400">Líder:</span> {gap.liderGapNombre}</div>
                            <div><span className="text-gray-400">Timoteo:</span> {gap.timoteoNombre}</div>
                            <div><span className="text-gray-400">Barrio:</span> {gap.barrio}</div>
                            <div><span className="text-gray-400">Integrantes:</span> {gap.miembrosCount}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xs text-gray-400">Asistencia</p>
                            <p className={`font-semibold ${gap.promedioAsistencia >= 70 ? 'text-green-600' : gap.promedioAsistencia >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {gap.promedioAsistencia}%
                            </p>
                          </div>
                          {gapExpandido === gap.id ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Detalle expandido */}
                    {gapExpandido === gap.id && (
                      <div className="border-t p-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Información general */}
                          <div>
                            <h4 className="font-medium text-sm text-gray-700 mb-2">Información del GAP</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Día de reunión:</span>
                                <span>{gap.diaReunion} {formatearHora12(gap.horaReunion)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Modalidad:</span>
                                <span>{gap.modalidad}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Ubicación:</span>
                                <span>{gap.ubicacionReunion}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Pastor:</span>
                                <span>{gap.pastorNombre}</span>
                              </div>
                            </div>
                          </div>

                          {/* Problemas detectados */}
                          <div>
                            <h4 className="font-medium text-sm text-gray-700 mb-2">Análisis</h4>
                            {gap.problemas.length > 0 && (
                              <div className="mb-3">
                                <p className="text-xs text-red-600 font-medium mb-1">Problemas detectados:</p>
                                <ul className="space-y-1">
                                  {gap.problemas.map((problema, idx) => (
                                    <li key={idx} className="text-xs text-red-600 flex items-center gap-1">
                                      <AlertTriangle className="w-3 h-3" />
                                      {problema}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {gap.mejoresPracticas.length > 0 && (
                              <div>
                                <p className="text-xs text-green-600 font-medium mb-1">Fortalezas:</p>
                                <ul className="space-y-1">
                                  {gap.mejoresPracticas.map((practica, idx) => (
                                    <li key={idx} className="text-xs text-green-600 flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3" />
                                      {practica}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Acciones recomendadas */}
                        {gap.estado !== 'activo' && (
                          <div className="mt-4 p-3 bg-white rounded-lg border">
                            <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-2">
                              <Lightbulb className="w-4 h-4" style={{ color: tema.primario }} />
                              Acciones Recomendadas
                            </h4>
                            <ul className="space-y-1 text-sm text-gray-600">
                              {gap.promedioAsistencia < 70 && (
                                <li>• Contactar al líder para identificar causas de baja asistencia</li>
                              )}
                              {gap.escalamientosPendientes > 0 && (
                                <li>• Revisar y dar seguimiento a los casos pendientes</li>
                              )}
                              {!gap.reunionConfirmada && (
                                <li>• Solicitar confirmación de la próxima reunión</li>
                              )}
                              {gap.miembrosCount === 0 && (
                                <li>• Apoyar al líder en el proceso de reclutamiento de integrantes</li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Tab Alertas */}
        <TabsContent value="alertas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                GAPs que Requieren Atención
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analisisGAPs.filter(g => g.estado !== 'activo').length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-2" />
                  <p className="text-green-600 font-medium">¡Todos los GAPs están funcionando bien!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {analisisGAPs.filter(g => g.estado !== 'activo').map((gap) => (
                    <div key={gap.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{gap.codigo} - {gap.barrio}</h4>
                        <Badge className={getEstadoColor(gap.estado)}>
                          {getEstadoLabel(gap.estado)}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {gap.problemas.map((problema, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-red-600">
                            <AlertTriangle className="w-4 h-4" />
                            {problema}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Mejores Prácticas */}
        <TabsContent value="mejores" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Target className="w-5 h-5" />
                GAPs con Mejores Prácticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analisisGAPs.filter(g => g.mejoresPracticas.length > 0).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Aún no se han identificado mejores prácticas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {analisisGAPs.filter(g => g.mejoresPracticas.length > 0).map((gap) => (
                    <div key={gap.id} className="p-4 border rounded-lg bg-green-50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{gap.codigo} - {gap.barrio}</h4>
                        <Badge className="bg-green-100 text-green-700">
                          {gap.promedioAsistencia}% Asistencia
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {gap.mejoresPracticas.map((practica, idx) => (
                          <Badge key={idx} variant="outline" className="bg-white">
                            <CheckCircle2 className="w-3 h-3 mr-1 text-green-600" />
                            {practica}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupervisionModule;

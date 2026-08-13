import React, { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Progress } from '@/components/ui/progress';
import { 
  Network, 
  Users, 
  TrendingUp, 
  CheckCircle,
  AlertCircle,
  Search,
  ChevronRight,
  UserCheck,
  Droplets,
  BarChart3,
  Activity
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { miembrosMock, getGAPsByPastor } from '@/data/mockData';



interface EstadisticaGAP {
  id: string;
  codigo: string;
  lider: string;
  timoteo: string;
  totalMiembros: number;
  asistenciaPromedio: number;
  nuevosEsteMes: number;
  bautizos: number;
  graduadosEFC: number;
  estado: 'Activo' | 'Atencion' | 'Critico';
  ultimaReunion: string;
  barrio: string;
}

const RedGAPPastorModule: React.FC = () => {
  const { usuario, tema } = useAuth();
  const [vista, setVista] = useState<'lista' | 'mapa' | 'estadisticas'>('lista');
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  // Obtener GAPs del pastor
  const misGAPs = useMemo(() => {
    return getGAPsByPastor(usuario?.id || '');
  }, [usuario]);

  // Calcular estadísticas por GAP
  const estadisticasGAPs: EstadisticaGAP[] = useMemo(() => {
    return misGAPs.map(gap => {
      const miembrosGAP = miembrosMock.filter(m => m.gapId === gap.id);
      const asistenciaPromedio = Math.floor(Math.random() * 30) + 70; // Simulado
      const nuevosEsteMes = Math.floor(Math.random() * 3);
      const bautizos = miembrosGAP.filter(m => m.esBautizado).length;
      const graduadosEFC = miembrosGAP.filter(m => m.escuelaFormacion === 'Graduado').length;
      
      let estado: 'Activo' | 'Atencion' | 'Critico' = 'Activo';
      if (asistenciaPromedio < 50) estado = 'Critico';
      else if (asistenciaPromedio < 70) estado = 'Atencion';

      return {
        id: gap.id,
        codigo: gap.codigo,
        lider: gap.liderGapNombre,
        timoteo: gap.timoteoNombre,
        totalMiembros: miembrosGAP.length + 2, // +2 por líder y timoteo
        asistenciaPromedio,
        nuevosEsteMes,
        bautizos,
        graduadosEFC,
        estado,
        ultimaReunion: gap.fechaReunionConfirmada || 'No confirmada',
        barrio: gap.barrio,
      };
    });
  }, [misGAPs]);

  // Filtrar GAPs
  const gapsFiltrados = estadisticasGAPs.filter(g => {
    const coincideBusqueda = g.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
                            g.lider.toLowerCase().includes(busqueda.toLowerCase()) ||
                            g.barrio.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado = filtroEstado === 'todos' || g.estado === filtroEstado;
    return coincideBusqueda && coincideEstado;
  });

  // Estadísticas generales
  const statsGenerales = useMemo(() => {
    const totalGAPs = estadisticasGAPs.length;
    const totalMiembros = estadisticasGAPs.reduce((acc, g) => acc + g.totalMiembros, 0);
    const asistenciaGeneral = Math.round(
      estadisticasGAPs.reduce((acc, g) => acc + g.asistenciaPromedio, 0) / (totalGAPs || 1)
    );
    const gapsActivos = estadisticasGAPs.filter(g => g.estado === 'Activo').length;
    const gapsAtencion = estadisticasGAPs.filter(g => g.estado === 'Atencion').length;
    const gapsCriticos = estadisticasGAPs.filter(g => g.estado === 'Critico').length;
    const totalBautizos = estadisticasGAPs.reduce((acc, g) => acc + g.bautizos, 0);
    const totalGraduados = estadisticasGAPs.reduce((acc, g) => acc + g.graduadosEFC, 0);

    return {
      totalGAPs,
      totalMiembros,
      asistenciaGeneral,
      gapsActivos,
      gapsAtencion,
      gapsCriticos,
      totalBautizos,
      totalGraduados,
    };
  }, [estadisticasGAPs]);

  // Datos para gráficos
  const datosAsistencia = estadisticasGAPs.map(g => ({
    name: g.codigo,
    asistencia: g.asistenciaPromedio,
  }));

  const datosMiembros = estadisticasGAPs.map(g => ({
    name: g.codigo,
    miembros: g.totalMiembros,
  }));

  const datosEstado = [
    { name: 'Activos', value: statsGenerales.gapsActivos, color: '#22c55e' },
    { name: 'Atención', value: statsGenerales.gapsAtencion, color: '#f59e0b' },
    { name: 'Críticos', value: statsGenerales.gapsCriticos, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const datosCrecimiento = [
    { mes: 'Ene', miembros: 45, bautizos: 3 },
    { mes: 'Feb', miembros: 48, bautizos: 2 },
    { mes: 'Mar', miembros: 52, bautizos: 4 },
    { mes: 'Abr', miembros: 55, bautizos: 1 },
    { mes: 'May', miembros: 58, bautizos: 3 },
    { mes: 'Jun', miembros: 62, bautizos: 5 },
  ];

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Activo': return 'bg-green-100 text-green-800 border-green-200';
      case 'Atencion': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Critico': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'Activo': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Atencion': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'Critico': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mi Red de GAPs</h2>
          <p className="text-gray-500">Visualización y estadísticas de tus grupos</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={vista === 'lista' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setVista('lista')}
            style={vista === 'lista' ? { backgroundColor: tema.primario } : {}}
            className={vista === 'lista' ? 'text-white' : ''}
          >
            <Network className="w-4 h-4 mr-2" />
            Lista
          </Button>
          <Button 
            variant={vista === 'estadisticas' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setVista('estadisticas')}
            style={vista === 'estadisticas' ? { backgroundColor: tema.primario } : {}}
            className={vista === 'estadisticas' ? 'text-white' : ''}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Estadísticas
          </Button>
        </div>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total GAPs</p>
                <p className="text-2xl font-bold">{statsGenerales.totalGAPs}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Network className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Miembros</p>
                <p className="text-2xl font-bold">{statsGenerales.totalMiembros}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Asistencia</p>
                <p className="text-2xl font-bold">{statsGenerales.asistenciaGeneral}%</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Bautizos</p>
                <p className="text-2xl font-bold">{statsGenerales.totalBautizos}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                <Droplets className="w-5 h-5 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estado de GAPs */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">GAPs Activos</p>
            <p className="text-3xl font-bold text-green-600">{statsGenerales.gapsActivos}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Necesitan Atención</p>
            <p className="text-3xl font-bold text-yellow-600">{statsGenerales.gapsAtencion}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Estado Crítico</p>
            <p className="text-3xl font-bold text-red-600">{statsGenerales.gapsCriticos}</p>
          </CardContent>
        </Card>
      </div>

      {vista === 'lista' ? (
        <>
          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar GAPs..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="Activo">Activos</SelectItem>
                    <SelectItem value="Atencion">Atención</SelectItem>
                    <SelectItem value="Critico">Críticos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lista de GAPs */}
          <div className="space-y-4">
            {gapsFiltrados.map((gap) => (
              <Card 
                key={gap.id} 
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Info principal */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{gap.codigo}</h3>
                        <Badge className={getEstadoColor(gap.estado)}>
                          <span className="flex items-center gap-1">
                            {getEstadoIcon(gap.estado)}
                            {gap.estado}
                          </span>
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500">Líder</p>
                          <p className="font-medium text-sm">{gap.lider}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Timoteo</p>
                          <p className="font-medium text-sm">{gap.timoteo}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Barrio</p>
                          <p className="font-medium text-sm">{gap.barrio}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Miembros</p>
                          <p className="font-medium text-sm">{gap.totalMiembros}</p>
                        </div>
                      </div>

                      {/* Métricas */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">Asistencia</p>
                          <div className="flex items-center gap-2">
                            <Progress value={gap.asistenciaPromedio} className="flex-1 h-2" />
                            <span className="text-sm font-medium">{gap.asistenciaPromedio}%</span>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">Nuevos (mes)</p>
                          <p className="text-lg font-semibold text-green-600">+{gap.nuevosEsteMes}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">Bautizos</p>
                          <p className="text-lg font-semibold text-cyan-600">{gap.bautizos}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">Graduados EFC</p>
                          <p className="text-lg font-semibold text-purple-600">{gap.graduadosEFC}</p>
                        </div>
                      </div>
                    </div>

                    {/* Flecha */}
                    <div className="flex items-center justify-center lg:justify-end">
                      <ChevronRight className="w-6 h-6 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {gapsFiltrados.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Network className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No se encontraron GAPs con los filtros seleccionados</p>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      ) : (
        /* Vista de Estadísticas */
        <div className="space-y-6">
          {/* Gráfico de Asistencia */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5" style={{ color: tema.primario }} />
                Asistencia por GAP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={datosAsistencia}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="asistencia" fill={tema.primario} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Gráfico de Miembros */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" style={{ color: tema.primario }} />
                  Miembros por GAP
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={datosMiembros} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={80} />
                      <Tooltip />
                      <Bar dataKey="miembros" fill={tema.secundario} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Gráfico de Estado */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" style={{ color: tema.primario }} />
                  Estado de GAPs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={datosEstado}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {datosEstado.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Crecimiento */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5" style={{ color: tema.primario }} />
                Crecimiento de la Red (Últimos 6 meses)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={datosCrecimiento}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="miembros" stroke={tema.primario} strokeWidth={2} name="Miembros" />
                    <Line type="monotone" dataKey="bautizos" stroke="#10b981" strokeWidth={2} name="Bautizos" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RedGAPPastorModule;

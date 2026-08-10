import React, { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { formatearHora12 } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Search, 
  ChevronDown, 
  ChevronUp,
  MapPin,
  Phone,
  Mail,
  Droplets,
  BookOpen,
  CheckCircle,
  Filter,
  Download,
  Crown,
  Sparkles
} from 'lucide-react';
import { 
  gapsMock, 
  miembrosMock, 
  usuariosMock 
} from '@/data/mockData';

interface IntegrantesPastorPrincipalModuleProps {
  onVolver: () => void;
}

const IntegrantesPastorPrincipalModule: React.FC<IntegrantesPastorPrincipalModuleProps> = ({ onVolver }) => {
  const { tema } = useAuth();
  const [busqueda, setBusqueda] = useState('');
  const [filtroGAP, setFiltroGAP] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroMinisterio, setFiltroMinisterio] = useState<string>('todos');
  const [gapExpandido, setGapExpandido] = useState<string | null>(null);

  // Combinar miembros, líderes y timoteos por GAP
  const integrantesPorGAP = useMemo(() => {
    return gapsMock.map(gap => {
      const lider = usuariosMock.find(u => u.id === gap.liderGapId);
      const timoteo = usuariosMock.find(u => u.id === gap.timoteoId);
      const miembros = miembrosMock.filter(m => m.gapId === gap.id);
      
      const todosIntegrantes = [
        ...(lider ? [{
          id: lider.id,
          nombres: lider.nombre,
          apellidos: lider.apellidos,
          tipo: 'Líder GAP' as const,
          telefono: lider.telefono,
          correo: lider.correo,
          esMiembroIBC: lider.esMiembroIBC,
          esBautizado: lider.esBautizado,
          escuelaFormacion: lider.escuelaFormacion,
          ministerios: lider.ministerios,
        }] : []),
        ...(timoteo ? [{
          id: timoteo.id,
          nombres: timoteo.nombre,
          apellidos: timoteo.apellidos,
          tipo: 'Timoteo' as const,
          telefono: timoteo.telefono,
          correo: timoteo.correo,
          esMiembroIBC: timoteo.esMiembroIBC,
          esBautizado: timoteo.esBautizado,
          escuelaFormacion: timoteo.escuelaFormacion,
          ministerios: timoteo.ministerios,
        }] : []),
        ...miembros.map(m => ({
          id: m.id,
          nombres: m.nombres,
          apellidos: m.apellidos,
          tipo: 'Miembro' as const,
          telefono: m.telefono,
          correo: m.correo,
          esMiembroIBC: m.esMiembroIBC,
          esBautizado: m.esBautizado,
          escuelaFormacion: m.escuelaFormacion,
          ministerios: m.ministerios,
        }))
      ];

      return {
        ...gap,
        integrantes: todosIntegrantes,
        totalIntegrantes: todosIntegrantes.length,
        totalBautizados: todosIntegrantes.filter(i => i.esBautizado).length,
        totalMiembrosIBC: todosIntegrantes.filter(i => i.esMiembroIBC).length,
        totalGraduadosEFC: todosIntegrantes.filter(i => i.escuelaFormacion === 'Graduado').length,
      };
    });
  }, []);

  // Filtrar GAPs
  const gapsFiltrados = useMemo(() => {
    return integrantesPorGAP.filter(gap => {
      const coincideGAP = filtroGAP === 'todos' || gap.id === filtroGAP;
      
      // Filtrar integrantes del GAP según búsqueda y filtros
      const integrantesFiltrados = gap.integrantes.filter(i => {
        const coincideBusqueda = 
          i.nombres.toLowerCase().includes(busqueda.toLowerCase()) ||
          i.apellidos.toLowerCase().includes(busqueda.toLowerCase()) ||
          i.telefono.includes(busqueda);
        
        const coincideEstado = 
          filtroEstado === 'todos' ||
          (filtroEstado === 'miembro_ibc' && i.esMiembroIBC) ||
          (filtroEstado === 'bautizado' && i.esBautizado) ||
          (filtroEstado === 'no_bautizado' && !i.esBautizado) ||
          (filtroEstado === 'graduado_efc' && i.escuelaFormacion === 'Graduado');
        
        const coincideMinisterio = 
          filtroMinisterio === 'todos' || 
          i.ministerios.some(m => m.toLowerCase().includes(filtroMinisterio.toLowerCase()));
        
        return coincideBusqueda && coincideEstado && coincideMinisterio;
      });

      return coincideGAP && (busqueda === '' || integrantesFiltrados.length > 0);
    });
  }, [integrantesPorGAP, busqueda, filtroGAP, filtroEstado, filtroMinisterio]);

  // Estadísticas generales
  const statsGenerales = useMemo(() => {
    const todosIntegrantes = integrantesPorGAP.flatMap(g => g.integrantes);
    return {
      total: todosIntegrantes.length,
      bautizados: todosIntegrantes.filter(i => i.esBautizado).length,
      miembrosIBC: todosIntegrantes.filter(i => i.esMiembroIBC).length,
      graduadosEFC: todosIntegrantes.filter(i => i.escuelaFormacion === 'Graduado').length,
    };
  }, [integrantesPorGAP]);

  // Ministerios únicos
  const ministeriosUnicos = useMemo(() => {
    const ministerios = new Set<string>();
    integrantesPorGAP.forEach(gap => {
      gap.integrantes.forEach(i => {
        i.ministerios.forEach(m => ministerios.add(m));
      });
    });
    return Array.from(ministerios).sort();
  }, [integrantesPorGAP]);

  const toggleGapExpandido = (gapId: string) => {
    setGapExpandido(gapExpandido === gapId ? null : gapId);
  };

  const exportarCSV = () => {
    const headers = ['GAP', 'Nombre', 'Apellido', 'Tipo', 'Teléfono', 'Correo', 'Miembro IBC', 'Bautizado', 'EFC'];
    const rows = integrantesPorGAP.flatMap(gap => 
      gap.integrantes.map(i => [
        gap.codigo,
        i.nombres,
        i.apellidos,
        i.tipo,
        i.telefono,
        i.correo || '',
        i.esMiembroIBC ? 'Sí' : 'No',
        i.esBautizado ? 'Sí' : 'No',
        i.escuelaFormacion,
      ])
    );
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `integrantes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onVolver} className="flex items-center gap-2">
            <ChevronDown className="w-4 h-4 rotate-90" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6" style={{ color: tema.primario }} />
            Integrantes
          </h1>
        </div>
        <Button 
          variant="outline" 
          onClick={exportarCSV}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card className="border-l-4" style={{ borderLeftColor: tema.primario }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Integrantes</p>
                <p className="text-2xl font-bold">{statsGenerales.total}</p>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${tema.primario}20` }}>
                <Users className="w-5 h-5" style={{ color: tema.primario }} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Bautizados</p>
                <p className="text-2xl font-bold text-green-600">{statsGenerales.bautizados}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Droplets className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Miembros IBC</p>
                <p className="text-2xl font-bold text-blue-600">{statsGenerales.miembrosIBC}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Graduados EFC</p>
                <p className="text-2xl font-bold text-purple-600">{statsGenerales.graduadosEFC}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row flex-wrap gap-4 items-stretch md:items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre o teléfono..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full md:w-48 flex-shrink-0">
              <Select value={filtroGAP} onValueChange={setFiltroGAP}>
                <SelectTrigger className="w-full">
                  <MapPin className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Todos los GAPs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los GAPs</SelectItem>
                  {gapsMock.map(gap => (
                    <SelectItem key={gap.id} value={gap.id}>{gap.codigo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-40 flex-shrink-0">
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger className="w-full">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="miembro_ibc">Miembros IBC</SelectItem>
                  <SelectItem value="bautizado">Bautizados</SelectItem>
                  <SelectItem value="no_bautizado">No Bautizados</SelectItem>
                  <SelectItem value="graduado_efc">Graduados EFC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-56 flex-shrink-0">
              <Select value={filtroMinisterio} onValueChange={setFiltroMinisterio}>
                <SelectTrigger className="w-full">
                  <Sparkles className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Ministerio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los ministerios</SelectItem>
                  {ministeriosUnicos.map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de GAPs con integrantes */}
      <div className="space-y-4">
        {gapsFiltrados.map((gap) => (
          <Card key={gap.id} className="overflow-hidden">
            <div 
              className="p-4 bg-gradient-to-r from-gray-50 to-white cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => toggleGapExpandido(gap.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${tema.primario}15` }}
                  >
                    <MapPin className="w-6 h-6" style={{ color: tema.primario }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{gap.codigo}</h3>
                    <p className="text-sm text-gray-500">
                      {gap.pastorNombre} • {gap.diaReunion} {formatearHora12(gap.horaReunion)} • {gap.barrio}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex gap-2 text-sm">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      {gap.totalIntegrantes} integrantes
                    </Badge>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {gap.totalBautizados} bautizados
                    </Badge>
                  </div>
                  {gapExpandido === gap.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
            </div>
            
            {gapExpandido === gap.id && (
              <CardContent className="p-4 border-t">
                <div className="grid gap-3">
                  {gap.integrantes
                    .filter(i => {
                      const coincideBusqueda = 
                        i.nombres.toLowerCase().includes(busqueda.toLowerCase()) ||
                        i.apellidos.toLowerCase().includes(busqueda.toLowerCase()) ||
                        i.telefono.includes(busqueda);
                      
                      const coincideEstado = 
                        filtroEstado === 'todos' ||
                        (filtroEstado === 'miembro_ibc' && i.esMiembroIBC) ||
                        (filtroEstado === 'bautizado' && i.esBautizado) ||
                        (filtroEstado === 'no_bautizado' && !i.esBautizado) ||
                        (filtroEstado === 'graduado_efc' && i.escuelaFormacion === 'Graduado');
                      
                      const coincideMinisterio = 
                        filtroMinisterio === 'todos' || 
                        i.ministerios.some(m => m.toLowerCase().includes(filtroMinisterio.toLowerCase()));
                      
                      return coincideBusqueda && coincideEstado && coincideMinisterio;
                    })
                    .map((integrante) => (
                    <div 
                      key={integrante.id} 
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: integrante.tipo === 'Líder GAP' ? tema.primario : integrante.tipo === 'Timoteo' ? tema.secundario : '#6b7280' }}
                      >
                        {integrante.nombres.charAt(0)}{integrante.apellidos.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{integrante.nombres} {integrante.apellidos}</p>
                          <Badge 
                            variant="outline" 
                            className={`
                              text-xs
                              ${integrante.tipo === 'Líder GAP' ? 'bg-amber-100 text-amber-700 border-amber-200' : ''}
                              ${integrante.tipo === 'Timoteo' ? 'bg-purple-100 text-purple-700 border-purple-200' : ''}
                              ${integrante.tipo === 'Miembro' ? 'bg-gray-100 text-gray-700 border-gray-200' : ''}
                            `}
                          >
                            {integrante.tipo === 'Líder GAP' && <Crown className="w-3 h-3 mr-1" />}
                            {integrante.tipo}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {integrante.telefono}
                          </span>
                          {integrante.correo && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {integrante.correo}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 flex-wrap justify-end">
                        {integrante.esMiembroIBC && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Miembro IBC
                          </Badge>
                        )}
                        {integrante.esBautizado && (
                          <Badge variant="outline" className="bg-cyan-50 text-cyan-700 text-xs">
                            <Droplets className="w-3 h-3 mr-1" />
                            Bautizado
                          </Badge>
                        )}
                        {integrante.escuelaFormacion === 'Graduado' && (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 text-xs">
                            <BookOpen className="w-3 h-3 mr-1" />
                            Graduado EFC
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
        
        {gapsFiltrados.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No se encontraron integrantes con los filtros seleccionados</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default IntegrantesPastorPrincipalModule;

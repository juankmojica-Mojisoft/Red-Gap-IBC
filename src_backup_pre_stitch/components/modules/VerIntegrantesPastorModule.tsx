import React, { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Users, 
  Search, 
  Phone,
  Mail,
  MapPin,
  Calendar,
  Droplets,
  BookOpen,
  CheckCircle,
  XCircle,
  ChevronRight,
  Download
} from 'lucide-react';
import { 
  miembrosMock, 
  getGAPsByPastor,
  usuariosMock 
} from '@/data/mockData';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface IntegranteCompleto {
  id: string;
  nombres: string;
  apellidos: string;
  tipo: 'miembro' | 'lider' | 'timoteo';
  gapId: string;
  gapCodigo: string;
  telefono: string;
  correo?: string;
  direccion: string;
  barrio: string;
  fechaNacimiento: string;
  esMiembroIBC: boolean;
  esBautizado: boolean;
  escuelaFormacion: string;
  ministerios: string[];
  franjaGeneracional?: string;
}

const VerIntegrantesPastorModule: React.FC = () => {
  const { usuario, tema } = useAuth();
  const [busqueda, setBusqueda] = useState('');
  const [filtroGAP, setFiltroGAP] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroMinisterio, setFiltroMinisterio] = useState<string>('todos');
  const [integranteSeleccionado, setIntegranteSeleccionado] = useState<IntegranteCompleto | null>(null);

  // Obtener GAPs del pastor
  const misGAPs = useMemo(() => {
    return getGAPsByPastor(usuario?.id || '');
  }, [usuario]);

  // Combinar miembros, líderes y timoteos
  const todosLosIntegrantes: IntegranteCompleto[] = useMemo(() => {
    const integrantes: IntegranteCompleto[] = [];

    misGAPs.forEach(gap => {
      // Agregar líder
      const lider = usuariosMock.find(u => u.id === gap.liderGapId);
      if (lider) {
        integrantes.push({
          id: lider.id,
          nombres: lider.nombre,
          apellidos: lider.apellidos,
          tipo: 'lider',
          gapId: gap.id,
          gapCodigo: gap.codigo,
          telefono: lider.telefono,
          correo: lider.correo,
          direccion: lider.direccion,
          barrio: lider.barrio,
          fechaNacimiento: lider.fechaNacimiento,
          esMiembroIBC: lider.esMiembroIBC,
          esBautizado: lider.esBautizado,
          escuelaFormacion: lider.escuelaFormacion,
          ministerios: lider.ministerios,
          franjaGeneracional: lider.franjaGeneracional,
        });
      }

      // Agregar timoteo
      const timoteo = usuariosMock.find(u => u.id === gap.timoteoId);
      if (timoteo) {
        integrantes.push({
          id: timoteo.id,
          nombres: timoteo.nombre,
          apellidos: timoteo.apellidos,
          tipo: 'timoteo',
          gapId: gap.id,
          gapCodigo: gap.codigo,
          telefono: timoteo.telefono,
          correo: timoteo.correo,
          direccion: timoteo.direccion,
          barrio: timoteo.barrio,
          fechaNacimiento: timoteo.fechaNacimiento,
          esMiembroIBC: timoteo.esMiembroIBC,
          esBautizado: timoteo.esBautizado,
          escuelaFormacion: timoteo.escuelaFormacion,
          ministerios: timoteo.ministerios,
          franjaGeneracional: timoteo.franjaGeneracional,
        });
      }

      // Agregar miembros del GAP
      const miembrosGAP = miembrosMock.filter(m => m.gapId === gap.id);
      miembrosGAP.forEach(miembro => {
        integrantes.push({
          id: miembro.id,
          nombres: miembro.nombres,
          apellidos: miembro.apellidos,
          tipo: 'miembro',
          gapId: gap.id,
          gapCodigo: gap.codigo,
          telefono: miembro.telefono,
          correo: miembro.correo,
          direccion: miembro.direccion,
          barrio: miembro.barrio,
          fechaNacimiento: miembro.fechaNacimiento,
          esMiembroIBC: miembro.esMiembroIBC,
          esBautizado: miembro.esBautizado,
          escuelaFormacion: miembro.escuelaFormacion,
          ministerios: miembro.ministerios,
          franjaGeneracional: miembro.franjaGeneracional,
        });
      });
    });

    return integrantes;
  }, [misGAPs]);

  // Filtrar integrantes
  const integrantesFiltrados = useMemo(() => {
    return todosLosIntegrantes.filter(i => {
      const coincideBusqueda = 
        i.nombres.toLowerCase().includes(busqueda.toLowerCase()) ||
        i.apellidos.toLowerCase().includes(busqueda.toLowerCase()) ||
        i.telefono.includes(busqueda) ||
        (i.correo && i.correo.toLowerCase().includes(busqueda.toLowerCase()));
      
      const coincideGAP = filtroGAP === 'todos' || i.gapId === filtroGAP;
      
      let coincideEstado = true;
      if (filtroEstado === 'miembro_ibc') coincideEstado = i.esMiembroIBC;
      else if (filtroEstado === 'bautizado') coincideEstado = i.esBautizado;
      else if (filtroEstado === 'no_bautizado') coincideEstado = !i.esBautizado;
      else if (filtroEstado === 'efc_graduado') coincideEstado = i.escuelaFormacion === 'Graduado';
      else if (filtroEstado === 'efc_cursando') coincideEstado = i.escuelaFormacion === 'Cursando';
      
      const coincideMinisterio = filtroMinisterio === 'todos' || i.ministerios.includes(filtroMinisterio);
      
      return coincideBusqueda && coincideGAP && coincideEstado && coincideMinisterio;
    });
  }, [todosLosIntegrantes, busqueda, filtroGAP, filtroEstado, filtroMinisterio]);

  // Estadísticas
  const stats = useMemo(() => {
    const total = todosLosIntegrantes.length;
    const miembrosIBC = todosLosIntegrantes.filter(i => i.esMiembroIBC).length;
    const bautizados = todosLosIntegrantes.filter(i => i.esBautizado).length;
    const graduadosEFC = todosLosIntegrantes.filter(i => i.escuelaFormacion === 'Graduado').length;
    const cursandoEFC = todosLosIntegrantes.filter(i => i.escuelaFormacion === 'Cursando').length;
    const lideres = todosLosIntegrantes.filter(i => i.tipo === 'lider').length;
    const timoteos = todosLosIntegrantes.filter(i => i.tipo === 'timoteo').length;
    const miembros = todosLosIntegrantes.filter(i => i.tipo === 'miembro').length;

    return { total, miembrosIBC, bautizados, graduadosEFC, cursandoEFC, lideres, timoteos, miembros };
  }, [todosLosIntegrantes]);

  // Lista de ministerios únicos
  const ministeriosUnicos = useMemo(() => {
    const ministerios = new Set<string>();
    todosLosIntegrantes.forEach(i => i.ministerios.forEach(m => ministerios.add(m)));
    return Array.from(ministerios).sort();
  }, [todosLosIntegrantes]);

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'lider': return <Badge className="bg-blue-100 text-blue-800">Líder</Badge>;
      case 'timoteo': return <Badge className="bg-purple-100 text-purple-800">Timoteo</Badge>;
      case 'miembro': return <Badge className="bg-green-100 text-green-800">Miembro</Badge>;
      default: return null;
    }
  };

  const exportarCSV = () => {
    const headers = ['Nombres', 'Apellidos', 'Tipo', 'GAP', 'Teléfono', 'Correo', 'Barrio', 'Miembro IBC', 'Bautizado', 'EFC'];
    const rows = integrantesFiltrados.map(i => [
      i.nombres,
      i.apellidos,
      i.tipo,
      i.gapCodigo,
      i.telefono,
      i.correo || '',
      i.barrio,
      i.esMiembroIBC ? 'Sí' : 'No',
      i.esBautizado ? 'Sí' : 'No',
      i.escuelaFormacion,
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `integrantes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ver Integrantes</h2>
          <p className="text-gray-500">Todos los integrantes de tu red de GAPs</p>
        </div>
        <Button 
          variant="outline"
          onClick={exportarCSV}
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Miembro IBC</p>
                <p className="text-2xl font-bold text-green-600">{stats.miembrosIBC}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Bautizados</p>
                <p className="text-2xl font-bold text-cyan-600">{stats.bautizados}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                <Droplets className="w-5 h-5 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Graduados EFC</p>
                <p className="text-2xl font-bold text-purple-600">{stats.graduadosEFC}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row flex-wrap gap-4 items-stretch md:items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, teléfono o correo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full md:w-48 flex-shrink-0">
              <Select value={filtroGAP} onValueChange={setFiltroGAP}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="GAP" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los GAPs</SelectItem>
                  {misGAPs.map(gap => (
                    <SelectItem key={gap.id} value={gap.id}>{gap.codigo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-40 flex-shrink-0">
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="miembro_ibc">Miembro IBC</SelectItem>
                  <SelectItem value="bautizado">Bautizados</SelectItem>
                  <SelectItem value="no_bautizado">No Bautizados</SelectItem>
                  <SelectItem value="efc_graduado">Graduados EFC</SelectItem>
                  <SelectItem value="efc_cursando">Cursando EFC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-56 flex-shrink-0">
              <Select value={filtroMinisterio} onValueChange={setFiltroMinisterio}>
                <SelectTrigger className="w-full">
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

      {/* Lista de Integrantes */}
      <div className="space-y-3">
        {integrantesFiltrados.map((integrante) => (
          <Card 
            key={integrante.id} 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setIntegranteSeleccionado(integrante)}
          >
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Avatar/Nombre */}
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                       style={{ backgroundColor: tema.primario }}>
                    {integrante.nombres.charAt(0)}{integrante.apellidos.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {integrante.nombres} {integrante.apellidos}
                      </h3>
                      {getTipoBadge(integrante.tipo)}
                    </div>
                    <p className="text-sm text-gray-500">{integrante.gapCodigo} • {integrante.barrio}</p>
                  </div>
                </div>

                {/* Info de contacto */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {integrante.telefono}
                  </span>
                  {integrante.correo && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {integrante.correo}
                    </span>
                  )}
                </div>

                {/* Badges de estado */}
                <div className="flex flex-wrap gap-2">
                  {integrante.esMiembroIBC && (
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Miembro IBC
                    </Badge>
                  )}
                  {integrante.esBautizado && (
                    <Badge variant="outline" className="text-cyan-600 border-cyan-200">
                      <Droplets className="w-3 h-3 mr-1" />
                      Bautizado
                    </Badge>
                  )}
                  {integrante.escuelaFormacion === 'Graduado' && (
                    <Badge variant="outline" className="text-purple-600 border-purple-200">
                      <BookOpen className="w-3 h-3 mr-1" />
                      Graduado EFC
                    </Badge>
                  )}
                </div>

                {/* Flecha */}
                <ChevronRight className="w-5 h-5 text-gray-400 hidden sm:block" />
              </div>
            </CardContent>
          </Card>
        ))}

        {integrantesFiltrados.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No se encontraron integrantes con los filtros seleccionados</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Diálogo de detalle */}
      <Dialog open={!!integranteSeleccionado} onOpenChange={() => setIntegranteSeleccionado(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {integranteSeleccionado && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                       style={{ backgroundColor: tema.primario }}>
                    {integranteSeleccionado.nombres.charAt(0)}{integranteSeleccionado.apellidos.charAt(0)}
                  </div>
                  <div>
                    <p>{integranteSeleccionado.nombres} {integranteSeleccionado.apellidos}</p>
                    <p className="text-sm font-normal text-gray-500">{integranteSeleccionado.gapCodigo}</p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Tipo */}
                <div className="flex justify-center">
                  {getTipoBadge(integranteSeleccionado.tipo)}
                </div>

                {/* Información de contacto */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 border-b pb-2">Información de Contacto</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Teléfono:</span>
                      <p className="font-medium flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {integranteSeleccionado.telefono}
                      </p>
                    </div>
                    {integranteSeleccionado.correo && (
                      <div>
                        <span className="text-gray-500">Correo:</span>
                        <p className="font-medium flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {integranteSeleccionado.correo}
                        </p>
                      </div>
                    )}
                    <div className="col-span-2">
                      <span className="text-gray-500">Dirección:</span>
                      <p className="font-medium flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {integranteSeleccionado.direccion}, {integranteSeleccionado.barrio}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Fecha de nacimiento:</span>
                      <p className="font-medium flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(integranteSeleccionado.fechaNacimiento), 'dd MMMM yyyy', { locale: es })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Información Ministerial */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 border-b pb-2">Información Ministerial</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Miembro de IBC:</span>
                      {integranteSeleccionado.esMiembroIBC ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" /> Sí
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">
                          <XCircle className="w-3 h-3 mr-1" /> No
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Bautizado:</span>
                      {integranteSeleccionado.esBautizado ? (
                        <Badge className="bg-cyan-100 text-cyan-800">
                          <Droplets className="w-3 h-3 mr-1" /> Sí
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">
                          <XCircle className="w-3 h-3 mr-1" /> No
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Escuela de Formación:</span>
                      <Badge variant="outline">{integranteSeleccionado.escuelaFormacion}</Badge>
                    </div>
                    {integranteSeleccionado.franjaGeneracional && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Franja Generacional:</span>
                        <Badge variant="outline">{integranteSeleccionado.franjaGeneracional}</Badge>
                      </div>
                    )}
                    {integranteSeleccionado.ministerios.length > 0 && (
                      <div>
                        <span className="text-gray-500">Ministerios:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {integranteSeleccionado.ministerios.map((m, i) => (
                            <Badge key={i} className="bg-blue-100 text-blue-800">{m}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VerIntegrantesPastorModule;

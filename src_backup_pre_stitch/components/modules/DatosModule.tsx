import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Database, 
  FileSpreadsheet,
  Users,
  MapPin,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  usuariosMock, 
  gapsMock, 
  miembrosMock, 
  escalamientosMock,
  getEstadisticas 
} from '@/data/mockData';

interface DatosModuleProps {
  onVolver: () => void;
}

const DatosModule: React.FC<DatosModuleProps> = ({ onVolver }) => {
  const { tema } = useAuth();
  const [activeTab, setActiveTab] = useState('usuarios');
  const [exportando, setExportando] = useState(false);
  
  // Campos seleccionados para exportar
  const [camposUsuarios, setCamposUsuarios] = useState({
    nombre: true,
    correo: true,
    rol: true,
    telefono: true,
    documento: true,
    sexo: true,
    estadoCivil: true,
    esMiembroIBC: true,
    esBautizado: true,
    escuelaFormacion: true,
    ministerios: false,
  });

  const [camposGAPs, setCamposGAPs] = useState({
    codigo: true,
    nombre: true,
    liderGap: true,
    timoteo: true,
    pastor: true,
    liderMentor: true,
    direccion: true,
    barrio: true,
    diaReunion: true,
    horaReunion: true,
    frecuencia: true,
    modalidad: true,
    ubicacion: true,
    miembros: true,
  });

  const [camposMiembros, setCamposMiembros] = useState({
    nombres: true,
    apellidos: true,
    documento: true,
    sexo: true,
    telefono: true,
    correo: true,
    direccion: true,
    barrio: true,
    esMiembroIBC: true,
    esBautizado: true,
    escuelaFormacion: true,
    ministerios: false,
    gap: true,
  });

  const convertirAExcel = (datos: any[], nombreArchivo: string) => {
    // Crear contenido CSV
    if (datos.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }

    const headers = Object.keys(datos[0]);
    const csvContent = [
      headers.join('\t'), // Encabezados separados por tabulaciones
      ...datos.map(row => 
        headers.map(h => {
          const valor = row[h];
          // Manejar valores que contienen comas o saltos de línea
          if (typeof valor === 'string' && (valor.includes(',') || valor.includes('\n'))) {
            return `"${valor.replace(/"/g, '""')}"`;
          }
          return valor;
        }).join('\t')
      )
    ].join('\n');

    // Crear blob y descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${nombreArchivo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportarUsuarios = async () => {
    setExportando(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const datos = usuariosMock.map(u => {
      const row: Record<string, any> = {};
      if (camposUsuarios.nombre) row['Nombre Completo'] = `${u.nombre} ${u.apellidos}`;
      if (camposUsuarios.correo) row['Correo'] = u.correo;
      if (camposUsuarios.rol) row['Rol'] = u.rol;
      if (camposUsuarios.telefono) row['Teléfono'] = u.telefono;
      if (camposUsuarios.documento) row['Documento'] = `${u.tipoDocumento} ${u.numeroDocumento}`;
      if (camposUsuarios.sexo) row['Sexo'] = u.sexo;
      if (camposUsuarios.estadoCivil) row['Estado Civil'] = u.estadoCivil;
      if (camposUsuarios.esMiembroIBC) row['Miembro IBC'] = u.esMiembroIBC ? 'Sí' : 'No';
      if (camposUsuarios.esBautizado) row['Bautizado'] = u.esBautizado ? 'Sí' : 'No';
      if (camposUsuarios.escuelaFormacion) row['EFC'] = u.escuelaFormacion;
      if (camposUsuarios.ministerios) row['Ministerios'] = u.ministerios.join(', ');
      return row;
    });

    convertirAExcel(datos, `Usuarios_GAP_${new Date().toISOString().split('T')[0]}`);
    setExportando(false);
    toast.success('Usuarios exportados exitosamente');
  };

  const handleExportarGAPs = async () => {
    setExportando(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const datos = gapsMock.map(g => {
      const row: Record<string, any> = {};
      if (camposGAPs.codigo) row['Código'] = g.codigo;
      if (camposGAPs.liderGap) row['Líder GAP'] = g.liderGapNombre;
      if (camposGAPs.timoteo) row['Timoteo'] = g.timoteoNombre;
      if (camposGAPs.pastor) row['Pastor'] = g.pastorNombre;
      if (camposGAPs.liderMentor) row['Líder Mentor'] = g.liderMentorNombre;
      if (camposGAPs.direccion) row['Dirección'] = g.direccion;
      if (camposGAPs.barrio) row['Barrio'] = g.barrio;
      if (camposGAPs.diaReunion) row['Día'] = g.diaReunion;
      if (camposGAPs.horaReunion) row['Hora'] = g.horaReunion;
      if (camposGAPs.frecuencia) row['Frecuencia'] = g.frecuencia;
      if (camposGAPs.modalidad) row['Modalidad'] = g.modalidad;
      if (camposGAPs.ubicacion) row['Ubicación'] = g.ubicacionReunion;
      if (camposGAPs.miembros) row['Total Miembros'] = g.miembros.length;
      return row;
    });

    convertirAExcel(datos, `GAPs_${new Date().toISOString().split('T')[0]}`);
    setExportando(false);
    toast.success('GAPs exportados exitosamente');
  };

  const handleExportarMiembros = async () => {
    setExportando(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const datos = miembrosMock.map(m => {
      const row: Record<string, any> = {};
      if (camposMiembros.nombres) row['Nombres'] = m.nombres;
      if (camposMiembros.apellidos) row['Apellidos'] = m.apellidos;
      if (camposMiembros.documento) row['Documento'] = `${m.tipoDocumento} ${m.numeroDocumento}`;
      if (camposMiembros.sexo) row['Sexo'] = m.sexo;
      if (camposMiembros.telefono) row['Teléfono'] = m.telefono;
      if (camposMiembros.correo) row['Correo'] = m.correo || '';
      if (camposMiembros.direccion) row['Dirección'] = m.direccion;
      if (camposMiembros.barrio) row['Barrio'] = m.barrio;
      if (camposMiembros.esMiembroIBC) row['Miembro IBC'] = m.esMiembroIBC ? 'Sí' : 'No';
      if (camposMiembros.esBautizado) row['Bautizado'] = m.esBautizado ? 'Sí' : 'No';
      if (camposMiembros.escuelaFormacion) row['EFC'] = m.escuelaFormacion;
      if (camposMiembros.ministerios) row['Ministerios'] = m.ministerios.join(', ');
      if (camposMiembros.gap) row['GAP'] = gapsMock.find(g => g.id === m.gapId)?.codigo || '';
      return row;
    });

    convertirAExcel(datos, `Miembros_GAP_${new Date().toISOString().split('T')[0]}`);
    setExportando(false);
    toast.success('Miembros exportados exitosamente');
  };

  const handleExportarEscalamientos = async () => {
    setExportando(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const datos = escalamientosMock.map(e => ({
      'Título': e.titulo,
      'Clasificación': e.clasificacion,
      'Prioridad': e.prioridad,
      'Estado': e.estado,
      'Creador': e.creadorNombre,
      'Fecha Creación': e.fechaCreacion,
      'Fecha Límite': e.fechaLimite || 'N/A',
      'Asignado a': e.asignadoANombre || 'Sin asignar',
      'Respuestas': e.respuestas.length,
    }));

    convertirAExcel(datos, `Escalamientos_${new Date().toISOString().split('T')[0]}`);
    setExportando(false);
    toast.success('Escalamientos exportados exitosamente');
  };

  const estadisticas = getEstadisticas();

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onVolver} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Módulo de Datos</h1>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Usuarios</p>
            <p className="text-2xl font-bold" style={{ color: tema.primario }}>
              {estadisticas.totalUsuarios}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">GAPs</p>
            <p className="text-2xl font-bold" style={{ color: tema.primario }}>
              {estadisticas.totalGAPs}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Miembros</p>
            <p className="text-2xl font-bold" style={{ color: tema.primario }}>
              {estadisticas.totalMiembros}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Escalamientos</p>
            <p className="text-2xl font-bold" style={{ color: tema.primario }}>
              {escalamientosMock.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="usuarios" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Usuarios</span>
          </TabsTrigger>
          <TabsTrigger value="gaps" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span className="hidden sm:inline">GAPs</span>
          </TabsTrigger>
          <TabsTrigger value="miembros" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Miembros</span>
          </TabsTrigger>
          <TabsTrigger value="escalamientos" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Escalamientos</span>
          </TabsTrigger>
        </TabsList>

        {/* Exportar Usuarios */}
        <TabsContent value="usuarios">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" style={{ color: tema.primario }} />
                Exportar Usuarios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500">
                Seleccione los campos que desea incluir en la exportación:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(camposUsuarios).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`user-${key}`}
                      checked={value}
                      onCheckedChange={(checked) => 
                        setCamposUsuarios(prev => ({ ...prev, [key]: checked as boolean }))
                      }
                    />
                    <Label htmlFor={`user-${key}`} className="text-sm capitalize">
                      {key === 'esMiembroIBC' ? 'Miembro IBC' : 
                       key === 'esBautizado' ? 'Bautizado' : 
                       key === 'escuelaFormacion' ? 'EFC' : key}
                    </Label>
                  </div>
                ))}
              </div>
              <Button
                onClick={handleExportarUsuarios}
                disabled={exportando || Object.values(camposUsuarios).every(v => !v)}
                className="w-full text-white"
                style={{ backgroundColor: tema.primario }}
              >
                {exportando ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Exportar a Excel ({usuariosMock.length} registros)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exportar GAPs */}
        <TabsContent value="gaps">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" style={{ color: tema.primario }} />
                Exportar GAPs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500">
                Seleccione los campos que desea incluir en la exportación:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(camposGAPs).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`gap-${key}`}
                      checked={value}
                      onCheckedChange={(checked) => 
                        setCamposGAPs(prev => ({ ...prev, [key]: checked as boolean }))
                      }
                    />
                    <Label htmlFor={`gap-${key}`} className="text-sm capitalize">
                      {key === 'liderGap' ? 'Líder GAP' : 
                       key === 'liderMentor' ? 'Líder Mentor' : 
                       key === 'diaReunion' ? 'Día' :
                       key === 'horaReunion' ? 'Hora' : key}
                    </Label>
                  </div>
                ))}
              </div>
              <Button
                onClick={handleExportarGAPs}
                disabled={exportando || Object.values(camposGAPs).every(v => !v)}
                className="w-full text-white"
                style={{ backgroundColor: tema.primario }}
              >
                {exportando ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Exportar a Excel ({gapsMock.length} registros)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exportar Miembros */}
        <TabsContent value="miembros">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" style={{ color: tema.primario }} />
                Exportar Miembros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500">
                Seleccione los campos que desea incluir en la exportación:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(camposMiembros).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`miembro-${key}`}
                      checked={value}
                      onCheckedChange={(checked) => 
                        setCamposMiembros(prev => ({ ...prev, [key]: checked as boolean }))
                      }
                    />
                    <Label htmlFor={`miembro-${key}`} className="text-sm capitalize">
                      {key === 'esMiembroIBC' ? 'Miembro IBC' : 
                       key === 'esBautizado' ? 'Bautizado' : 
                       key === 'escuelaFormacion' ? 'EFC' : key}
                    </Label>
                  </div>
                ))}
              </div>
              <Button
                onClick={handleExportarMiembros}
                disabled={exportando || Object.values(camposMiembros).every(v => !v)}
                className="w-full text-white"
                style={{ backgroundColor: tema.primario }}
              >
                {exportando ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Exportar a Excel ({miembrosMock.length} registros)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exportar Escalamientos */}
        <TabsContent value="escalamientos">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" style={{ color: tema.primario }} />
                Exportar Escalamientos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500">
                Exporte todos los casos de escalamiento con su información completa.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {escalamientosMock.filter(e => e.estado === 'Abierto').length}
                  </p>
                  <p className="text-sm text-gray-600">Abiertos</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {escalamientosMock.filter(e => e.estado === 'En Tratamiento').length}
                  </p>
                  <p className="text-sm text-gray-600">En Tratamiento</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {escalamientosMock.filter(e => e.estado === 'Cerrado').length}
                  </p>
                  <p className="text-sm text-gray-600">Cerrados</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {escalamientosMock.filter(e => e.prioridad === 'Urgente').length}
                  </p>
                  <p className="text-sm text-gray-600">Urgentes</p>
                </div>
              </div>
              <Button
                onClick={handleExportarEscalamientos}
                disabled={exportando}
                className="w-full text-white"
                style={{ backgroundColor: tema.primario }}
              >
                {exportando ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Exportar a Excel ({escalamientosMock.length} registros)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Nota informativa */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Database className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">Información sobre la exportación</p>
            <p className="text-sm text-blue-700 mt-1">
              Los archivos se descargan en formato CSV compatible con Excel. 
              Los datos exportados dependen de su nivel de permisos en el sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatosModule;

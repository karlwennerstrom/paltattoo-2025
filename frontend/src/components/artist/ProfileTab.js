import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Card, Grid } from '../common/Layout';
import Button from '../common/Button';
import Input from '../common/Input';
import { getProfileImageUrl } from '../../utils/imageHelpers';
import toast from 'react-hot-toast';
import { profileService } from '../../services/api';

const ProfileTab = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [availableComunas, setAvailableComunas] = useState([]);
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());
  
  // Datos de regiones y comunas de Chile
  const regionesData = {
    "regiones": [
        {
            "region": "Región de Arica y Parinacota",
            "comunas": ["Arica", "Camarones", "Putre", "General Lagos"]
        },
        {
            "region": "Región de Tarapacá",
            "comunas": ["Iquique", "Alto Hospicio", "Pozo Almonte", "Camiña", "Colchane", "Huara", "Pica"]
        },
        {
            "region": "Región de Antofagasta",
            "comunas": ["Antofagasta", "Mejillones", "Sierra Gorda", "Taltal", "Calama", "Ollagüe", "San Pedro de Atacama", "Tocopilla", "María Elena"]
        },
        {
            "region": "Región de Atacama",
            "comunas": ["Copiapó", "Caldera", "Tierra Amarilla", "Chañaral", "Diego de Almagro", "Vallenar", "Alto del Carmen", "Freirina", "Huasco"]
        },
        {
            "region": "Región de Coquimbo",
            "comunas": ["La Serena", "Coquimbo", "Andacollo", "La Higuera", "Paiguano", "Vicuña", "Illapel", "Canela", "Los Vilos", "Salamanca", "Ovalle", "Combarbalá", "Monte Patria", "Punitaqui", "Río Hurtado"]
        },
        {
            "region": "Región de Valparaíso",
            "comunas": ["Valparaíso", "Casablanca", "Concón", "Juan Fernández", "Puchuncaví", "Quintero", "Viña del Mar", "Isla de Pascua", "Los Andes", "Calle Larga", "Rinconada", "San Esteban", "La Ligua", "Cabildo", "Papudo", "Petorca", "Zapallar", "Quillota", "Calera", "Hijuelas", "La Cruz", "Nogales", "San Antonio", "Algarrobo", "Cartagena", "El Quisco", "El Tabo", "Santo Domingo", "San Felipe", "Catemu", "Llaillay", "Panquehue", "Putaendo", "Santa María", "Quilpué", "Limache", "Olmué", "Villa Alemana"]
        },
        {
            "region": "Región del Libertador Gral. Bernardo O'Higgins",
            "comunas": ["Rancagua", "Codegua", "Coinco", "Coltauco", "Doñihue", "Graneros", "Las Cabras", "Machalí", "Malloa", "Mostazal", "Olivar", "Peumo", "Pichidegua", "Quinta de Tilcoco", "Rengo", "Requínoa", "San Vicente", "Pichilemu", "La Estrella", "Litueche", "Marchihue", "Navidad", "Paredones", "San Fernando", "Chépica", "Chimbarongo", "Lolol", "Nancagua", "Palmilla", "Peralillo", "Placilla", "Pumanque", "Santa Cruz"]
        },
        {
            "region": "Región del Maule",
            "comunas": ["Talca", "Constitución", "Curepto", "Empedrado", "Maule", "Pelarco", "Pencahue", "Río Claro", "San Clemente", "San Rafael", "Cauquenes", "Chanco", "Pelluhue", "Curicó", "Hualañé", "Licantén", "Molina", "Rauco", "Romeral", "Sagrada Familia", "Teno", "Vichuquén", "Linares", "Colbún", "Longaví", "Parral", "Retiro", "San Javier", "Villa Alegre", "Yerbas Buenas"]
        },
        {
            "region": "Región de Ñuble",
            "comunas": ["Cobquecura", "Coelemu", "Ninhue", "Portezuelo", "Quirihue", "Ránquil", "Treguaco", "Bulnes", "Chillán Viejo", "Chillán", "El Carmen", "Pemuco", "Pinto", "Quillón", "San Ignacio", "Yungay", "Coihueco", "Ñiquén", "San Carlos", "San Fabián", "San Nicolás"]
        },
        {
            "region": "Región del Biobío",
            "comunas": ["Concepción", "Coronel", "Chiguayante", "Florida", "Hualqui", "Lota", "Penco", "San Pedro de la Paz", "Santa Juana", "Talcahuano", "Tomé", "Hualpén", "Lebu", "Arauco", "Cañete", "Contulmo", "Curanilahue", "Los Álamos", "Tirúa", "Los Ángeles", "Antuco", "Cabrero", "Laja", "Mulchén", "Nacimiento", "Negrete", "Quilaco", "Quilleco", "San Rosendo", "Santa Bárbara", "Tucapel", "Yumbel", "Alto Biobío"]
        },
        {
            "region": "Región de La Araucanía",
            "comunas": ["Temuco", "Carahue", "Cunco", "Curarrehue", "Freire", "Galvarino", "Gorbea", "Lautaro", "Loncoche", "Melipeuco", "Nueva Imperial", "Padre las Casas", "Perquenco", "Pitrufquén", "Pucón", "Saavedra", "Teodoro Schmidt", "Toltén", "Vilcún", "Villarrica", "Cholchol", "Angol", "Collipulli", "Curacautín", "Ercilla", "Lonquimay", "Los Sauces", "Lumaco", "Purén", "Renaico", "Traiguén", "Victoria"]
        },
        {
            "region": "Región de Los Ríos",
            "comunas": ["Valdivia", "Corral", "Lanco", "Los Lagos", "Máfil", "Mariquina", "Paillaco", "Panguipulli", "La Unión", "Futrono", "Lago Ranco", "Río Bueno"]
        },
        {
            "region": "Región de Los Lagos",
            "comunas": ["Puerto Montt", "Calbuco", "Cochamó", "Fresia", "Frutillar", "Los Muermos", "Llanquihue", "Maullín", "Puerto Varas", "Castro", "Ancud", "Chonchi", "Curaco de Vélez", "Dalcahue", "Puqueldón", "Queilén", "Quellón", "Quemchi", "Quinchao", "Osorno", "Puerto Octay", "Purranque", "Puyehue", "Río Negro", "San Juan de la Costa", "San Pablo", "Chaitén", "Futaleufú", "Hualaihué", "Palena"]
        },
        {
            "region": "Región de Aysén del General Carlos Ibáñez del Campo",
            "comunas": ["Coihaique", "Lago Verde", "Aisén", "Cisnes", "Guaitecas", "Cochrane", "O'Higgins", "Tortel", "Chile Chico", "Río Ibáñez"]
        },
        {
            "region": "Región de Magallanes y de la Antártica Chilena",
            "comunas": ["Punta Arenas", "Laguna Blanca", "Río Verde", "San Gregorio", "Cabo de Hornos (Ex Navarino)", "Antártica", "Porvenir", "Primavera", "Timaukel", "Natales", "Torres del Paine"]
        },
        {
            "region": "Región Metropolitana de Santiago",
            "comunas": ["Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central", "Huechuraba", "Independencia", "La Cisterna", "La Florida", "La Granja", "La Pintana", "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú", "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén", "Providencia", "Pudahuel", "Quilicura", "Quinta Normal", "Recoleta", "Renca", "Santiago", "San Joaquín", "San Miguel", "San Ramón", "Vitacura", "Puente Alto", "Pirque", "San José de Maipo", "Colina", "Lampa", "Tiltil", "San Bernardo", "Buin", "Calera de Tango", "Paine", "Melipilla", "Alhué", "Curacaví", "María Pinto", "San Pedro", "Talagante", "El Monte", "Isla de Maipo", "Padre Hurtado", "Peñaflor"]
        }
    ]
  };
  
  const [profileData, setProfileData] = useState({
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@email.com',
    phone: '+56 9 1234 5678',
    instagram: 'carlos_tattoo_art',
    bio: 'Artista tatuador especializado en realismo y retratos con más de 8 años de experiencia. Mi pasión es crear tatuajes únicos que cuenten la historia de cada persona.',
    region: 'Región Metropolitana de Santiago',
    comuna: 'Santiago',
    street: 'Providencia 1234',
    location: 'Santiago Centro, Chile', // Keep for backward compatibility
    studioName: 'Ink Masters Studio',
    studioAddress: 'Providencia 1234, Santiago Centro',
    experienceYears: 8,
    specialties: ['Realista', 'Black & Grey', 'Retratos', 'Neo-tradicional'],
    profileImage: null,
    priceRange: {
      min: 80000,
      max: 350000
    },
    workingHours: {
      monday: { open: '10:00', close: '19:00' },
      tuesday: { open: '10:00', close: '19:00' },
      wednesday: { open: '10:00', close: '19:00' },
      thursday: { open: '10:00', close: '19:00' },
      friday: { open: '10:00', close: '19:00' },
      saturday: { open: '11:00', close: '17:00' },
      sunday: { closed: true }
    },
    acceptingWork: true,
    certifications: [
      'Certificación en Bioseguridad',
      'Curso Avanzado de Realismo'
    ]
  });

  const specialtyOptions = [
    'Realista', 'Tradicional', 'Neo-tradicional', 'Blackwork',
    'Dotwork', 'Acuarela', 'Japonés', 'Tribal', 'Minimalista',
    'Geométrico', 'Biomecánico', 'New School', 'Old School',
    'Black & Grey', 'Color', 'Lettering', 'Ornamental'
  ];

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // If starts with 56, remove it (country code already included)
    const cleanDigits = digits.startsWith('56') ? digits.substring(2) : digits;
    
    // Limit to 8 digits maximum (since +569 is already there)
    const limitedDigits = cleanDigits.substring(0, 8);
    
    // Format as +56 9 XXXX XXXX for mobile numbers
    if (limitedDigits.length <= 8) {
      if (limitedDigits.length <= 4) {
        return `+56 9 ${limitedDigits}`;
      } else {
        const formatted = limitedDigits.replace(/(\d{4})(\d{0,4})/, '$1 $2').trim();
        return `+56 9 ${formatted}`;
      }
    }
    
    return `+56 9 ${limitedDigits}`;
  };

  const handlePhoneChange = (e) => {
    const formattedPhone = formatPhoneNumber(e.target.value);
    handleInputChange('phone', formattedPhone);
  };

  const handleRegionChange = (e) => {
    const selectedRegion = e.target.value;
    handleInputChange('region', selectedRegion);
    
    // Find comunas for selected region
    const regionData = regionesData.regiones.find(r => r.region === selectedRegion);
    if (regionData) {
      setAvailableComunas(regionData.comunas);
    } else {
      setAvailableComunas([]);
    }
    
    // Reset comuna when region changes
    handleInputChange('comuna', '');
  };

  // Load profile data on component mount
  React.useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const { profileService } = await import('../../services/api');
        const response = await profileService.get();
        if (response.data?.user) {
          const userData = response.data.user;
          // Combine firstName and lastName into name
          const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
          
          setProfileData(prev => ({
            ...prev,
            name: fullName || prev.name,
            email: userData.email || prev.email,
            phone: userData.phone || prev.phone,
            bio: userData.bio || prev.bio,
            profileImage: userData.profileImage || prev.profileImage
          }));
          
          // Also load artist specific data if available
          if (response.data.artistProfile) {
            const artistData = response.data.artistProfile;
            const regionFromDB = artistData.region;
            const comunaFromDB = artistData.comuna_name;
            
            // Initialize available comunas based on loaded region FIRST
            if (regionFromDB) {
              // Try exact match first
              let regionData = regionesData.regiones.find(r => r.region === regionFromDB);
              
              // If no exact match, try partial match (for cases like "Región de..." vs "...")
              if (!regionData) {
                regionData = regionesData.regiones.find(r => 
                  r.region.toLowerCase().includes(regionFromDB.toLowerCase()) ||
                  regionFromDB.toLowerCase().includes(r.region.toLowerCase())
                );
              }
              
              if (regionData) {
                setAvailableComunas(regionData.comunas);
              }
            }
            
            // Then update profile data with artist information
            setProfileData(prev => {
              return {
                ...prev,
                studioName: artistData.studio_name || prev.studioName,
                studioAddress: artistData.address || prev.studioAddress, // Using 'address' field
                street: artistData.address || prev.street, // Map address to street for display
                experienceYears: artistData.years_experience || prev.experienceYears,
                acceptingWork: artistData.accepting_work !== undefined ? artistData.accepting_work : prev.acceptingWork,
                instagram: artistData.instagram_url || prev.instagram, // Using 'instagram_url' field
                comuna: comunaFromDB || prev.comuna, // Load comuna name
                region: regionFromDB || prev.region // Load region from comuna relationship
              };
            });
          }
          
          // Load styles if available
          if (response.data.styles && Array.isArray(response.data.styles)) {
            setProfileData(prev => ({
              ...prev,
              specialties: response.data.styles.map(style => style.name || style)
            }));
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Initialize comunas when region changes (for manual selection only)
  React.useEffect(() => {
    if (profileData.region && !loading) { // Only run when not loading to avoid conflicts
      // Try exact match first
      let regionData = regionesData.regiones.find(r => r.region === profileData.region);
      
      // If no exact match, try partial match
      if (!regionData) {
        regionData = regionesData.regiones.find(r => 
          r.region.toLowerCase().includes(profileData.region.toLowerCase()) ||
          profileData.region.toLowerCase().includes(r.region.toLowerCase())
        );
      }
      
      if (regionData) {
        setAvailableComunas(regionData.comunas);
        // Reset comuna when region changes manually
        if (profileData.comuna && !regionData.comunas.includes(profileData.comuna)) {
          setProfileData(prev => ({ ...prev, comuna: '' }));
        }
      } else {
        setAvailableComunas([]);
      }
    }
  }, [profileData.region, loading]);

  const handleNestedChange = (parent, field, value) => {
    setProfileData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleSpecialtyToggle = (specialty) => {
    setProfileData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Validations
      const nameParts = profileData.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      if (!firstName) {
        toast.error('El nombre es requerido');
        setIsSaving(false);
        return;
      }
      
      if (!lastName) {
        toast.error('El apellido es requerido');
        setIsSaving(false);
        return;
      }
      
      // Region and Comuna validation
      if (profileData.region && !profileData.comuna) {
        toast.error('Debe seleccionar una comuna para la región elegida');
        setIsSaving(false);
        return;
      }
      
      // Remove spaces from phone number for backend
      const cleanPhone = profileData.phone.replace(/\s/g, '');
      
      const dataToSend = {
        firstName,
        lastName,
        phone: cleanPhone,
        bio: profileData.bio,
        // Artist specific fields
        instagram: profileData.instagram,
        region: profileData.region,
        comuna: profileData.comuna,
        street: profileData.street,
        studioName: profileData.studioName,
        studioAddress: profileData.street || profileData.studioAddress, // Use street field for address
        experienceYears: profileData.experienceYears,
        specialties: profileData.specialties,
        acceptingWork: profileData.acceptingWork
      };
      
      // Update to use actual API call
      const { profileService } = await import('../../services/api');
      await profileService.update(dataToSend);
      
      setIsSaving(false);
      setIsEditing(false);
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error saving profile:', error);
      setIsSaving(false);
      
      // Show specific error messages if available
      if (error.response?.data?.details) {
        const errorMessages = error.response.data.details.map(detail => detail.message).join(', ');
        toast.error(`Error: ${errorMessages}`);
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Error al guardar el perfil. Inténtalo de nuevo.');
      }
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        // Show loading state
        toast.loading('Subiendo imagen...');
        
        // Upload the image to the server
        const response = await profileService.uploadAvatar(file);
        
        if (response.data && response.data.profileImage) {
          // Update the profile data with the new image filename
          setProfileData(prev => ({
            ...prev,
            profileImage: response.data.profileImage
          }));
          
          // Force image refresh by updating timestamp
          setImageTimestamp(Date.now());
          
          toast.dismiss();
          toast.success('Imagen de perfil actualizada');
        } else {
          toast.dismiss();
          toast.error('Error al subir la imagen');
        }
      } catch (error) {
        toast.dismiss();
        console.error('Error uploading image:', error);
        toast.error('Error al subir la imagen. Inténtalo de nuevo.');
      }
    }
  };

  const daysOfWeek = [
    { key: 'monday', label: 'Lunes' },
    { key: 'tuesday', label: 'Martes' },
    { key: 'wednesday', label: 'Miércoles' },
    { key: 'thursday', label: 'Jueves' },
    { key: 'friday', label: 'Viernes' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-100">Mi Perfil</h1>
          <p className="text-primary-400">Gestiona tu información personal y preferencias</p>
        </div>
        <div className="flex items-center space-x-3">
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                loading={isSaving}
              >
                Guardar Cambios
              </Button>
            </>
          ) : (
            <Button variant="primary" onClick={() => setIsEditing(true)}>
              Editar Perfil
            </Button>
          )}
        </div>
      </div>

      <Grid cols={2} gap={6}>
        {/* Basic Information */}
        <Card title="Información Básica">
          <div className="space-y-4">
            {/* Profile Image */}
            <div className="flex items-center space-x-4">
              <img
                src={`${getProfileImageUrl(profileData.profileImage)}${profileData.profileImage ? `?t=${imageTimestamp}` : ''}`}
                alt="Profile"
                className="h-20 w-20 rounded-full object-cover"
              />
              {isEditing && (
                <div>
                  <label className="block">
                    <span className="sr-only">Cambiar foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="block w-full text-sm text-primary-300
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-lg file:border-0
                        file:text-sm file:font-medium
                        file:bg-accent-600 file:text-white
                        hover:file:bg-accent-700"
                    />
                  </label>
                </div>
              )}
            </div>

            <Input
              label="Nombre completo"
              value={profileData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={!isEditing}
            />

            <Input
              label="Email"
              type="email"
              value={profileData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={!isEditing}
            />

            <Input
              label="Teléfono"
              value={profileData.phone}
              onChange={handlePhoneChange}
              disabled={!isEditing}
              placeholder="+56 9 1234 5678"
              maxLength={15} // +56 9 1234 5678 = 15 characters with spaces
            />

            <Input
              label="Instagram"
              value={profileData.instagram}
              onChange={(e) => handleInputChange('instagram', e.target.value)}
              disabled={!isEditing}
              placeholder="@usuario"
            />

            <div>
              <label className="block text-sm font-medium text-primary-200 mb-2">
                Biografía
              </label>
              <textarea
                value={profileData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                disabled={!isEditing}
                rows={4}
                className="w-full bg-primary-700 border border-primary-600 rounded-lg px-3 py-2 text-primary-100 placeholder-primary-400 focus:border-accent-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Cuéntanos sobre tu experiencia y estilo..."
              />
            </div>
          </div>
        </Card>

        {/* Location & Studio */}
        <Card title="Ubicación y Estudio">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-200 mb-2">
                  Región
                </label>
                <select
                  value={profileData.region || ''}
                  onChange={handleRegionChange}
                  disabled={!isEditing}
                  className="w-full bg-primary-700 border border-primary-600 rounded-lg px-3 py-2 text-primary-100 focus:border-accent-500 focus:outline-none disabled:opacity-50"
                >
                  <option value="">Seleccionar región</option>
                  {regionesData.regiones.map((region) => (
                    <option key={region.region} value={region.region}>
                      {region.region}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary-200 mb-2">
                  Comuna
                </label>
                <select
                  value={profileData.comuna || ''}
                  onChange={(e) => handleInputChange('comuna', e.target.value)}
                  disabled={!isEditing || availableComunas.length === 0}
                  className="w-full bg-primary-700 border border-primary-600 rounded-lg px-3 py-2 text-primary-100 focus:border-accent-500 focus:outline-none disabled:opacity-50"
                >
                  <option value="">
                    {availableComunas.length === 0 ? 'Primero selecciona una región' : 'Seleccionar comuna'}
                  </option>
                  {availableComunas.map((comuna) => (
                    <option key={comuna} value={comuna}>
                      {comuna}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Input
              label="Calle y Número"
              value={profileData.street}
              onChange={(e) => handleInputChange('street', e.target.value)}
              disabled={!isEditing}
              placeholder="Ej: Av. Providencia 1234"
            />

            <Input
              label="Nombre del estudio"
              value={profileData.studioName}
              onChange={(e) => handleInputChange('studioName', e.target.value)}
              disabled={!isEditing}
            />

            <Input
              label="Dirección del estudio"
              value={profileData.studioAddress}
              onChange={(e) => handleInputChange('studioAddress', e.target.value)}
              disabled={!isEditing}
            />

            <Input
              label="Años de experiencia"
              type="number"
              value={profileData.experienceYears}
              onChange={(e) => handleInputChange('experienceYears', parseInt(e.target.value))}
              disabled={!isEditing}
              min="0"
              max="50"
            />

            {/* Availability Toggle */}
            <div className="flex items-center justify-between p-3 bg-primary-800 rounded-lg">
              <div>
                <p className="text-sm font-medium text-primary-100">Aceptando trabajos</p>
                <p className="text-xs text-primary-400">Los clientes pueden enviarte propuestas</p>
              </div>
              <button
                onClick={() => handleInputChange('acceptingWork', !profileData.acceptingWork)}
                disabled={!isEditing}
                className={twMerge(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  profileData.acceptingWork ? 'bg-accent-600' : 'bg-primary-600',
                  !isEditing && 'opacity-50 cursor-not-allowed'
                )}
              >
                <span
                  className={twMerge(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    profileData.acceptingWork ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>
          </div>
        </Card>
      </Grid>

      {/* Specialties */}
      <Card title="Especialidades">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {specialtyOptions.map((specialty) => (
            <label key={specialty} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={profileData.specialties.includes(specialty)}
                onChange={() => handleSpecialtyToggle(specialty)}
                disabled={!isEditing}
                className="w-4 h-4 text-accent-600 bg-primary-700 border-primary-600 rounded focus:ring-accent-500 disabled:opacity-50"
              />
              <span className="text-sm text-primary-300">{specialty}</span>
            </label>
          ))}
        </div>
      </Card>

      {/* Price Range */}
      <Card title="Rango de Precios">
        <Grid cols={2} gap={4}>
          <Input
            label="Precio mínimo (CLP)"
            type="number"
            value={profileData.priceRange.min}
            onChange={(e) => handleNestedChange('priceRange', 'min', parseInt(e.target.value))}
            disabled={!isEditing}
            placeholder="50000"
          />
          <Input
            label="Precio máximo (CLP)"
            type="number"
            value={profileData.priceRange.max}
            onChange={(e) => handleNestedChange('priceRange', 'max', parseInt(e.target.value))}
            disabled={!isEditing}
            placeholder="500000"
          />
        </Grid>
      </Card>

      {/* Working Hours */}
      <Card title="Horarios de Atención">
        <div className="space-y-3">
          {daysOfWeek.map((day) => {
            const hours = profileData.workingHours[day.key];
            const isClosed = hours?.closed;
            
            return (
              <div key={day.key} className="flex items-center space-x-4 p-3 bg-primary-800 rounded-lg">
                <div className="w-24">
                  <span className="text-sm text-primary-300">{day.label}</span>
                </div>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isClosed}
                    onChange={(e) => {
                      const newHours = e.target.checked 
                        ? { closed: true }
                        : { open: '10:00', close: '19:00' };
                      setProfileData(prev => ({
                        ...prev,
                        workingHours: {
                          ...prev.workingHours,
                          [day.key]: newHours
                        }
                      }));
                    }}
                    disabled={!isEditing}
                    className="w-4 h-4 text-accent-600 bg-primary-700 border-primary-600 rounded focus:ring-accent-500"
                  />
                  <span className="text-sm text-primary-400">Cerrado</span>
                </label>

                {!isClosed && (
                  <div className="flex items-center space-x-2 flex-1">
                    <Input
                      type="time"
                      value={hours?.open || '10:00'}
                      onChange={(e) => {
                        setProfileData(prev => ({
                          ...prev,
                          workingHours: {
                            ...prev.workingHours,
                            [day.key]: {
                              ...prev.workingHours[day.key],
                              open: e.target.value
                            }
                          }
                        }));
                      }}
                      disabled={!isEditing}
                      size="sm"
                      className="w-24"
                    />
                    <span className="text-primary-400">-</span>
                    <Input
                      type="time"
                      value={hours?.close || '19:00'}
                      onChange={(e) => {
                        setProfileData(prev => ({
                          ...prev,
                          workingHours: {
                            ...prev.workingHours,
                            [day.key]: {
                              ...prev.workingHours[day.key],
                              close: e.target.value
                            }
                          }
                        }));
                      }}
                      disabled={!isEditing}
                      size="sm"
                      className="w-24"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default ProfileTab;
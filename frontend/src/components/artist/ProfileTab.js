import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Card, Grid } from '../common/Layout';
import Button from '../common/Button';
import Input from '../common/Input';
import { getProfileImageUrl } from '../../utils/imageHelpers';

const ProfileTab = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@email.com',
    phone: '+56 9 1234 5678',
    instagram: 'carlos_tattoo_art',
    bio: 'Artista tatuador especializado en realismo y retratos con más de 8 años de experiencia. Mi pasión es crear tatuajes únicos que cuenten la historia de cada persona.',
    location: 'Santiago Centro, Chile',
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
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    setIsEditing(false);
    // In production: save to backend
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData(prev => ({
          ...prev,
          profileImage: e.target.result
        }));
      };
      reader.readAsDataURL(file);
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
                src={getProfileImageUrl(profileData.profileImage)}
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
              onChange={(e) => handleInputChange('phone', e.target.value)}
              disabled={!isEditing}
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
            <Input
              label="Ubicación"
              value={profileData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              disabled={!isEditing}
              placeholder="Ciudad, País"
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
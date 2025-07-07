import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer, Card, Stack } from '../../components/common/Layout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuth } from '../../context';
import { requestsAPI, catalogsAPI } from '../../services/api';

const CreateOfferView = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [catalogs, setCatalogs] = useState({
    styles: [],
    bodyParts: [],
  });
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    style: '',
    size: '',
    bodyPart: '',
    isUrgent: false,
    deadline: '',
    referenceImage: null,
    additionalInfo: '',
  });
  
  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Load catalogs on mount
  React.useEffect(() => {
    loadCatalogs();
  }, []);

  const loadCatalogs = async () => {
    try {
      // In production: const [styles, bodyParts] = await Promise.all([
      //   catalogsAPI.getTattooStyles(),
      //   catalogsAPI.getBodyParts()
      // ]);
      
      // Mock data for demo
      setCatalogs({
        styles: [
          'Realista', 'Tradicional', 'Neo-tradicional', 'Blackwork',
          'Dotwork', 'Acuarela', 'Japonés', 'Tribal', 'Minimalista',
          'Geométrico', 'Biomecánico', 'New School'
        ],
        bodyParts: [
          'Brazo', 'Antebrazo', 'Pierna', 'Espalda', 'Pecho',
          'Hombro', 'Muñeca', 'Tobillo', 'Cuello', 'Mano'
        ],
      });
    } catch (error) {
      console.error('Error loading catalogs:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, referenceImage: 'Solo se permiten imágenes (JPG, PNG, WEBP)' }));
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, referenceImage: 'La imagen no debe superar 5MB' }));
      return;
    }
    
    setFormData(prev => ({ ...prev, referenceImage: file }));
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, referenceImage: null }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    } else if (formData.title.length < 10) {
      newErrors.title = 'El título debe tener al menos 10 caracteres';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    } else if (formData.description.length < 50) {
      newErrors.description = 'La descripción debe tener al menos 50 caracteres';
    }
    
    if (!formData.budget) {
      newErrors.budget = 'El presupuesto es requerido';
    } else if (parseInt(formData.budget) < 10000) {
      newErrors.budget = 'El presupuesto mínimo es $10.000';
    }
    
    if (!formData.style) {
      newErrors.style = 'Selecciona un estilo';
    }
    
    if (!formData.size) {
      newErrors.size = 'Selecciona un tamaño';
    }
    
    if (!formData.bodyPart) {
      newErrors.bodyPart = 'Selecciona la parte del cuerpo';
    }
    
    if (formData.isUrgent && !formData.deadline) {
      newErrors.deadline = 'La fecha límite es requerida para ofertas urgentes';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    try {
      setLoading(true);
      
      // Create form data for file upload
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });
      
      // In production: const response = await requestsAPI.createRequest(submitData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message and redirect
      navigate('/feed', { 
        state: { message: 'Oferta creada exitosamente' }
      });
    } catch (error) {
      console.error('Error creating offer:', error);
      setErrors({ submit: 'Error al crear la oferta. Por favor intenta nuevamente.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer
      title="Crear Nueva Oferta"
      subtitle="Describe el tatuaje que deseas y recibe propuestas de artistas"
      breadcrumbs={[
        { label: 'Feed', href: '/feed' },
        { label: 'Crear Oferta' }
      ]}
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit}>
        <Stack spacing={6}>
          {/* Basic Information */}
          <Card title="Información Básica">
            <Stack spacing={4}>
              <Input
                label="Título de la oferta"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                error={errors.title}
                placeholder="Ej: Tatuaje de dragón japonés en brazo"
                helperText="Sé específico para atraer a los artistas adecuados"
                required
              />
              
              <div>
                <label className="block text-sm font-medium text-primary-200 mb-2">
                  Descripción detallada
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={5}
                  className={`w-full px-4 py-3 bg-primary-700 border ${
                    errors.description ? 'border-error-500' : 'border-primary-600'
                  } rounded-lg text-primary-100 placeholder-primary-500 focus:border-accent-500 focus:outline-none resize-none`}
                  placeholder="Describe lo que buscas con el mayor detalle posible..."
                  required
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-error-400">{errors.description}</p>
                )}
                <p className="mt-1 text-xs text-primary-500">
                  {formData.description.length}/500 caracteres
                </p>
              </div>
              
              <Input
                label="Presupuesto (CLP)"
                name="budget"
                type="number"
                value={formData.budget}
                onChange={handleInputChange}
                error={errors.budget}
                placeholder="100000"
                helperText="Ingresa tu presupuesto máximo en pesos chilenos"
                required
                icon={
                  <span className="text-primary-400">$</span>
                }
              />
            </Stack>
          </Card>

          {/* Tattoo Details */}
          <Card title="Detalles del Tatuaje">
            <Stack spacing={4}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-200 mb-2">
                    Estilo
                  </label>
                  <select
                    name="style"
                    value={formData.style}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-primary-700 border ${
                      errors.style ? 'border-error-500' : 'border-primary-600'
                    } rounded-lg text-primary-100 focus:border-accent-500 focus:outline-none`}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {catalogs.styles.map(style => (
                      <option key={style} value={style}>{style}</option>
                    ))}
                  </select>
                  {errors.style && (
                    <p className="mt-1 text-sm text-error-400">{errors.style}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-200 mb-2">
                    Tamaño
                  </label>
                  <select
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-primary-700 border ${
                      errors.size ? 'border-error-500' : 'border-primary-600'
                    } rounded-lg text-primary-100 focus:border-accent-500 focus:outline-none`}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    <option value="small">Pequeño (2-5cm)</option>
                    <option value="medium">Mediano (5-15cm)</option>
                    <option value="large">Grande (15-30cm)</option>
                    <option value="xlarge">Extra Grande (30cm+)</option>
                  </select>
                  {errors.size && (
                    <p className="mt-1 text-sm text-error-400">{errors.size}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-200 mb-2">
                    Parte del cuerpo
                  </label>
                  <select
                    name="bodyPart"
                    value={formData.bodyPart}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-primary-700 border ${
                      errors.bodyPart ? 'border-error-500' : 'border-primary-600'
                    } rounded-lg text-primary-100 focus:border-accent-500 focus:outline-none`}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {catalogs.bodyParts.map(part => (
                      <option key={part} value={part}>{part}</option>
                    ))}
                  </select>
                  {errors.bodyPart && (
                    <p className="mt-1 text-sm text-error-400">{errors.bodyPart}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isUrgent"
                    checked={formData.isUrgent}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-accent-600 bg-primary-700 border-primary-600 rounded focus:ring-accent-500"
                  />
                  <span className="ml-2 text-sm text-primary-300">
                    Marcar como urgente
                  </span>
                </label>
                
                {formData.isUrgent && (
                  <Input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    error={errors.deadline}
                    size="sm"
                    min={new Date().toISOString().split('T')[0]}
                  />
                )}
              </div>
            </Stack>
          </Card>

          {/* Reference Image */}
          <Card title="Imagen de Referencia">
            <div>
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? 'border-accent-500 bg-accent-500 bg-opacity-10' : 'border-primary-600'
                } ${errors.referenceImage ? 'border-error-500' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-64 mx-auto rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-2 bg-error-600 text-white rounded-full hover:bg-error-700 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <svg className="h-12 w-12 text-primary-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-primary-300 mb-2">
                      Arrastra y suelta una imagen aquí, o{' '}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-accent-400 hover:text-accent-300 font-medium"
                      >
                        selecciona un archivo
                      </button>
                    </p>
                    <p className="text-xs text-primary-500">
                      JPG, PNG o WEBP. Máximo 5MB.
                    </p>
                  </>
                )}
              </div>
              {errors.referenceImage && (
                <p className="mt-2 text-sm text-error-400">{errors.referenceImage}</p>
              )}
            </div>
          </Card>

          {/* Additional Information */}
          <Card title="Información Adicional (Opcional)">
            <textarea
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-primary-100 placeholder-primary-500 focus:border-accent-500 focus:outline-none resize-none"
              placeholder="Cualquier detalle adicional que quieras compartir..."
            />
          </Card>

          {/* Error message */}
          {errors.submit && (
            <div className="bg-error-50 border border-error-200 rounded-lg p-4">
              <p className="text-error-800 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/feed')}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              size="lg"
            >
              Publicar Oferta
            </Button>
          </div>
        </Stack>
      </form>
    </PageContainer>
  );
};

export default CreateOfferView;
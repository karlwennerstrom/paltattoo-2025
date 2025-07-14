import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer, Card, Stack } from '../../components/common/Layout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuth } from '../../contexts/AuthContext';
import { offerService, catalogService } from '../../services/api';
import toast from 'react-hot-toast';

const CreateOfferView = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [catalogs, setCatalogs] = useState({
    styles: [],
    bodyParts: [],
    colorTypes: [],
  });
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budgetMin: '',
    budgetMax: '',
    styleId: '',
    sizeDescription: '',
    bodyPartId: '',
    colorTypeId: '',
    deadline: '',
    referenceImage: null,
  });
  
  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Load catalogs on mount
  useEffect(() => {
    loadCatalogs();
  }, []);

  const loadCatalogs = async () => {
    try {
      const [stylesRes, bodyPartsRes, colorTypesRes] = await Promise.all([
        catalogService.getStyles(),
        catalogService.getBodyParts(),
        catalogService.getColorTypes()
      ]);
      
      setCatalogs({
        styles: stylesRes.data || [],
        bodyParts: bodyPartsRes.data || [],
        colorTypes: colorTypesRes.data || [],
      });
    } catch (error) {
      console.error('Error loading catalogs:', error);
      toast.error('Error al cargar los catálogos');
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
    setErrors(prev => ({ ...prev, referenceImage: '' }));
    
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
    
    if (!formData.budgetMin) {
      newErrors.budgetMin = 'El presupuesto mínimo es requerido';
    } else if (parseInt(formData.budgetMin) < 10000) {
      newErrors.budgetMin = 'El presupuesto mínimo debe ser al menos $10.000';
    }
    
    if (!formData.budgetMax) {
      newErrors.budgetMax = 'El presupuesto máximo es requerido';
    } else if (parseInt(formData.budgetMax) < parseInt(formData.budgetMin)) {
      newErrors.budgetMax = 'El presupuesto máximo debe ser mayor al mínimo';
    }
    
    if (!formData.styleId) {
      newErrors.styleId = 'Selecciona un estilo';
    }
    
    if (!formData.sizeDescription) {
      newErrors.sizeDescription = 'Describe el tamaño del tatuaje';
    }
    
    if (!formData.bodyPartId) {
      newErrors.bodyPartId = 'Selecciona la parte del cuerpo';
    }
    
    if (!formData.colorTypeId) {
      newErrors.colorTypeId = 'Selecciona el tipo de color';
    }
    
    if (formData.deadline) {
      const deadlineDate = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (deadlineDate < today) {
        newErrors.deadline = 'La fecha límite debe ser futura';
      }
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Scroll to first error
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    try {
      setLoading(true);
      
      // Prepare offer data
      const offerData = {
        title: formData.title,
        description: formData.description,
        bodyPartId: parseInt(formData.bodyPartId),
        styleId: parseInt(formData.styleId),
        colorTypeId: parseInt(formData.colorTypeId),
        sizeDescription: formData.sizeDescription,
        budgetMin: parseInt(formData.budgetMin),
        budgetMax: parseInt(formData.budgetMax),
        deadline: formData.deadline || null
      };
      
      // Create the offer first
      const response = await offerService.create(offerData);
      const offerId = response.data.offer.id;
      
      // Upload reference image if provided
      if (formData.referenceImage) {
        const imageFormData = new FormData();
        imageFormData.append('reference', formData.referenceImage);
        await offerService.uploadReferences(offerId, [formData.referenceImage]);
      }
      
      toast.success('Oferta creada exitosamente');
      navigate('/feed');
    } catch (error) {
      console.error('Error creating offer:', error);
      if (error.response?.data?.errors) {
        const apiErrors = {};
        error.response.data.errors.forEach(err => {
          if (err.path) {
            apiErrors[err.path] = err.msg;
          }
        });
        setErrors(apiErrors);
      } else {
        setErrors({ submit: error.response?.data?.error || 'Error al crear la oferta' });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
                maxLength={100}
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
                  maxLength={1000}
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
                  {formData.description.length}/1000 caracteres
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Presupuesto mínimo (CLP)"
                  name="budgetMin"
                  type="number"
                  value={formData.budgetMin}
                  onChange={handleInputChange}
                  error={errors.budgetMin}
                  placeholder="100000"
                  helperText="Presupuesto mínimo en pesos chilenos"
                  required
                  min="10000"
                  icon={<span className="text-primary-400">$</span>}
                />
                
                <Input
                  label="Presupuesto máximo (CLP)"
                  name="budgetMax"
                  type="number"
                  value={formData.budgetMax}
                  onChange={handleInputChange}
                  error={errors.budgetMax}
                  placeholder="500000"
                  helperText="Presupuesto máximo en pesos chilenos"
                  required
                  min="10000"
                  icon={<span className="text-primary-400">$</span>}
                />
              </div>
            </Stack>
          </Card>

          {/* Tattoo Details */}
          <Card title="Detalles del Tatuaje">
            <Stack spacing={4}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-200 mb-2">
                    Estilo *
                  </label>
                  <select
                    name="styleId"
                    value={formData.styleId}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-primary-700 border ${
                      errors.styleId ? 'border-error-500' : 'border-primary-600'
                    } rounded-lg text-primary-100 focus:border-accent-500 focus:outline-none`}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {catalogs.styles.map(style => (
                      <option key={style.id} value={style.id}>{style.name}</option>
                    ))}
                  </select>
                  {errors.styleId && (
                    <p className="mt-1 text-sm text-error-400">{errors.styleId}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-200 mb-2">
                    Parte del cuerpo *
                  </label>
                  <select
                    name="bodyPartId"
                    value={formData.bodyPartId}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-primary-700 border ${
                      errors.bodyPartId ? 'border-error-500' : 'border-primary-600'
                    } rounded-lg text-primary-100 focus:border-accent-500 focus:outline-none`}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {catalogs.bodyParts.map(part => (
                      <option key={part.id} value={part.id}>{part.name}</option>
                    ))}
                  </select>
                  {errors.bodyPartId && (
                    <p className="mt-1 text-sm text-error-400">{errors.bodyPartId}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-200 mb-2">
                    Tipo de color *
                  </label>
                  <select
                    name="colorTypeId"
                    value={formData.colorTypeId}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-primary-700 border ${
                      errors.colorTypeId ? 'border-error-500' : 'border-primary-600'
                    } rounded-lg text-primary-100 focus:border-accent-500 focus:outline-none`}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {catalogs.colorTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                  {errors.colorTypeId && (
                    <p className="mt-1 text-sm text-error-400">{errors.colorTypeId}</p>
                  )}
                </div>
                
                <Input
                  label="Descripción del tamaño"
                  name="sizeDescription"
                  value={formData.sizeDescription}
                  onChange={handleInputChange}
                  error={errors.sizeDescription}
                  placeholder="Ej: 15x20cm, manga completa, etc."
                  helperText="Describe el tamaño aproximado"
                  required
                />
              </div>
              
              <div>
                <Input
                  label="Fecha límite (opcional)"
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  error={errors.deadline}
                  min={new Date().toISOString().split('T')[0]}
                  helperText="Si necesitas el tatuaje antes de una fecha específica"
                />
              </div>
            </Stack>
          </Card>

          {/* Reference Image */}
          <Card title="Imagen de Referencia (Opcional)">
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
              <p className="mt-2 text-xs text-primary-500">
                Agregar una imagen de referencia ayuda a los tatuadores a entender mejor tu idea
              </p>
            </div>
          </Card>

          {/* Error message */}
          {errors.submit && (
            <div className="bg-error-900 border border-error-700 rounded-lg p-4">
              <p className="text-error-200 text-sm">{errors.submit}</p>
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
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PageContainer, Card, Stack } from '../../components/common/Layout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuth } from '../../contexts/AuthContext';
import { offerService, catalogService } from '../../services/api';
import PublishingAnimation from '../../components/animations/PublishingAnimation';
import toast from 'react-hot-toast';

const CreateOfferView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  
  // Get prefilled data from navigation state (from dashboard quick request)
  const { prefilledData, fromQuickRequest, suggestionType } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [publishingStatus, setPublishingStatus] = useState(null); // null, 'publishing', 'complete'
  const [createdOfferId, setCreatedOfferId] = useState(null);
  const [catalogs, setCatalogs] = useState({
    styles: [],
    bodyParts: [],
    colorTypes: [],
    regions: [],
    comunas: [],
  });
  
  const [formData, setFormData] = useState({
    title: prefilledData?.title || '',
    description: prefilledData?.description || (prefilledData?.tattooIdea || ''),
    budgetMin: prefilledData?.budgetRange?.split('-')[0] || '',
    budgetMax: prefilledData?.budgetRange?.split('-')[1] || '',
    styleId: '',
    sizeDescription: '',
    bodyPartId: '',
    colorTypeId: '',
    regionId: '',
    comunaId: '',
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
      const [stylesRes, bodyPartsRes, colorTypesRes, regionsRes] = await Promise.all([
        catalogService.getStyles(),
        catalogService.getBodyParts(),
        catalogService.getColorTypes(),
        catalogService.getRegions()
      ]);
      
      // Deduplicate data in case there are duplicates
      const uniqueStyles = [...new Map((stylesRes.data || []).map(item => [item.id, item])).values()];
      const uniqueBodyParts = [...new Map((bodyPartsRes.data || []).map(item => [item.id, item])).values()];
      const uniqueColorTypes = [...new Map((colorTypesRes.data || []).map(item => [item.id, item])).values()];
      
      // Handle regions - they come as an array of strings
      const regionsArray = regionsRes.data || [];
      const uniqueRegions = regionsArray.map((region, index) => ({
        id: region, // Use region name as ID since backend expects it
        name: region
      }));
      
      setCatalogs({
        styles: uniqueStyles,
        bodyParts: uniqueBodyParts,
        colorTypes: uniqueColorTypes,
        regions: uniqueRegions,
        comunas: [],
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

  const handleRegionChange = async (e) => {
    const regionId = e.target.value;
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      regionId: regionId,
      comunaId: '' // Reset comuna when region changes
    }));
    
    // Clear errors
    if (errors.regionId) {
      setErrors(prev => ({ ...prev, regionId: '', comunaId: '' }));
    }
    
    // Load comunas for selected region
    if (regionId) {
      try {
        const comunasRes = await catalogService.getComunas(regionId);
        const comunasArray = comunasRes.data || [];
        
        // Remove duplicates by name (case insensitive)
        const uniqueComunas = [];
        const seenNames = new Set();
        
        for (const comuna of comunasArray) {
          const nameKey = comuna.name.toLowerCase();
          if (!seenNames.has(nameKey)) {
            seenNames.add(nameKey);
            uniqueComunas.push(comuna);
          }
        }
        
        // Sort alphabetically
        uniqueComunas.sort((a, b) => a.name.localeCompare(b.name));
        
        setCatalogs(prev => ({
          ...prev,
          comunas: uniqueComunas
        }));
      } catch (error) {
        console.error('Error loading comunas:', error);
        toast.error('Error al cargar las comunas');
      }
    } else {
      // Clear comunas if no region selected
      setCatalogs(prev => ({
        ...prev,
        comunas: []
      }));
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
    
    if (!formData.regionId) {
      newErrors.regionId = 'Selecciona una región';
    }
    
    if (!formData.comunaId) {
      newErrors.comunaId = 'Selecciona una comuna';
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
    
    // Prevent double submission
    if (loading || publishingStatus === 'publishing') {
      return;
    }
    
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Scroll to first error
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }
    
    try {
      setLoading(true);
      setPublishingStatus('publishing');
      setErrors({}); // Clear any previous errors
      
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
        regionId: parseInt(formData.regionId),
        comunaId: parseInt(formData.comunaId),
        deadline: formData.deadline || null
      };
      
      // Create the offer
      const response = await offerService.create(offerData);
      const offerId = response.data.offer.id;
      setCreatedOfferId(offerId); // Store the created offer ID
      
      // Upload reference image if provided
      if (formData.referenceImage && offerId) {
        try {
          await offerService.uploadReferences(offerId, [formData.referenceImage]);
        } catch (imageError) {
          console.warn('Image upload failed, but offer was created:', imageError);
          // Don't fail the whole process if only image upload fails
        }
      }
      
      // The animation will handle the completion and navigation
    } catch (error) {
      console.error('Error creating offer:', error);
      
      // Reset publishing status on error
      setPublishingStatus(null);
      
      // Handle different types of errors
      if (error.name === 'AbortError' || error.message?.includes('message channel closed')) {
        // Browser extension interference - show user-friendly message
        setErrors({ 
          submit: 'Hubo un problema temporal. Por favor, intenta nuevamente.' 
        });
      } else if (error.response?.data?.errors) {
        const apiErrors = {};
        error.response.data.errors.forEach(err => {
          if (err.path) {
            apiErrors[err.path] = err.msg;
          }
        });
        setErrors(apiErrors);
      } else if (error.response?.data?.error) {
        setErrors({ submit: error.response.data.error });
      } else {
        setErrors({ 
          submit: 'Error al crear la oferta. Por favor, verifica tu conexión e intenta nuevamente.' 
        });
      }
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      if (publishingStatus !== 'publishing') {
        setLoading(false);
      }
    }
  };

  const handlePublishingComplete = () => {
    // Use setTimeout to ensure state updates are processed
    setTimeout(() => {
      setPublishingStatus(null);
      setLoading(false);
      toast.success('¡Solicitud publicada exitosamente!', {
        duration: 5000,
        icon: '🎉'
      });
      // Navigate to my requests page to see the new offer
      navigate('/my-requests');
    }, 100);
  };

  return (
    <>
      {publishingStatus === 'publishing' && (
        <PublishingAnimation 
          status={publishingStatus}
          onComplete={handlePublishingComplete}
        />
      )}
      
      {publishingStatus !== 'publishing' && (
    <PageContainer
      title={fromQuickRequest ? "Completa tu solicitud" : "Crear Nueva Oferta"}
      subtitle={fromQuickRequest ? "Finaliza los detalles de tu tatuaje ideal" : "Describe el tatuaje que deseas y recibe propuestas de artistas"}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
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
                  Descripción detallada *
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
                <div className="mt-1 flex items-center justify-between">
                  <p className={`text-xs ${formData.description.length < 50 ? 'text-warning-400' : 'text-primary-500'}`}>
                    {formData.description.length}/1000 caracteres {formData.description.length < 50 && '(mínimo 50)'}
                  </p>
                  {formData.description.length >= 50 && (
                    <span className="text-xs text-success-400">✓ Longitud válida</span>
                  )}
                </div>
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-200 mb-2">
                    Región *
                  </label>
                  <select
                    name="regionId"
                    value={formData.regionId}
                    onChange={handleRegionChange}
                    className={`w-full px-4 py-3 bg-primary-700 border ${
                      errors.regionId ? 'border-error-500' : 'border-primary-600'
                    } rounded-lg text-primary-100 focus:border-accent-500 focus:outline-none`}
                    required
                  >
                    <option value="">Seleccionar región...</option>
                    {catalogs.regions.map(region => (
                      <option key={region.id} value={region.id}>{region.name}</option>
                    ))}
                  </select>
                  {errors.regionId && (
                    <p className="mt-1 text-sm text-error-400">{errors.regionId}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-200 mb-2">
                    Comuna *
                  </label>
                  <select
                    name="comunaId"
                    value={formData.comunaId}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-primary-700 border ${
                      errors.comunaId ? 'border-error-500' : 'border-primary-600'
                    } rounded-lg text-primary-100 focus:border-accent-500 focus:outline-none`}
                    required
                    disabled={!formData.regionId}
                  >
                    <option value="">
                      {formData.regionId ? 'Seleccionar comuna...' : 'Primero selecciona una región'}
                    </option>
                    {catalogs.comunas.map(comuna => (
                      <option key={comuna.id} value={comuna.id}>{comuna.name}</option>
                    ))}
                  </select>
                  {errors.comunaId && (
                    <p className="mt-1 text-sm text-error-400">{errors.comunaId}</p>
                  )}
                </div>
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
              onClick={() => navigate('/dashboard')}
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
      )}
    </>
  );
};

export default CreateOfferView;
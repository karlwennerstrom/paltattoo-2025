import React, { useState } from 'react';
import { Container, Section, Card } from '../components/common/Layout';
import { FiImage, FiGrid, FiList, FiHeart, FiUser, FiMapPin, FiFilter, FiSearch, FiDownload, FiShare2 } from 'react-icons/fi';
import Button from '../components/common/Button';

const InspirationGalleryPage = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', name: 'Todos', count: 2500 },
    { id: 'realistic', name: 'Realista', count: 450 },
    { id: 'traditional', name: 'Tradicional', count: 380 },
    { id: 'geometric', name: 'Geométrico', count: 320 },
    { id: 'watercolor', name: 'Acuarela', count: 290 },
    { id: 'minimalist', name: 'Minimalista', count: 280 },
    { id: 'blackwork', name: 'Blackwork', count: 220 },
    { id: 'neo-traditional', name: 'Neo-tradicional', count: 210 },
    { id: 'japanese', name: 'Japonés', count: 190 }
  ];

  const styles = [
    { id: 'all', name: 'Todos los estilos' },
    { id: 'small', name: 'Pequeños' },
    { id: 'medium', name: 'Medianos' },
    { id: 'large', name: 'Grandes' },
    { id: 'sleeve', name: 'Mangas' },
    { id: 'back', name: 'Espalda' },
    { id: 'leg', name: 'Piernas' },
    { id: 'arm', name: 'Brazos' }
  ];

  const tattooGallery = [
    {
      id: 1,
      title: 'Dragón Japonés',
      artist: 'Kenji Nakamura',
      location: 'Santiago',
      category: 'japanese',
      style: 'large',
      size: 'Grande',
      duration: '8 horas',
      image: '/api/placeholder/400/500',
      likes: 234,
      views: 1250,
      description: 'Dragón tradicional japonés con técnica de sombreado clásica'
    },
    {
      id: 2,
      title: 'Rosa Acuarela',
      artist: 'María González',
      location: 'Valparaíso',
      category: 'watercolor',
      style: 'medium',
      size: 'Mediano',
      duration: '4 horas',
      image: '/api/placeholder/400/600',
      likes: 189,
      views: 890,
      description: 'Rosa con técnica de acuarela y colores vibrantes'
    },
    {
      id: 3,
      title: 'Retrato Realista',
      artist: 'Carlos Mendoza',
      location: 'Concepción',
      category: 'realistic',
      style: 'large',
      size: 'Grande',
      duration: '10 horas',
      image: '/api/placeholder/400/550',
      likes: 312,
      views: 1680,
      description: 'Retrato hiperrealista con técnica de fotorrealismo'
    },
    {
      id: 4,
      title: 'Mandala Geométrico',
      artist: 'Ana Ruiz',
      location: 'La Serena',
      category: 'geometric',
      style: 'medium',
      size: 'Mediano',
      duration: '6 horas',
      image: '/api/placeholder/400/400',
      likes: 156,
      views: 720,
      description: 'Mandala con patrones geométricos simétricos'
    },
    {
      id: 5,
      title: 'Líneas Minimalistas',
      artist: 'Diego Torres',
      location: 'Viña del Mar',
      category: 'minimalist',
      style: 'small',
      size: 'Pequeño',
      duration: '2 horas',
      image: '/api/placeholder/400/300',
      likes: 98,
      views: 456,
      description: 'Diseño minimalista con líneas finas y elegantes'
    },
    {
      id: 6,
      title: 'Calavera Tradicional',
      artist: 'Roberto Silva',
      location: 'Antofagasta',
      category: 'traditional',
      style: 'medium',
      size: 'Mediano',
      duration: '5 horas',
      image: '/api/placeholder/400/500',
      likes: 201,
      views: 980,
      description: 'Calavera con estilo tradicional americano'
    },
    {
      id: 7,
      title: 'Blackwork Abstracto',
      artist: 'Patricia López',
      location: 'Temuco',
      category: 'blackwork',
      style: 'large',
      size: 'Grande',
      duration: '7 horas',
      image: '/api/placeholder/400/600',
      likes: 167,
      views: 834,
      description: 'Diseño abstracto en tinta negra sólida'
    },
    {
      id: 8,
      title: 'Flores Neo-tradicionales',
      artist: 'Luis Morales',
      location: 'Rancagua',
      category: 'neo-traditional',
      style: 'medium',
      size: 'Mediano',
      duration: '4 horas',
      image: '/api/placeholder/400/500',
      likes: 143,
      views: 567,
      description: 'Flores con estilo neo-tradicional y colores brillantes'
    },
    {
      id: 9,
      title: 'Manga Completa',
      artist: 'Alejandro Pérez',
      location: 'Iquique',
      category: 'japanese',
      style: 'sleeve',
      size: 'Manga',
      duration: '15 horas',
      image: '/api/placeholder/400/700',
      likes: 398,
      views: 2100,
      description: 'Manga completa con temática japonesa tradicional'
    }
  ];

  const filteredTattoos = tattooGallery.filter(tattoo => {
    const matchesCategory = selectedCategory === 'all' || tattoo.category === selectedCategory;
    const matchesStyle = selectedStyle === 'all' || tattoo.style === selectedStyle;
    const matchesSearch = tattoo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tattoo.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tattoo.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesStyle && matchesSearch;
  });

  const trendingTags = [
    'Dragón', 'Rosa', 'Geométrico', 'Minimalista', 'Realista', 'Japonés', 'Acuarela', 'Blackwork'
  ];

  return (
    <div className="min-h-screen bg-primary-900">
      {/* Hero Section */}
      <Section className="pt-24 pb-16">
        <Container>
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <FiImage className="h-16 w-16 text-accent-500" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-primary-100 mb-6">
              Galería de Inspiración
            </h1>
            <p className="text-xl text-primary-300 mb-8">
              Descubre miles de diseños increíbles de los mejores tatuadores de Chile. 
              Encuentra la inspiración perfecta para tu próximo tatuaje.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" size="lg" href="#gallery">
                Explorar Galería
              </Button>
              <Button variant="outline" size="lg" href="/artists">
                Encontrar Artista
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      {/* Stats */}
      <Section className="py-16 bg-primary-800">
        <Container>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { number: '2,500+', label: 'Diseños Únicos' },
              { number: '150+', label: 'Tatuadores' },
              { number: '50+', label: 'Estilos Diferentes' },
              { number: '100K+', label: 'Visualizaciones Mensuales' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-accent-500 mb-2">
                  {stat.number}
                </div>
                <div className="text-primary-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Search and Filters */}
      <Section id="gallery" className="py-16">
        <Container>
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400" />
                <input
                  type="text"
                  placeholder="Buscar por título, artista o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-primary-700 text-primary-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-accent-600 text-white' 
                      : 'bg-primary-700 text-primary-300 hover:bg-primary-600'
                  }`}
                >
                  <FiGrid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-accent-600 text-white' 
                      : 'bg-primary-700 text-primary-300 hover:bg-primary-600'
                  }`}
                >
                  <FiList className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-accent-600 text-white'
                      : 'bg-primary-700 text-primary-300 hover:bg-primary-600'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>

            {/* Style Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              {styles.map(style => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedStyle === style.id
                      ? 'bg-accent-600 text-white'
                      : 'bg-primary-700 text-primary-300 hover:bg-primary-600'
                  }`}
                >
                  {style.name}
                </button>
              ))}
            </div>

            {/* Trending Tags */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-primary-400 mb-2">Tendencias:</h3>
              <div className="flex flex-wrap gap-2">
                {trendingTags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-primary-800 text-primary-300 rounded-full text-xs cursor-pointer hover:bg-primary-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-primary-300">
              {filteredTattoos.length} diseños encontrados
            </p>
            <select className="bg-primary-700 text-primary-100 px-4 py-2 rounded-lg text-sm">
              <option>Más populares</option>
              <option>Más recientes</option>
              <option>Más likes</option>
              <option>Más vistas</option>
            </select>
          </div>

          {/* Gallery Grid */}
          {viewMode === 'grid' ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTattoos.map(tattoo => (
                <Card key={tattoo.id} className="overflow-hidden group hover:bg-primary-700 transition-colors">
                  <div className="aspect-square bg-primary-700 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex space-x-2">
                        <button className="p-2 bg-primary-800/80 rounded-full hover:bg-primary-700">
                          <FiHeart className="h-4 w-4 text-white" />
                        </button>
                        <button className="p-2 bg-primary-800/80 rounded-full hover:bg-primary-700">
                          <FiShare2 className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="primary" size="sm" className="w-full">
                        Ver Detalle
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-primary-100 mb-1">
                      {tattoo.title}
                    </h3>
                    <div className="flex items-center text-sm text-primary-400 mb-2">
                      <FiUser className="h-4 w-4 mr-1" />
                      {tattoo.artist}
                    </div>
                    <div className="flex items-center text-sm text-primary-400 mb-2">
                      <FiMapPin className="h-4 w-4 mr-1" />
                      {tattoo.location}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-primary-400">
                        <FiHeart className="h-4 w-4 mr-1" />
                        {tattoo.likes}
                      </div>
                      <span className="text-primary-500">{tattoo.views} vistas</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTattoos.map(tattoo => (
                <Card key={tattoo.id} className="p-6">
                  <div className="flex items-start space-x-6">
                    <div className="w-32 h-32 bg-primary-700 rounded-lg flex-shrink-0"></div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-primary-100 mb-2">
                        {tattoo.title}
                      </h3>
                      <p className="text-primary-300 mb-3">
                        {tattoo.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-primary-400 mb-3">
                        <div className="flex items-center">
                          <FiUser className="h-4 w-4 mr-1" />
                          {tattoo.artist}
                        </div>
                        <div className="flex items-center">
                          <FiMapPin className="h-4 w-4 mr-1" />
                          {tattoo.location}
                        </div>
                        <span>{tattoo.size}</span>
                        <span>{tattoo.duration}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center text-primary-400">
                            <FiHeart className="h-4 w-4 mr-1" />
                            {tattoo.likes}
                          </div>
                          <span className="text-primary-500">{tattoo.views} vistas</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <FiHeart className="h-4 w-4 mr-1" />
                            Me gusta
                          </Button>
                          <Button variant="primary" size="sm">
                            Ver Detalle
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Cargar Más Diseños
            </Button>
          </div>
        </Container>
      </Section>

      {/* Featured Artists */}
      <Section className="py-16 bg-primary-800">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-100 mb-4">
              Artistas Destacados
            </h2>
            <p className="text-primary-300 max-w-2xl mx-auto">
              Conoce a los tatuadores más populares de nuestra galería
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Kenji Nakamura', speciality: 'Japonés', works: 45, rating: 4.9 },
              { name: 'María González', speciality: 'Acuarela', works: 38, rating: 4.8 },
              { name: 'Carlos Mendoza', speciality: 'Realista', works: 52, rating: 4.9 }
            ].map((artist, index) => (
              <Card key={index} className="p-6 text-center">
                <div className="w-20 h-20 bg-accent-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiUser className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-primary-100 mb-2">
                  {artist.name}
                </h3>
                <p className="text-primary-400 mb-2">
                  Especialista en {artist.speciality}
                </p>
                <p className="text-primary-300 text-sm mb-4">
                  {artist.works} obras en galería
                </p>
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400">★</span>
                    ))}
                  </div>
                  <span className="text-primary-400 text-sm">({artist.rating})</span>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Ver Perfil
                </Button>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section className="py-16 bg-gradient-to-r from-accent-600 to-accent-700">
        <Container>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              ¿Encontraste tu inspiración?
            </h2>
            <p className="text-accent-100 mb-8 max-w-2xl mx-auto">
              Conecta con el artista perfecto para hacer realidad tu idea
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="secondary" 
                size="lg"
                href="/artists"
                className="bg-white text-accent-600 hover:bg-accent-50"
              >
                Encontrar Artista
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                href="/register"
                className="border-white text-white hover:bg-white hover:text-accent-600"
              >
                Crear Cuenta
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
};

export default InspirationGalleryPage;
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PageContainer, Grid } from '../../components/common/Layout';
import Button from '../../components/common/Button';
import TattooOfferCard from '../../components/feed/TattooOfferCard';
import FeedSidebar from '../../components/feed/FeedSidebar';
import { offerService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const FeedView = () => {
  const { isArtist, isClient } = useAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({
    priceRange: [0, 1000000],
    styles: [],
    sizes: [],
    bodyParts: [],
    location: '',
    sortBy: 'recent',
  });

  const observer = useRef();
  const lastOfferElementRef = useCallback(node => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore]);

  // Helper function to build filter params for API
  const buildFilterParams = (filters, pageNum, limit = 20) => {
    const params = {
      limit,
      offset: (pageNum - 1) * limit,
      status: 'active'
    };

    if (filters.styles && filters.styles.length > 0) {
      params.style = filters.styles[0]; // API expects single style for now
    }

    if (filters.bodyParts && filters.bodyParts.length > 0) {
      params.bodyPart = filters.bodyParts[0]; // API expects single body part for now
    }

    if (filters.priceRange && filters.priceRange[0] > 0) {
      params.minBudget = filters.priceRange[0];
    }

    if (filters.priceRange && filters.priceRange[1] < 1000000) {
      params.maxBudget = filters.priceRange[1];
    }

    return params;
  };

  const loadOffers = async (pageNum = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);

      const filterParams = buildFilterParams(filters, pageNum);
      const response = await offerService.getAll(filterParams);
      const newOffers = response.data || [];
      
      if (append) {
        setOffers(prev => [...prev, ...newOffers]);
      } else {
        setOffers(newOffers);
      }
      
      // Assume we have more data if we got a full page
      setHasMore(newOffers.length === filterParams.limit);
      setError(null);
    } catch (err) {
      setError('Error al cargar las ofertas');
      toast.error('Error al cargar las ofertas');
      console.error('Error loading offers:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadOffers(nextPage, true);
    }
  };

  useEffect(() => {
    setPage(1);
    loadOffers(1);
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleFavorite = async (offerId, isFavorited) => {
    // Update local state
    setOffers(prev => prev.map(offer => 
      offer.id === offerId ? { ...offer, isFavorited } : offer
    ));
    
    // In production, make API call to save favorite
    try {
      // await api.post(`/offers/${offerId}/favorite`, { isFavorited });
    } catch (err) {
      console.error('Error updating favorite:', err);
    }
  };

  const handleShare = (offer) => {
    if (navigator.share) {
      navigator.share({
        title: offer.title,
        text: offer.description,
        url: window.location.origin + `/offers/${offer.id}`,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.origin + `/offers/${offer.id}`);
      // Show notification
    }
  };

  const handleSendProposal = (offer) => {
    // Redirect to proposal creation page with offer data
    window.location.href = `/offers/${offer.id}/send-proposal`;
  };

  return (
    <PageContainer
      title="Ofertas de Tatuajes"
      subtitle={isArtist ? "Encuentra tu próximo proyecto" : "Encuentra tu próximo cliente"}
      actions={
        isClient && (
          <Button variant="primary" size="md" href="/offers/create">
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Crear Oferta
          </Button>
        )
      }
      maxWidth="full"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <FeedSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Main content */}
        <div className="lg:col-span-3">
          {loading && !loadingMore ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500 mx-auto mb-4"></div>
                <p className="text-primary-400">Cargando ofertas...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-error-400 mb-4">{error}</p>
              <Button onClick={() => loadOffers(1)} variant="secondary">
                Reintentar
              </Button>
            </div>
          ) : offers.length === 0 ? (
            <div className="text-center py-12">
              <svg className="h-16 w-16 text-primary-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-primary-400 mb-4">No hay ofertas que coincidan con tus filtros</p>
              <Button onClick={() => setFilters({
                priceRange: [0, 1000000],
                styles: [],
                sizes: [],
                bodyParts: [],
                location: '',
                sortBy: 'recent',
              })} variant="secondary">
                Limpiar filtros
              </Button>
            </div>
          ) : (
            <>
              <Grid cols={3} gap={6}>
                {offers.map((offer, index) => (
                  <div
                    key={offer.id}
                    ref={index === offers.length - 1 ? lastOfferElementRef : null}
                  >
                    <TattooOfferCard
                      offer={offer}
                      onFavorite={handleFavorite}
                      onShare={handleShare}
                      onSendProposal={handleSendProposal}
                    />
                  </div>
                ))}
              </Grid>

              {loadingMore && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500"></div>
                </div>
              )}

              {!hasMore && offers.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-primary-400">No hay más ofertas para mostrar</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default FeedView;
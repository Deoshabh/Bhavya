export const PLACEHOLDER_IMAGES = {
    exhibitions: {
        tech: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
        business: 'https://images.unsplash.com/photo-1591115765373-5207764f72e4?auto=format&fit=crop&w=800&q=80',
        innovation: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
        ai: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
    },
    banners: {
        main: 'https://images.unsplash.com/photo-1492366254240-43affaefc3e3?auto=format&fit=crop&w=1200&q=80',
        secondary: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
    },
    default: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&w=800&q=80'
};

// Function to get a random exhibition image
export const getRandomExhibitionImage = () => {
    const images = Object.values(PLACEHOLDER_IMAGES.exhibitions);
    return images[Math.floor(Math.random() * images.length)];
}; 
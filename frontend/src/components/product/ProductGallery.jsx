import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function ProductGallery({ images = [], name }) {
  const [selected, setSelected] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!images.length) images = ['https://via.placeholder.com/600x600'];

  return (
    <>
      <div className="space-y-3">
        {/* Image principale */}
        <div className="relative overflow-hidden rounded-2xl bg-kora-border aspect-square cursor-zoom-in"
          onClick={() => setLightbox(true)}>
          <AnimatePresence mode="wait">
            <motion.img
              key={selected}
              src={images[selected]}
              alt={`${name} - image ${selected + 1}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full object-cover"
            />
          </AnimatePresence>
          {images.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
              {selected + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all
                  ${selected === i ? 'border-primary' : 'border-transparent hover:border-kora-border'}`}
                aria-label={`Voir image ${i + 1}`}
              >
                <img src={img} alt={`Vignette ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setLightbox(false)}
          >
            <img src={images[selected]} alt={name} className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl" />
            <button onClick={() => setLightbox(false)}
              className="absolute top-4 right-4 text-white bg-white/20 rounded-full p-2 hover:bg-white/40">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

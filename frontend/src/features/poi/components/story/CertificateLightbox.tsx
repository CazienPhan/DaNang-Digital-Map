import React, { useCallback } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { type StoryCertification } from '@/services/supabase/poiStory.service';

interface CertificateLightboxProps {
  /** The gallery being inspected — real certification records only. */
  certifications: StoryCertification[];
  /** Index of the certificate to show. null keeps the lightbox closed. */
  activeIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

/**
 * Enlarged view of one certificate, built on the project's shadcn Dialog so it
 * inherits the application's overlay, focus handling and close affordance.
 *
 * The image is centred and never cropped or stretched — a certificate has to be
 * readable at full size.
 */
export const CertificateLightbox: React.FC<CertificateLightboxProps> = ({
  certifications,
  activeIndex,
  onClose,
  onNavigate,
}) => {
  const open = activeIndex !== null && certifications.length > 0;
  const total = certifications.length;

  const goTo = useCallback(
    (delta: number) => {
      if (activeIndex === null || total === 0) return;
      onNavigate((activeIndex + delta + total) % total);
    },
    [activeIndex, total, onNavigate]
  );

  const cert = activeIndex !== null ? certifications[activeIndex] : undefined;
  if (!open || !cert) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen: boolean) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent
        /*
          The lightbox opens from inside the POI Sheet, so Base UI nests it in
          the Sheet's portal and drops its backdrop; `forceOverlay` brings the
          dim back. The app's own chrome (search bar, mode switcher, floating
          cards) sits at z-index 100–110, so both layers of this one dialog are
          lifted above it — the shared Dialog defaults stay as they are.
        */
        forceOverlay
        overlayClassName="z-[200] bg-black/60"
        showCloseButton={false}
        className="z-[200] max-h-[90vh] w-[min(920px,92vw)] max-w-[min(920px,92vw)] gap-3 bg-background p-4 sm:max-w-[min(920px,92vw)]"
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === 'ArrowLeft') goTo(-1);
          else if (e.key === 'ArrowRight') goTo(1);
        }}
      >
        {/* Same control the shared Dialog renders, with a labelled close. */}
        <DialogClose
          render={<Button variant="ghost" size="icon-sm" className="absolute top-2 right-2 z-10" />}
          aria-label="Đóng chứng nhận"
        >
          <X className="size-4" />
        </DialogClose>

        {/* Named for screen readers; the certificate name is shown below too. */}
        <DialogTitle className="sr-only">{cert.name || 'Chứng nhận'}</DialogTitle>

        <div className="relative flex items-center justify-center">
          <img
            src={cert.imageUrl}
            alt={cert.name || 'Chứng nhận'}
            className="max-h-[74vh] w-auto max-w-full rounded-lg object-contain"
          />

          {total > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={() => goTo(-1)}
                aria-label="Chứng nhận trước"
                className="absolute left-0 rounded-full bg-background/90 shadow-sm"
              >
                <ChevronLeft className="size-4" strokeWidth={2.5} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => goTo(1)}
                aria-label="Chứng nhận tiếp theo"
                className="absolute right-0 rounded-full bg-background/90 shadow-sm"
              >
                <ChevronRight className="size-4" strokeWidth={2.5} />
              </Button>
            </>
          )}
        </div>

        {cert.name && (
          <p className="text-center text-xs leading-snug text-muted-foreground">{cert.name}</p>
        )}
      </DialogContent>
    </Dialog>
  );
};

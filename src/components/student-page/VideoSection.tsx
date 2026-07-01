import { motion } from "framer-motion";

interface VideoSectionProps {
  url?: string;
  buttonLabel?: string;
  buttonUrl?: string;
}

/** Converte um link de YouTube/Vimeo em URL de embed. Retorna null se não reconhecer. */
function getEmbedUrl(url: string): string | null {
  const u = url.trim();
  // YouTube
  const yt = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  // Vimeo
  const vimeo = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

/** É um arquivo de vídeo direto (mp4/webm/mov...)? */
function isDirectVideo(url: string): boolean {
  return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url.trim());
}

const VideoSection = ({ url, buttonLabel, buttonUrl }: VideoSectionProps) => {
  if (!url) return null;

  const embedUrl = getEmbedUrl(url);
  const direct = !embedUrl && isDirectVideo(url);

  return (
    <section className="px-4 sm:px-8 py-8 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-lg mx-auto space-y-4"
      >
        <div className="relative w-full overflow-hidden rounded-xl border border-border bg-black" style={{ aspectRatio: "16 / 9" }}>
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title="Vídeo"
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : direct ? (
            <video src={url} controls playsInline className="absolute inset-0 w-full h-full object-contain" />
          ) : (
            // Fallback: link simples caso não seja embed nem arquivo reconhecido
            <a href={url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 flex items-center justify-center text-white/80 text-sm underline">
              Abrir vídeo
            </a>
          )}
        </div>

        {buttonUrl && (
          <a
            href={buttonUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full btn-premium text-[15px] group"
          >
            {buttonLabel || "Acessar Área de Membros"}
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
        )}
      </motion.div>
    </section>
  );
};

export default VideoSection;

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, Disc3 } from "lucide-react";

interface SpotifyData {
  isPlaying: boolean;
  title: string;
  artist: string;
  album: string;
  albumImageUrl: string;
  songUrl: string;
}

export function SpotifyWidget() {
  const [data, setData] = useState<SpotifyData | null>(null);

  useEffect(() => {
    const fetchSpotify = async () => {
      try {
        const res = await fetch("/api/spotify");
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Failed to fetch Spotify data", error);
      }
    };

    fetchSpotify();
    const interval = setInterval(fetchSpotify, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-6 left-6 z-50 hidden sm:block">
      <AnimatePresence>
        {data && (
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="flex items-center gap-4 bg-[var(--bg)]/90 backdrop-blur-xl border border-[var(--line)] shadow-2xl rounded-full p-2 pr-6 overflow-hidden max-w-sm ring-1 ring-white/5"
          >
            {/* Album Art / Vinyl */}
            <a
              href={data?.songUrl ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="relative w-12 h-12 flex-shrink-0 group block"
            >
              {data.isPlaying ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="w-full h-full rounded-full border border-[var(--line)] overflow-hidden shadow-inner flex items-center justify-center bg-black/20"
                >
                  <img
                    src={data.albumImageUrl}
                    alt={data.album}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent rounded-full pointer-events-none" />
                  <div className="absolute w-3 h-3 bg-[var(--bg)] rounded-full border border-black/10 shadow-sm" />
                </motion.div>
              ) : (
                <div className="w-full h-full rounded-full border border-[var(--line)] flex items-center justify-center bg-[var(--surface-muted)]">
                  <Music className="w-5 h-5 text-[var(--soft)]" />
                </div>
              )}
            </a>

            {/* Song Info */}
            <div className="flex flex-col justify-center min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#1DB954] uppercase">
                  {data.isPlaying ? "Now Playing" : "Spotify"}
                </span>
                {data.isPlaying && (
                  <div className="flex items-end gap-[2px] h-[10px]">
                    <motion.div
                      animate={{ height: ["4px", "10px", "4px"] }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                      className="w-[2px] bg-[#1DB954] rounded-t-full"
                    />
                    <motion.div
                      animate={{ height: ["8px", "4px", "8px"] }}
                      transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
                      className="w-[2px] bg-[#1DB954] rounded-t-full"
                    />
                    <motion.div
                      animate={{ height: ["5px", "9px", "5px"] }}
                      transition={{ duration: 1.0, repeat: Infinity, ease: "easeInOut" }}
                      className="w-[2px] bg-[#1DB954] rounded-t-full"
                    />
                  </div>
                )}
              </div>
              
              <a
                href={data?.songUrl ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate font-semibold text-[var(--ink)] text-sm hover:underline mt-0.5"
              >
                {data.isPlaying ? data.title : "Not Playing"}
              </a>
              <span className="truncate text-xs text-[var(--soft)]">
                {data.isPlaying ? data.artist : "Spotify Client Disconnected"}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

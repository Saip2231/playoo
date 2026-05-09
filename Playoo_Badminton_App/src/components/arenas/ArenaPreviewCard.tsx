"use client";

import React from "react";
import Link from "next/link";
import { Star, MapPin, Sparkles, ChevronRight } from "lucide-react";
import { Arena } from "../../types";

interface ArenaPreviewCardProps {
  arena: Arena;
}

export default function ArenaPreviewCard({ arena }: ArenaPreviewCardProps) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-slate-900 group shadow-lg flex flex-col h-full transition-all duration-300 hover:-translate-y-1.5 hover:border-teal-500/20 hover:shadow-teal-950/15">
      {/* Image Container with Hover Zoom */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-900">
        <img
          src={arena.imageUrl}
          alt={arena.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-950/70 backdrop-blur-md border border-slate-800 text-slate-300 text-xs font-semibold flex items-center space-x-1">
          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
          <span>{arena.rating.toFixed(1)}</span>
        </div>
        
        {/* Sport Tag */}
        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-teal-500 text-white text-xs font-bold tracking-wide shadow-md shadow-teal-500/10">
          {arena.sport}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-lg font-bold text-slate-100 group-hover:text-teal-400 transition-colors line-clamp-1">
              {arena.name}
            </h3>
          </div>
          
          <div className="flex items-center text-slate-400 text-sm space-x-1">
            <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <span className="line-clamp-1">{arena.location}</span>
          </div>

          <div className="flex items-center text-slate-500 text-xs space-x-3 pt-1">
            <span className="px-2 py-0.5 rounded bg-slate-900 text-teal-400 font-semibold border border-teal-500/10">
              {arena.distance}
            </span>
            <span>•</span>
            <span>{arena.reviewsCount} CouchDB Reviews</span>
          </div>

          {/* Amenities Badges */}
          <div className="flex flex-wrap gap-1.5 pt-2">
            {arena.amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity}
                className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-900/80 text-slate-400 border border-slate-800"
              >
                {amenity}
              </span>
            ))}
            {arena.amenities.length > 3 && (
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-900/80 text-slate-500">
                +{arena.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* View Details CTA */}
        <div className="mt-5 pt-4 border-t border-slate-900/80 flex items-center justify-between text-sm group/btn">
          <span className="text-slate-400 group-hover/btn:text-white transition-colors">
            Available Slots Today
          </span>
          <Link
            href={`/arenas/${arena.id}`}
            className="flex items-center space-x-1 font-bold text-teal-400 hover:text-teal-300 transition-colors"
          >
            <span>Book Court</span>
            <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}

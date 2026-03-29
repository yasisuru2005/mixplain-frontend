'use client';

import React, { useRef, useId, useEffect, CSSProperties, ChangeEvent } from 'react';
import { animate, useMotionValue, AnimationPlaybackControls } from 'framer-motion';
import { UploadCloud, Zap, Disc, Music2 } from 'lucide-react';

interface AnimationConfig {
    preview?: boolean;
    scale: number;
    speed: number;
}

interface NoiseConfig {
    opacity: number;
    scale: number;
}

// --- LOGIC TYPES ---
interface HeroProps {
    file: File | null;
    loading: boolean;
    onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onUpload: () => void;
    sizing?: 'fill' | 'stretch';
    color?: string;
    animation?: AnimationConfig;
    noise?: NoiseConfig;
    style?: CSSProperties;
    className?: string;
}

// --- MATH HELPERS ---
function mapRange(
    value: number,
    fromLow: number,
    fromHigh: number,
    toLow: number,
    toHigh: number
): number {
    if (fromLow === fromHigh) return toLow;
    const percentage = (value - fromLow) / (fromHigh - fromLow);
    return toLow + percentage * (toHigh - toLow);
}

const useInstanceId = (): string => {
    const id = useId();
    const cleanId = id.replace(/:/g, "");
    return `shadowoverlay-${cleanId}`;
};

export function EtheralShadow({
    file,
    loading,
    onFileChange,
    onUpload,
    sizing = 'fill',
    color = 'rgba(128, 128, 128, 1)',
    animation = { scale: 100, speed: 90 },
    noise = { opacity: 1, scale: 1.2 },
    style,
    className
}: HeroProps) {
    const id = useInstanceId();
    const animationEnabled = animation && animation.scale > 0;
    const feColorMatrixRef = useRef<SVGFEColorMatrixElement>(null);
    const hueRotateMotionValue = useMotionValue(180);
    const hueRotateAnimation = useRef<AnimationPlaybackControls | null>(null);

    const displacementScale = animation ? mapRange(animation.scale, 1, 100, 20, 100) : 0;
    const animationDuration = animation ? mapRange(animation.speed, 1, 100, 1000, 50) : 1;

    useEffect(() => {
        if (feColorMatrixRef.current && animationEnabled) {
            if (hueRotateAnimation.current) hueRotateAnimation.current.stop();
            
            hueRotateMotionValue.set(0);
            hueRotateAnimation.current = animate(hueRotateMotionValue, 360, {
                duration: animationDuration / 25,
                repeat: Infinity,
                repeatType: "loop",
                repeatDelay: 0,
                ease: "linear",
                delay: 0,
                onUpdate: (value: number) => {
                    if (feColorMatrixRef.current) {
                        feColorMatrixRef.current.setAttribute("values", String(value));
                    }
                }
            });

            return () => {
                if (hueRotateAnimation.current) hueRotateAnimation.current.stop();
            };
        }
    }, [animationEnabled, animationDuration, hueRotateMotionValue]);

    return (
        <div
            className={className}
            style={{
                overflow: "hidden",
                position: "relative",
                width: "100%",
                height: "100vh", 
                backgroundColor: "#0f1115",
                display: "flex",       
                alignItems: "center",  
                justifyContent: "center", 
                ...style
            }}
        >

            <div
                style={{
                    position: "absolute",
                    inset: -displacementScale,
                    filter: animationEnabled ? `url(#${id}) blur(4px)` : "none",
                    zIndex: 0 
                }}
            >
                {animationEnabled && (
                    <svg style={{ position: "absolute", width: 0, height: 0 }}>
                        <defs>
                            <filter id={id}>
                                <feTurbulence
                                    result="undulation"
                                    numOctaves="2"
                                    baseFrequency={`${mapRange(animation.scale, 0, 100, 0.001, 0.0005)},${mapRange(animation.scale, 0, 100, 0.004, 0.002)}`}
                                    seed="0"
                                    type="turbulence"
                                />
                                <feColorMatrix
                                    ref={feColorMatrixRef}
                                    in="undulation"
                                    type="hueRotate"
                                    values="180"
                                />
                                <feColorMatrix
                                    in="dist"
                                    result="circulation"
                                    type="matrix"
                                    values="4 0 0 0 1  4 0 0 0 1  4 0 0 0 1  1 0 0 0 0"
                                />
                                <feDisplacementMap
                                    in="SourceGraphic"
                                    in2="circulation"
                                    scale={displacementScale}
                                    result="dist"
                                />
                                <feDisplacementMap
                                    in="dist"
                                    in2="undulation"
                                    scale={displacementScale}
                                    result="output"
                                />
                            </filter>
                        </defs>
                    </svg>
                )}
                <div
                    style={{
                        backgroundColor: color,
                        maskImage: `url('https://framerusercontent.com/images/ceBGguIpUU8luwByxuQz79t7To.png')`,
                        maskSize: sizing === "stretch" ? "100% 100%" : "cover",
                        maskRepeat: "no-repeat",
                        maskPosition: "center",
                        width: "100%",
                        height: "100%"
                    }}
                />
            </div>


            {noise && noise.opacity > 0 && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage: `url("https://framerusercontent.com/images/g0QcWrxr87K0ufOxIUFBakwYA8.png")`,
                        backgroundSize: noise.scale * 200,
                        backgroundRepeat: "repeat",
                        opacity: noise.opacity / 2,
                        zIndex: 1, 
                        pointerEvents: "none"
                    }}
                />
            )}

            <div
                style={{
                    position: "relative", 
                    textAlign: "center",
                    zIndex: 10, 
                    width: "100%",
                    maxWidth: "800px",
                    padding: "0 20px"
                }}
            >

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-4 drop-shadow-2xl">
                    Explainable AI for <br />
                    <span className="text-gray-300">Professional Mixing</span>
                </h1>

                <p className="mx-auto max-w-[600px] text-gray-300 md:text-lg font-light mb-8 drop-shadow-md">
                   Upload your track. Get a detailed spectral analysis, genre detection, and actionable fix suggestions in seconds.
                </p>

                <div className="w-full max-w-sm mx-auto space-y-4">

                    <div className="relative group">
                        <input
                            type="file"
                            id="hero-upload"
                            className="hidden"
                            onChange={onFileChange}
                            accept="audio/*"
                            disabled={loading}
                        />
                        <label
                            htmlFor="hero-upload"
                            className={`
                                flex items-center justify-center w-full px-8 py-4 
                                rounded-xl font-mono text-sm cursor-pointer transition-all duration-300
                                border border-white/10 backdrop-blur-md
                                ${file 
                                    ? "bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)] border-white/30" 
                                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white hover:border-white/20"
                                }
                            `}
                        >
                            {file ? (
                                <>
                                    <Music2 className="mr-2 h-4 w-4" />
                                    {file.name}
                                </>
                            ) : (
                                <>
                                    <UploadCloud className="mr-2 h-4 w-4" />
                                    Select Audio File (WAV/MP3)
                                </>
                            )}
                        </label>
                    </div>

                    <button
                        onClick={onUpload}
                        disabled={!file || loading}
                        className={`
                            w-full flex items-center justify-center px-8 py-4 
                            rounded-xl font-bold text-white transition-all duration-300
                            backdrop-blur-lg border
                            ${!file 
                                ? "opacity-30 cursor-not-allowed bg-transparent border-white/5 text-gray-500" 
                                : "bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/40 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:scale-[1.02]"
                            }
                        `}
                    >
                        {loading ? (
                            <>
                                <Disc className="mr-2 h-5 w-5 animate-spin" />
                                Analyzing Spectrum...
                            </>
                        ) : (
                            <>
                                <Zap className="mr-2 h-5 w-5 fill-current" />
                                RUN AI ANALYSIS
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
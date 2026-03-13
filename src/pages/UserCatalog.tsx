import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useRole } from "@/store/RoleContext";
import { BookCard } from "@/components/books/BookCard";
import {
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Search, BookOpen, Sparkles, Clock, Users,
  ArrowRight, Library, Bookmark, RotateCcw, ShieldCheck,
  FlaskConical, Landmark, Cpu, Brain, Palette,
  UserRound, Briefcase, HeartPulse, PenLine, BookMarked,
  Feather, Globe, Atom, Film, Music2
} from "lucide-react";
import { Book, UserBookState, BorrowedBook, ReservedBook } from "@/types/book";
import booksData from "@/data/books.json";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

/* ─────────────────────────────────────────────
   Scoped CSS
───────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');

.lp-root, .lp-root * {
  font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;
  box-sizing: border-box;
}

/* ══════════════ HERO ══════════════ */
.lp-hero {
  position: relative;
  min-height: 92vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  padding: 80px 32px 80px;
}
.lp-hero-photo {
  position: absolute; inset: 0; z-index: 0;
  background-image: url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1800&q=80&auto=format&fit=crop');
  background-size: cover;
  background-position: center 35%;
}
.lp-hero-photo::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(110deg, hsl(220 45% 6% / 0.93) 0%, hsl(220 40% 10% / 0.78) 55%, hsl(217 60% 20% / 0.55) 100%);
}
.lp-hero-grid {
  position: absolute; inset: 0; z-index: 1; pointer-events: none;
  background-image:
    linear-gradient(hsl(0 0% 100% / 0.028) 1px, transparent 1px),
    linear-gradient(90deg, hsl(0 0% 100% / 0.028) 1px, transparent 1px);
  background-size: 48px 48px;
}
.lp-hero-content { position: relative; z-index: 2; max-width: 760px; }

.lp-eyebrow {
  display: inline-flex; align-items: center; gap: 7px;
  background: hsl(217 92% 60% / 0.2);
  border: 1px solid hsl(217 92% 60% / 0.45);
  color: hsl(217 92% 82%);
  font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
  padding: 5px 14px 5px 10px; border-radius: 100px; margin-bottom: 28px;
  backdrop-filter: blur(6px);
}
.lp-hero-title {
  font-size: clamp(2.8rem, 6vw, 5rem);
  font-weight: 800; letter-spacing: -0.04em; line-height: 1.0;
  margin-bottom: 22px; color: #fff;
}
.lp-hero-title .accent {
  background: linear-gradient(135deg, hsl(217 92% 72%), hsl(262 80% 78%));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.lp-hero-subtitle {
  font-size: 1.1rem; font-weight: 500; line-height: 1.7;
  color: hsl(220 20% 72%); max-width: 540px; margin-bottom: 40px; letter-spacing: -0.01em;
}
.lp-hero-cta { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }

.lp-btn-primary {
  display: inline-flex; align-items: center; gap: 8px;
  background: hsl(217 92% 55%); color: white;
  font-size: 0.9375rem; font-weight: 700; letter-spacing: -0.01em;
  padding: 13px 24px; border-radius: 12px; border: none; cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s, background 0.15s;
  box-shadow: 0 4px 24px hsl(217 92% 55% / 0.45);
}
.lp-btn-primary:hover {
  background: hsl(217 92% 48%); transform: translateY(-2px);
  box-shadow: 0 8px 32px hsl(217 92% 55% / 0.5);
}
.lp-btn-ghost {
  display: inline-flex; align-items: center; gap: 6px;
  color: #fff; font-size: 0.9rem; font-weight: 600; letter-spacing: -0.01em;
  padding: 13px 20px; border-radius: 12px;
  border: 1px solid hsl(0 0% 100% / 0.28);
  background: hsl(0 0% 100% / 0.08);
  cursor: pointer; transition: background 0.15s;
  backdrop-filter: blur(6px);
}
.lp-btn-ghost:hover { background: hsl(0 0% 100% / 0.16); }

.lp-hero-art {
  position: absolute; right: 5%; top: 50%; transform: translateY(-50%);
  display: none; flex-direction: column; gap: 12px; z-index: 2;
}
@media (min-width: 1024px) { .lp-hero-art { display: flex; } }

.lp-hero-book {
  width: 210px; height: 60px; border-radius: 12px;
  display: flex; align-items: center; padding: 0 18px; gap: 12px;
  font-size: 0.8125rem; font-weight: 700; color: white;
  box-shadow: 0 12px 32px rgba(0,0,0,0.4); backdrop-filter: blur(4px);
}
.lp-hero-book:nth-child(1) { background: hsl(217 92% 50% / 0.9); transform: rotate(-3deg); }
.lp-hero-book:nth-child(2) { background: hsl(262 75% 56% / 0.9); transform: rotate(1.5deg); }
.lp-hero-book:nth-child(3) { background: hsl(340 75% 50% / 0.9); transform: rotate(-1.2deg); }
.lp-hero-book:nth-child(4) { background: hsl(168 70% 36% / 0.9); transform: rotate(2.5deg); }

/* ══════════════ STATS ══════════════ */
.lp-stats {
  display: grid; grid-template-columns: repeat(2, 1fr);
  gap: 16px; padding: 0 32px 22px; max-width: 1400px; margin-top: 10px;
}
@media (min-width: 768px) { .lp-stats { grid-template-columns: repeat(3, 1fr); } }

.lp-stat-card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: 20px; padding: 30px 24px;
  display: flex; flex-direction: column; gap: 4px;
  transition: box-shadow 0.25s, transform 0.25s;
  position: relative; overflow: hidden;
}
.lp-stat-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0;
  height: 3px; border-radius: 20px 20px 0 0;
}
.lp-stat-card:nth-child(1)::before { background: hsl(217 92% 55%); }
.lp-stat-card:nth-child(2)::before { background: hsl(142 72% 40%); }
.lp-stat-card:nth-child(3)::before { background: hsl(30 90% 50%); }
/* lp-3d handles hover for stat cards */
.lp-stat-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
.lp-stat-number { font-size: 2.25rem; font-weight: 800; letter-spacing: -0.045em; line-height: 1; }
.lp-stat-label { font-size: 0.8125rem; font-weight: 600; color: var(--muted-foreground); letter-spacing: -0.01em; margin-top: 4px; }

/* ══════════════ SECTION BASE ══════════════ */
.lp-section { padding: 72px 32px; max-width: 1400px; margin: 0 auto; }
.lp-section-header { text-align: center; margin-bottom: 52px; }
.lp-section-tag {
  display: inline-block; font-size: 0.6875rem; font-weight: 700;
  letter-spacing: 0.1em; text-transform: uppercase; color: hsl(217 92% 55%); margin-bottom: 12px;
}
.lp-section-title {
  font-size: clamp(1.6rem, 3vw, 2.5rem); font-weight: 800;
  letter-spacing: -0.035em; line-height: 1.1; margin-bottom: 14px;
}
.lp-section-sub {
  font-size: 0.9375rem; font-weight: 500; color: var(--muted-foreground);
  line-height: 1.65; max-width: 500px; margin: 0 auto;
}

/* ══════════════ STEPS — flat horizontal cards ══════════════ */
.lp-steps {
  display: flex; flex-direction: column; gap: 16px;
}
@media (min-width: 768px) { .lp-steps { flex-direction: row; gap: 20px; } }

.lp-step {
  flex: 1;
  background: var(--card); border: 1px solid var(--border);
  border-radius: 22px; padding: 30px 26px;
  display: flex; flex-direction: column; gap: 0;
  position: relative; overflow: hidden;
  transform: perspective(900px) rotateX(2deg);
  transform-origin: bottom center;
  transition: transform 0.3s cubic-bezier(.22,.68,0,1.2), box-shadow 0.3s;
  box-shadow:
    0 1px 0 hsl(0 0% 0% / 0.04),
    0 4px 14px hsl(0 0% 0% / 0.06),
    0 14px 36px hsl(0 0% 0% / 0.05),
    inset 0 1px 0 hsl(0 0% 100% / 0.7);
}
.lp-step:hover {
  transform: perspective(900px) rotateX(0deg) translateY(-7px);
  box-shadow:
    0 1px 0 hsl(0 0% 0% / 0.04),
    0 10px 28px hsl(0 0% 0% / 0.1),
    0 28px 60px hsl(0 0% 0% / 0.09),
    inset 0 1px 0 hsl(0 0% 100% / 0.7);
}

/* Left accent bar */
.lp-step::before {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0;
  width: 4px; border-radius: 22px 0 0 22px;
}
.lp-step:nth-child(1)::before { background: hsl(217 92% 55%); }
.lp-step:nth-child(2)::before { background: hsl(262 75% 58%); }
.lp-step:nth-child(3)::before { background: hsl(142 72% 40%); }

.lp-step-top {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;
}
.lp-step-num-big {
  font-size: 3rem; font-weight: 800; letter-spacing: -0.06em; line-height: 1;
  opacity: 0.07; color: var(--foreground); user-select: none;
}
.lp-step-icon-wrap {
  width: 46px; height: 46px; border-radius: 13px;
  display: flex; align-items: center; justify-content: center;
}
.lp-step:nth-child(1) .lp-step-icon-wrap { background: hsl(217 92% 55% / 0.1); color: hsl(217 92% 50%); }
.lp-step:nth-child(2) .lp-step-icon-wrap { background: hsl(262 75% 58% / 0.1); color: hsl(262 75% 55%); }
.lp-step:nth-child(3) .lp-step-icon-wrap { background: hsl(142 72% 40% / 0.1); color: hsl(142 72% 36%); }

.lp-step-label {
  font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 6px;
}
.lp-step:nth-child(1) .lp-step-label { color: hsl(217 92% 55%); }
.lp-step:nth-child(2) .lp-step-label { color: hsl(262 75% 58%); }
.lp-step:nth-child(3) .lp-step-label { color: hsl(142 72% 40%); }

.lp-step-title { font-size: 1.125rem; font-weight: 800; letter-spacing: -0.025em; margin-bottom: 10px; line-height: 1.2; }
.lp-step-desc { font-size: 0.875rem; font-weight: 500; line-height: 1.7; color: var(--muted-foreground); }

/* ══════════════ 3D CARD SYSTEM ══════════════ */
.lp-3d {
  transform: perspective(900px) rotateX(1.5deg);
  transform-origin: bottom center;
  transition: transform 0.3s cubic-bezier(.22,.68,0,1.2), box-shadow 0.3s;
  box-shadow:
    0 1px 0 hsl(0 0% 0% / 0.035),
    0 4px 12px hsl(0 0% 0% / 0.05),
    0 10px 28px hsl(0 0% 0% / 0.045),
    inset 0 1px 0 hsl(0 0% 100% / 0.65);
}
.lp-3d:hover {
  transform: perspective(900px) rotateX(0deg) translateY(-5px);
  box-shadow:
    0 1px 0 hsl(0 0% 0% / 0.04),
    0 8px 20px hsl(0 0% 0% / 0.09),
    0 20px 48px hsl(0 0% 0% / 0.08),
    inset 0 1px 0 hsl(0 0% 100% / 0.65);
}

/* ══════════════ FEATURES BAND — dark editorial ══════════════ */
.lp-features-band {
  background: hsl(220 25% 8%);
  padding: 88px 32px;
  position: relative; overflow: hidden;
}
/* Subtle noise texture via repeating gradient */
.lp-features-band::before {
  content: ''; position: absolute; inset: 0; pointer-events: none; z-index: 0;
  background:
    radial-gradient(ellipse 55% 70% at 10% 60%, hsl(217 92% 55% / 0.12) 0%, transparent 65%),
    radial-gradient(ellipse 40% 50% at 90% 20%, hsl(262 80% 65% / 0.1) 0%, transparent 60%);
}
.lp-features-inner {
  max-width: 1400px; margin: 0 auto;
  display: grid; grid-template-columns: 1fr; gap: 64px; position: relative; z-index: 1;
}
@media (min-width: 900px) { .lp-features-inner { grid-template-columns: 5fr 7fr; align-items: start; gap: 80px; } }

/* Left column */
.lp-feat-left { padding-top: 8px; }
.lp-feat-tag {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
  color: hsl(217 92% 65%); margin-bottom: 20px;
  background: hsl(217 92% 55% / 0.12); border: 1px solid hsl(217 92% 55% / 0.25);
  padding: 4px 12px; border-radius: 100px;
}
.lp-feat-title {
  font-size: clamp(1.75rem, 3vw, 2.5rem); font-weight: 800; letter-spacing: -0.04em;
  line-height: 1.08; color: white; margin-bottom: 20px;
}
.lp-feat-title em { font-style: normal; color: hsl(217 92% 68%); }
.lp-feat-desc {
  font-size: 0.9375rem; font-weight: 500; color: hsl(220 15% 58%); line-height: 1.75;
  margin-bottom: 32px;
}
.lp-feat-pills { display: flex; flex-wrap: wrap; gap: 8px; }
.lp-feat-pill {
  display: inline-flex; align-items: center; gap: 6px;
  background: hsl(220 15% 14%); border: 1px solid hsl(220 15% 22%);
  color: hsl(220 15% 72%);
  font-size: 0.8125rem; font-weight: 600; padding: 7px 14px; border-radius: 100px;
  transition: border-color 0.15s, color 0.15s;
}
.lp-feat-pill:hover { border-color: hsl(217 92% 55% / 0.5); color: hsl(217 92% 75%); }
.lp-feat-pill-dot { width: 6px; height: 6px; border-radius: 50%; background: hsl(142 72% 45%); flex-shrink: 0; }

/* Right column — feature cards */
.lp-feature-list { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
@media (max-width: 640px) { .lp-feature-list { grid-template-columns: 1fr; } }

.lp-feature-item {
  background: hsl(220 20% 12%); border: 1px solid hsl(220 15% 18%);
  border-radius: 18px; padding: 24px 22px;
  display: flex; flex-direction: column; gap: 12px;
  transition: background 0.2s, border-color 0.2s, transform 0.2s;
  position: relative; overflow: hidden;
}
.lp-feature-item::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, hsl(217 92% 55% / 0.04) 0%, transparent 60%);
  pointer-events: none;
}
.lp-feature-item:hover {
  background: hsl(220 20% 15%);
  border-color: hsl(217 92% 55% / 0.35);
  transform: translateY(-2px);
}
.lp-feature-item-icon {
  width: 42px; height: 42px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.lp-feature-item-title {
  font-size: 0.9375rem; font-weight: 800; color: white;
  letter-spacing: -0.02em; line-height: 1.2;
}
.lp-feature-item-desc {
  font-size: 0.8125rem; font-weight: 500; color: hsl(220 15% 52%); line-height: 1.65;
}

/* ══════════════ CATEGORIES══════════════ */
.lp-categories {
  display: grid;  justify-content: center; grid-template-columns: repeat(2, 1fr); gap: 10px; 
}
@media (min-width: 480px) { .lp-categories { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 768px) { .lp-categories { grid-template-columns: repeat(4, 1fr); } }
@media (min-width: 1100px) { .lp-categories { grid-template-columns: repeat(6, 1fr); } }

.lp-cat-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px; padding: 20px 16px;
  display: flex; flex-direction: column; align-items: flex-start; gap: 12px;
  cursor: pointer;
  transition: box-shadow 0.2s, border-color 0.2s, transform 0.2s;
  position: relative; overflow: hidden;
}
.lp-cat-card::before {
  content: ''; position: absolute; inset: 0; opacity: 0;
  transition: opacity 0.2s;
}
.lp-cat-card:hover { border-color: var(--lp-cat-accent, hsl(217 92% 55%)); }
.lp-cat-card:hover::before { opacity: 1; }
.lp-cat-card.active {
  border-color: hsl(217 92% 55%);
  box-shadow: 0 0 0 3px hsl(217 92% 55% / 0.12), 0 8px 24px rgba(0,0,0,0.08);
}

.lp-cat-icon-wrap {
  width: 40px; height: 40px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.lp-cat-name {
  font-size: 0.875rem; font-weight: 700; letter-spacing: -0.02em;
  line-height: 1.2; color: var(--foreground);
}
.lp-cat-count {
  font-size: 0.75rem; font-weight: 600; color: var(--muted-foreground);
  margin-top: -4px;
}
.lp-cat-arrow {
  position: absolute; right: 14px; bottom: 14px;
  color: var(--muted-foreground); opacity: 0;
  transition: opacity 0.15s, transform 0.15s;
}
.lp-cat-card:hover .lp-cat-arrow { opacity: 1; transform: translate(2px, -2px); }

/* ══════════════ BOOK CARD WRAPPER ══════════════ */
.lp-book-wrap {
  border-radius: 20px;
  position: relative;
  transform: perspective(900px) rotateX(2deg);
  transform-origin: bottom center;
  transition: transform 0.3s cubic-bezier(.22,.68,0,1.2), box-shadow 0.3s;
  box-shadow:
    0 2px 0 hsl(0 0% 0% / 0.04),
    0 6px 16px hsl(0 0% 0% / 0.07),
    0 16px 40px hsl(0 0% 0% / 0.06),
    inset 0 1px 0 hsl(0 0% 100% / 0.6);
}
.lp-book-wrap:hover {
  transform: perspective(900px) rotateX(0deg) translateY(-8px) scale(1.01);
  box-shadow:
    0 2px 0 hsl(0 0% 0% / 0.04),
    0 12px 32px hsl(0 0% 0% / 0.13),
    0 32px 72px hsl(0 0% 0% / 0.11),
    inset 0 1px 0 hsl(0 0% 100% / 0.6);
  z-index: 2;
}

/* ══════════════ SECOND BG IMAGE DIVIDER ══════════════ */
.lp-img-divider {
  position: relative; min-height: 360px;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.lp-img-divider-photo {
  position: absolute; inset: 0;
  background-image: url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1800&q=80&auto=format&fit=crop');
  background-size: cover; background-position: center 55%;
  background-attachment: fixed;
}
.lp-img-divider-photo::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, hsl(220 45% 6% / 0.85) 0%, hsl(217 60% 22% / 0.78) 100%);
}
.lp-img-divider-content {
  position: relative; z-index: 1;
  text-align: center; padding: 72px 32px; max-width: 720px;
}
.lp-img-divider-content h2 {
  font-size: clamp(1.8rem, 4vw, 3rem); font-weight: 800;
  letter-spacing: -0.04em; line-height: 1.05; color: white; margin-bottom: 16px;
}
.lp-img-divider-content p {
  font-size: 1rem; font-weight: 500; line-height: 1.7;
  color: hsl(220 20% 72%); margin-bottom: 40px;
}
.lp-img-divider-stats { display: flex; gap: 48px; justify-content: center; flex-wrap: wrap; }
.lp-img-divider-stat { display: flex; flex-direction: column; align-items: center; gap: 5px; }
.lp-img-divider-stat .num { font-size: 2.25rem; font-weight: 800; letter-spacing: -0.045em; color: white; line-height: 1; }
.lp-img-divider-stat .lbl { font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.09em; text-transform: uppercase; color: hsl(217 92% 72%); }

/* ══════════════ CATALOG SECTION ══════════════ */
.lp-catalog-section { padding: 72px 32px 80px; max-width: 1400px; margin: 0 auto; }
.lp-search-row { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
@media (min-width: 640px) { .lp-search-row { flex-direction: row; align-items: center; } }
.lp-search-wrap {
  flex: 1; display: flex; align-items: center;
  background: var(--card); border: 1px solid var(--border);
  border-radius: 14px; padding: 0 16px; gap: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05); transition: box-shadow 0.15s;
}
.lp-search-wrap:focus-within { box-shadow: 0 0 0 2px hsl(217 92% 55% / 0.25), 0 2px 10px rgba(0,0,0,0.05); }
.lp-search-wrap input {
  flex: 1; border: none; background: transparent; height: 48px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.9rem; font-weight: 500; letter-spacing: -0.01em; outline: none; color: var(--foreground);
}
.lp-search-wrap input::placeholder { color: var(--muted-foreground); opacity: 0.65; }
.lp-result-count { font-size: 0.8125rem; font-weight: 700; color: var(--muted-foreground); white-space: nowrap; }

/* ══════════════ PAGINATION ══════════════ */
.lp-pagination {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px; background: var(--card); border: 1px solid var(--border);
  border-radius: 14px; margin-top: 32px;
}
.lp-page-info { font-size: 0.8125rem; font-weight: 600; color: var(--muted-foreground); }

/* ══════════════ CTA BANNER ══════════════ */
.lp-cta-banner {
  background: linear-gradient(135deg, hsl(217 92% 52%), hsl(262 75% 58%));
  border-radius: 24px; padding: 60px 48px;
  display: flex; flex-direction: column; align-items: flex-start; gap: 28px;
  position: relative; overflow: hidden;
}
@media (min-width: 768px) { .lp-cta-banner { flex-direction: row; align-items: center; justify-content: space-between; } }
.lp-cta-banner::before {
  content: ''; position: absolute; right: -70px; top: -70px;
  width: 300px; height: 300px; border-radius: 50%; background: white; opacity: 0.06;
}
.lp-cta-banner::after {
  content: ''; position: absolute; right: 80px; bottom: -90px;
  width: 220px; height: 220px; border-radius: 50%; background: white; opacity: 0.05;
}
.lp-cta-title { font-size: clamp(1.4rem, 3vw, 2rem); font-weight: 800; letter-spacing: -0.035em; color: white; line-height: 1.15; }
.lp-cta-sub { font-size: 0.9375rem; font-weight: 500; color: hsl(217 92% 88%); line-height: 1.65; margin-top: 8px; max-width: 440px; }
.lp-cta-btn {
  display: inline-flex; align-items: center; gap: 8px;
  background: white; color: hsl(217 92% 42%);
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.9375rem; font-weight: 800; padding: 15px 30px; border-radius: 13px;
  border: none; cursor: pointer; white-space: nowrap; flex-shrink: 0;
  transition: transform 0.15s, box-shadow 0.15s;
  box-shadow: 0 4px 20px rgba(0,0,0,0.18); position: relative; z-index: 1;
}
.lp-cta-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(0,0,0,0.22); }

/* ══════════════ DIALOG ══════════════ */
.lp-dialog label {
  display: block; font-size: 0.6875rem; font-weight: 700;
  letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted-foreground); margin-bottom: 5px;
}
.lp-dialog textarea {
  width: 100%; border: 1px solid var(--border); border-radius: 10px; padding: 11px 13px;
  resize: vertical; min-height: 80px; font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.875rem; font-weight: 500; background: var(--background); color: var(--foreground);
  outline: none; transition: box-shadow 0.15s;
}
.lp-dialog textarea:focus { box-shadow: 0 0 0 2px hsl(217 92% 55%); }
.lp-book-banner {
  background: hsl(217 92% 55% / 0.08); border: 1px solid hsl(217 92% 55% / 0.2);
  border-radius: 12px; padding: 14px 16px; display: flex; align-items: center; gap: 12px;
}
.lp-book-banner-title { font-size: 0.875rem; font-weight: 700; letter-spacing: -0.015em; }
.lp-book-banner-sub { font-size: 0.75rem; font-weight: 500; color: var(--muted-foreground); margin-top: 2px; }

/* ══════════════ ANIMATIONS ══════════════ */
@keyframes lp-fadein { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
.lp-animate { animation: lp-fadein 0.6s cubic-bezier(.16,1,.3,1) both; }
.lp-d1 { animation-delay: 0.08s; }
.lp-d2 { animation-delay: 0.2s; }
.lp-d3 { animation-delay: 0.34s; }
.lp-d4 { animation-delay: 0.48s; }
`;

/* ─────────────────────────────────────────────
───────────────────────────────────────────── */
const CATEGORY_META: Record<string, {
  icon: React.ReactNode;
  bg: string;
  iconColor: string;
  accent: string;
}> = {
  Fiction:      { icon: <Feather size={18} />,       bg: "#EFF6FF", iconColor: "hsl(217 92% 52%)", accent: "hsl(217 92% 55%)" },
  Science:      { icon: <FlaskConical size={18} />,  bg: "#F0FDF4", iconColor: "hsl(142 72% 36%)", accent: "hsl(142 72% 40%)" },
  History:      { icon: <Landmark size={18} />,      bg: "#FFF7ED", iconColor: "hsl(30 90% 46%)",  accent: "hsl(30 90% 50%)"  },
  Technology:   { icon: <Cpu size={18} />,           bg: "#F5F3FF", iconColor: "hsl(262 75% 54%)", accent: "hsl(262 75% 58%)" },
  Philosophy:   { icon: <Brain size={18} />,         bg: "#FDF2F8", iconColor: "hsl(320 70% 50%)", accent: "hsl(320 70% 55%)" },
  Art:          { icon: <Palette size={18} />,       bg: "#FFF1F2", iconColor: "hsl(345 80% 50%)", accent: "hsl(345 80% 52%)" },
  Biography:    { icon: <UserRound size={18} />,     bg: "#ECFDF5", iconColor: "hsl(158 60% 38%)", accent: "hsl(158 60% 40%)" },
  Business:     { icon: <Briefcase size={18} />,     bg: "#FFFBEB", iconColor: "hsl(40 90% 42%)",  accent: "hsl(40 90% 46%)"  },
  Psychology:   { icon: <HeartPulse size={18} />,    bg: "#EEF2FF", iconColor: "hsl(235 80% 55%)", accent: "hsl(235 80% 58%)" },
  Literature:   { icon: <PenLine size={18} />,       bg: "#FDF4FF", iconColor: "hsl(285 70% 52%)", accent: "hsl(285 70% 55%)" },
  Classic:      { icon: <BookMarked size={18} />,    bg: "#FFF7ED", iconColor: "hsl(25 80% 46%)",  accent: "hsl(25 80% 50%)"  },
  Fantasy:      { icon: <Sparkles size={18} />,      bg: "#F5F3FF", iconColor: "hsl(270 75% 54%)", accent: "hsl(270 75% 58%)" },
  "Science Fiction": { icon: <Atom size={18} />,    bg: "#EFF6FF", iconColor: "hsl(200 85% 46%)", accent: "hsl(200 85% 50%)" },
  Geography:    { icon: <Globe size={18} />,         bg: "#F0FDF4", iconColor: "hsl(165 65% 38%)", accent: "hsl(165 65% 42%)" },
  Film:         { icon: <Film size={18} />,          bg: "#FFF1F2", iconColor: "hsl(350 78% 50%)", accent: "hsl(350 78% 52%)" },
  Music:        { icon: <Music2 size={18} />,        bg: "#FDF4FF", iconColor: "hsl(290 70% 50%)", accent: "hsl(290 70% 54%)" },
  default:      { icon: <Library size={18} />,       bg: "#F4F4F5", iconColor: "hsl(220 15% 45%)", accent: "hsl(220 15% 48%)" },
};

const STEPS = [
  {
    icon: <Search size={22} />,
    label: "Step 01",
    title: "Find Your Book",
    desc: "Search by title, author, or browse by genre. Smart filters help you zero in on exactly what you want.",
  },
  {
    icon: <Bookmark size={22} />,
    label: "Step 02",
    title: "Reserve or Borrow",
    desc: "Available now? Borrow instantly. Not available? Reserve and we'll hold it the moment it's returned.",
  },
  {
    icon: <BookOpen size={22} />,
    label: "Step 03",
    title: "Start Reading",
    desc: "Pick up your book and enjoy. Return by the due date or request a renewal with a single click.",
  },
];

const FEATURES = [
  { icon: <Library size={20} />,     title: "Vast Collection",  desc: "Thousands of titles across every genre and discipline.", bg: "hsl(217 92% 55% / 0.15)", iconColor: "hsl(217 92% 68%)" },
  { icon: <Bookmark size={20} />,    title: "Reserve Ahead",    desc: "Secure your next read before it's gone.", bg: "hsl(142 72% 40% / 0.15)", iconColor: "hsl(142 72% 55%)" },
  { icon: <RotateCcw size={20} />,   title: "Easy Returns",     desc: "Flexible due dates with zero-hassle renewals.", bg: "hsl(30 90% 50% / 0.15)", iconColor: "hsl(30 90% 65%)" },
  { icon: <ShieldCheck size={20} />, title: "Trusted & Safe",   desc: "Your reading history stays private, always.", bg: "hsl(262 75% 58% / 0.15)", iconColor: "hsl(262 75% 72%)" },
];

const STATS = [
  { icon: <Library size={20} />, number: "2,400+", label: "Books Available", bg: "#EFF6FF", color: "hsl(217 92% 55%)" },
  { icon: <Users size={20} />,   number: "1,200+", label: "Active Members",  bg: "#F0FDF4", color: "hsl(142 72% 40%)" },
  { icon: <Clock size={20} />,   number: "24 / 7", label: "Online Access",   bg: "#FFF7ED", color: "hsl(30 90% 50%)"  },
];

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
const UserCatalog = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated } = useRole();
  const catalogRef = useRef<HTMLDivElement>(null);

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 8;

  const [userBooks, setUserBooks] = useState<UserBookState>({ borrowed: [], reserved: [] });
  const [processingBookId, setProcessingBookId] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [actionType, setActionType] = useState<"borrow" | "reserve" | null>(null);
  const [userName, setUserName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setTimeout(() => { setBooks(booksData as Book[]); setLoading(false); }, 300);
    const borrowed = JSON.parse(localStorage.getItem("borrowedBooks") || "[]");
    const reserved = JSON.parse(localStorage.getItem("reservedBooks") || "[]");
    setUserBooks({ borrowed, reserved });
  }, []);

  const categories = Array.from(new Set(books.map((b) => b.category))).sort();

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || book.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => { setPageIndex(0); }, [searchQuery, categoryFilter]);

  const paginatedBooks = filteredBooks.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
  const isBookBorrowed = (id: string) => userBooks.borrowed.some((b) => b.bookId === id);
  const isBookReserved = (id: string) => userBooks.reserved.some((r) => r.bookId === id);
  const totalPages = Math.ceil(filteredBooks.length / pageSize) || 1;

  const catCount = books.reduce<Record<string, number>>((acc, b) => {
    acc[b.category] = (acc[b.category] || 0) + 1; return acc;
  }, {});

  const scrollToCatalog = () => catalogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const selectCategory = (cat: string) => { setCategoryFilter(cat); scrollToCatalog(); };

  const openForm = (book: Book, type: "borrow" | "reserve") => {
    if (!isAuthenticated) {
      toast({ title: "Registration Required", description: "Please create an account to borrow or reserve books." });
      navigate("/login?mode=register"); return;
    }
    setSelectedBook(book); setActionType(type);
    setUserName(""); setPhoneNumber(""); setReturnDate(""); setNotes("");
    setIsFormOpen(true);
  };

  const isValidPhone = (p: string) => /^01[0-9]{9}$/.test(p);

  const handleBorrow = () => {
    if (!selectedBook) return;
    if (!userName) return toast({ title: "Error", description: "Enter your name", variant: "destructive" });
    if (!phoneNumber || !isValidPhone(phoneNumber)) return toast({ title: "Error", description: "Enter a valid phone number", variant: "destructive" });
    if (!returnDate) return toast({ title: "Error", description: "Select return date", variant: "destructive" });
    if (isBookBorrowed(selectedBook.id)) return toast({ title: "Error", description: "Already borrowed!", variant: "destructive" });
    if (selectedBook.availableQuantity < 1) return toast({ title: "Error", description: "Book not available", variant: "destructive" });

    setProcessingBookId(selectedBook.id);
    const borrowedBook: BorrowedBook & { phoneNumber: string } = {
      bookId: selectedBook.id, bookTitle: selectedBook.title,
      borrowDate: new Date().toISOString(), dueDate: new Date(returnDate).toISOString(),
      notes, userName, phoneNumber,
    };
    const updatedBorrowed = [...userBooks.borrowed, borrowedBook];
    localStorage.setItem("borrowedBooks", JSON.stringify(updatedBorrowed));
    setUserBooks((p) => ({ ...p, borrowed: updatedBorrowed }));
    setBooks((p) => p.map((b) => b.id === selectedBook.id ? { ...b, availableQuantity: b.availableQuantity - 1 } : b));
    setProcessingBookId(null); setIsFormOpen(false);
    toast({ title: "Success", description: "Book borrowed successfully ✅" });
  };

  const handleReserve = () => {
    if (!selectedBook) return;
    if (!userName) return toast({ title: "Error", description: "Enter your name", variant: "destructive" });
    if (!phoneNumber || !isValidPhone(phoneNumber)) return toast({ title: "Error", description: "Enter a valid phone number", variant: "destructive" });
    if (isBookReserved(selectedBook.id)) return toast({ title: "Error", description: "Already reserved!", variant: "destructive" });

    const reservedBook: ReservedBook & { phoneNumber: string } = {
      bookId: selectedBook.id, bookTitle: selectedBook.title,
      reserverName: userName, reservationDate: new Date().toISOString(),
      notes, phoneNumber,
    };
    const updatedReserved = [...userBooks.reserved, reservedBook];
    localStorage.setItem("reservedBooks", JSON.stringify(updatedReserved));
    setUserBooks((p) => ({ ...p, reserved: updatedReserved }));
    setIsFormOpen(false);
    toast({ title: "Success", description: "Book reserved successfully ✅" });
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="lp-root">

        {/* ═══ HERO ═══ */}
        <section className="lp-hero">
          <div className="lp-hero-photo" />
          <div className="lp-hero-grid" />
          <div className="lp-hero-content">
            <div className="lp-eyebrow lp-animate"><Sparkles size={12} /> Welcome to the Library</div>
            <h1 className="lp-hero-title lp-animate lp-d1">
              Your next great<br /><span className="accent">read awaits.</span>
            </h1>
            <p className="lp-hero-subtitle lp-animate lp-d2">
              Browse thousands of books, reserve your favorites, and borrow in minutes.
              A modern library experience built for curious minds.
            </p>
            <div className="lp-hero-cta lp-animate lp-d3">
              <button className="lp-btn-primary" onClick={scrollToCatalog}>
                <BookOpen size={16} /> Explore Catalog <ArrowRight size={15} />
              </button>
              <button className="lp-btn-ghost" onClick={() => selectCategory("all")}>
                Browse Categories
              </button>
            </div>
          </div>
          <div className="lp-hero-art lp-animate lp-d4">
            {["The Great Novel", "Science Today", "World History", "Art & Design"].map((t) => (
              <div key={t} className="lp-hero-book"><BookOpen size={15} />{t}</div>
            ))}
          </div>
        </section>

        {/* ═══ STATS ═══ */}
        <div className="lp-stats">
          {STATS.map((s) => (
            <div className="lp-stat-card lp-3d" key={s.label}>
              <div className="lp-stat-icon" style={{ background: s.bg }}>
                <span style={{ color: s.color }}>{s.icon}</span>
              </div>
              <div className="lp-stat-number">{s.number}</div>
              <div className="lp-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ═══ HOW IT WORKS — redesigned ═══ */}
        <div className="lp-section">
          <div className="lp-section-header">
            <span className="lp-section-tag">Simple Process</span>
            <h2 className="lp-section-title">Borrow in three easy steps</h2>
            <p className="lp-section-sub">From discovery to your hands — the smoothest library experience you've ever had.</p>
          </div>

          <div className="lp-steps">
            {STEPS.map((step, i) => (
              <div className="lp-step" key={step.title}>
                <div className="lp-step-top">
                  <span className="lp-step-num-big">{String(i + 1).padStart(2, '0')}</span>
                  <div className="lp-step-icon-wrap">{step.icon}</div>
                </div>
                <div className="lp-step-label">{step.label}</div>
                <div className="lp-step-title">{step.title}</div>
                <div className="lp-step-desc">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ FEATURES — dark editorial ═══ */}
        <div className="lp-features-band">
          <div className="lp-features-inner">
            {/* Left */}
            <div className="lp-feat-left">
              <span className="lp-feat-tag"><Sparkles size={11} /> Why Choose Us</span>
              <h2 className="lp-feat-title">
                Everything you need from a <em>modern library</em>
              </h2>
              <p className="lp-feat-desc">
                We've reimagined the library experience from the ground up — digital-first, reader-focused, and beautifully simple to use.
              </p>
              <div className="lp-feat-pills">
                {["Free to join", "No late fees*", "Online catalog", "Fast checkout"].map((p) => (
                  <span className="lp-feat-pill" key={p}>
                    <span className="lp-feat-pill-dot" /> {p}
                  </span>
                ))}
              </div>
            </div>
            {/* Right — 2×2 feature card grid */}
            <div className="lp-feature-list">
              {FEATURES.map((f) => (
                <div className="lp-feature-item" key={f.title}>
                  <div className="lp-feature-item-icon" style={{ background: f.bg }}>
                    <span style={{ color: f.iconColor }}>{f.icon}</span>
                  </div>
                  <div className="lp-feature-item-title">{f.title}</div>
                  <div className="lp-feature-item-desc">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ CATEGORIES — icon grid, no emojis ═══ */}
        <div className="lp-section">
          <div className="lp-section-header">
            <span className="lp-section-tag">Browse by Genre</span>
            <h2 className="lp-section-title">Find your next obsession</h2>
            <p className="lp-section-sub">Select any genre to instantly filter the catalog below.</p>
          </div>
          <div className="lp-categories">
            {categories.slice(0, 12).map((cat) => {
              const meta = CATEGORY_META[cat] ?? CATEGORY_META.default;
              return (
                <div
                  key={cat}
                  className={`lp-cat-card lp-3d${categoryFilter === cat ? " active" : ""}`}
                  onClick={() => selectCategory(cat)}
                >
                  <div className="lp-cat-icon-wrap" style={{ background: meta.bg }}>
                    <span style={{ color: meta.iconColor }}>{meta.icon}</span>
                  </div>
                  <div>
                    <div className="lp-cat-name">{cat}</div>
                    <div className="lp-cat-count">{catCount[cat] ?? 0} books</div>
                  </div>
                  <ArrowRight size={14} className="lp-cat-arrow" />
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══ IMAGE DIVIDER ═══ */}
        <div className="lp-img-divider">
          <div className="lp-img-divider-photo" />
          <div className="lp-img-divider-content">
            <h2>Knowledge has no limits.<br />Neither should you.</h2>
            <p>Our collection spans centuries of human thought — from ancient philosophy to cutting-edge science. Every book opens a door.</p>
            <div className="lp-img-divider-stats">
              {[["2,400+", "Books"], ["50+", "Genres"], ["Free", "To Join"]].map(([num, lbl]) => (
                <div className="lp-img-divider-stat" key={lbl}>
                  <span className="num">{num}</span>
                  <span className="lbl">{lbl}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ CATALOG ═══ */}
        <div className="lp-catalog-section" ref={catalogRef}>
          <div className="lp-section-header" style={{ textAlign: "left", marginBottom: 28 }}>
            <span className="lp-section-tag">Full Collection</span>
            <h2 className="lp-section-title" style={{ textAlign: "left" }}>
              {categoryFilter === "all" ? "All Books" : categoryFilter}
            </h2>
          </div>

          <div className="lp-search-row">
            <div className="lp-search-wrap">
              <Search size={16} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} />
              <input
                placeholder="Search titles, authors…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger
                className="h-[48px] bg-card border border-border rounded-[14px] px-4 font-semibold text-sm shadow-sm min-w-[160px]"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="rounded-xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <SelectItem value="all" className="font-semibold">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c} className="font-medium">{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="lp-result-count">{filteredBooks.length} books</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-72 rounded-2xl bg-muted animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
              ))}
            </div>
          ) : paginatedBooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
              <BookOpen size={40} style={{ color: "var(--muted-foreground)", opacity: 0.35 }} />
              <p style={{ fontWeight: 700, fontSize: "1.1rem", letterSpacing: "-0.02em" }}>No books found</p>
              <p style={{ fontWeight: 500, fontSize: "0.875rem", color: "var(--muted-foreground)" }}>Try adjusting your search or filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
              {paginatedBooks.map((book) => (
                <div key={book.id} className="lp-book-wrap">
                  <BookCard
                    book={book}
                    onBorrow={() => openForm(book, "borrow")}
                    onReserve={() => openForm(book, "reserve")}
                    isBorrowed={isBookBorrowed(book.id)}
                    isReserved={isBookReserved(book.id)}
                    isLoading={processingBookId === book.id}
                  />
                </div>
              ))}
            </div>
          )}

          {filteredBooks.length > pageSize && (
            <div className="lp-pagination">
              <span className="lp-page-info">
                {pageIndex * pageSize + 1}–{Math.min((pageIndex + 1) * pageSize, filteredBooks.length)} of {filteredBooks.length}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setPageIndex(0)} disabled={pageIndex === 0}><ChevronsLeft className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setPageIndex((p) => Math.max(0, p - 1))} disabled={pageIndex === 0}><ChevronLeft className="h-4 w-4" /></Button>
                <span style={{ fontWeight: 700, fontSize: "0.8125rem", padding: "0 10px", letterSpacing: "-0.01em" }}>{pageIndex + 1} / {totalPages}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setPageIndex((p) => p + 1)} disabled={(pageIndex + 1) * pageSize >= filteredBooks.length}><ChevronRight className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setPageIndex(totalPages - 1)} disabled={(pageIndex + 1) * pageSize >= filteredBooks.length}><ChevronsRight className="h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </div>

        {/* ═══ CTA BANNER ═══ */}
        <div style={{ padding: "0 32px 88px" }}>
          <div className="lp-cta-banner">
            <div>
              <div className="lp-cta-title">Ready to start reading?</div>
              <div className="lp-cta-sub">Join thousands of members who borrow, reserve, and discover books every day. It's completely free to get started.</div>
            </div>
            <button className="lp-cta-btn" onClick={() => navigate("/login?mode=register")}>
              Create Free Account <ArrowRight size={16} />
            </button>
          </div>
        </div>

      </div>

      {/* ═══ DIALOG ═══ */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="lp-dialog max-w-md max-h-[90vh] overflow-y-auto rounded-2xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "1.125rem", letterSpacing: "-0.025em" }}>
              {actionType === "borrow" ? "Borrow a Book" : "Reserve a Book"}
            </DialogTitle>
          </DialogHeader>
          <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 4 }}>
            {selectedBook && (
              <div className="lp-book-banner">
                <BookOpen size={18} style={{ color: "hsl(217 92% 55%)", flexShrink: 0 }} />
                <div>
                  <div className="lp-book-banner-title">{selectedBook.title}</div>
                  <div className="lp-book-banner-sub">{actionType === "borrow" ? "You are borrowing this book" : "You are reserving this book"}</div>
                </div>
              </div>
            )}
            <div>
              <label>Your Name</label>
              <Input placeholder="Full name" value={userName} onChange={(e) => setUserName(e.target.value)} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500 }} />
            </div>
            <div>
              <label>Phone Number</label>
              <Input placeholder="01XXXXXXXXX" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500 }} />
            </div>
            {actionType === "borrow" && (
              <div>
                <label>Return Date</label>
                <Input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500 }} />
              </div>
            )}
            <div>
              <label>Notes <span style={{ textTransform: "none", fontWeight: 500, letterSpacing: 0 }}>(optional)</span></label>
              <textarea placeholder="Any additional notes…" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <Button variant="ghost" onClick={() => setIsFormOpen(false)} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>Cancel</Button>
              <Button onClick={actionType === "borrow" ? handleBorrow : handleReserve} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 }}>
                Confirm {actionType === "borrow" ? "Borrow" : "Reservation"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserCatalog;
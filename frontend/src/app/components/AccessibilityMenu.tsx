import { useEffect, useRef, useState } from 'react';
import {
  Accessibility,
  X,
  Sun,
  Moon,
  Plus,
  Minus,
  Contrast,
  Sparkles,
  Underline,
  MousePointer2,
  RotateCcw,
} from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

export function AccessibilityMenu() {
  const {
    theme,
    fontScale,
    highContrast,
    reducedMotion,
    underlineLinks,
    largeCursor,
    toggleTheme,
    increaseFontScale,
    decreaseFontScale,
    toggleHighContrast,
    toggleReducedMotion,
    toggleUnderlineLinks,
    toggleLargeCursor,
    reset,
  } = useAccessibility();

  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const handleClick = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [open]);

  const fontPercent = Math.round(fontScale * 100);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Opciones de accesibilidad"
        aria-expanded={open}
        aria-controls="accessibility-panel"
        className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-[60] w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-[#9146FF] to-[#772CE8] text-white shadow-lg flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#9146FF]/40"
      >
        <Accessibility className="w-7 h-7 sm:w-8 sm:h-8" aria-hidden="true" />
      </button>

      {open && (
        <div
          ref={panelRef}
          id="accessibility-panel"
          role="dialog"
          aria-label="Panel de accesibilidad"
          className="fixed bottom-24 left-4 sm:left-6 z-[60] w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 rounded-2xl shadow-2xl border border-gray-200 dark:border-neutral-700 animate-fadeIn"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-neutral-700">
            <div className="flex items-center gap-2">
              <Accessibility className="w-5 h-5 text-[#9146FF] dark:text-[#b07bff]" aria-hidden="true" />
              <h2 className="font-bold text-base m-0">Accesibilidad</h2>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar panel de accesibilidad"
              className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
            <Row
              icon={theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              label="Modo oscuro"
              description="Cambia entre tema claro y oscuro"
            >
              <Switch
                checked={theme === 'dark'}
                onChange={toggleTheme}
                label="Modo oscuro"
              />
            </Row>

            <Row
              icon={<span aria-hidden="true" className="font-bold text-lg leading-none">A</span>}
              label="Tamaño de texto"
              description={`${fontPercent}%`}
            >
              <div className="flex items-center gap-2">
                <IconButton onClick={decreaseFontScale} ariaLabel="Disminuir tamaño de texto">
                  <Minus className="w-4 h-4" />
                </IconButton>
                <span className="min-w-[3rem] text-center text-sm font-medium tabular-nums">
                  {fontPercent}%
                </span>
                <IconButton onClick={increaseFontScale} ariaLabel="Aumentar tamaño de texto">
                  <Plus className="w-4 h-4" />
                </IconButton>
              </div>
            </Row>

            <Row
              icon={<Contrast className="w-5 h-5" />}
              label="Alto contraste"
              description="Aumenta el contraste de la interfaz"
            >
              <Switch
                checked={highContrast}
                onChange={toggleHighContrast}
                label="Alto contraste"
              />
            </Row>

            <Row
              icon={<Sparkles className="w-5 h-5" />}
              label="Reducir animaciones"
              description="Minimiza el movimiento en pantalla"
            >
              <Switch
                checked={reducedMotion}
                onChange={toggleReducedMotion}
                label="Reducir animaciones"
              />
            </Row>

            <Row
              icon={<Underline className="w-5 h-5" />}
              label="Subrayar enlaces"
              description="Resalta los enlaces con subrayado"
            >
              <Switch
                checked={underlineLinks}
                onChange={toggleUnderlineLinks}
                label="Subrayar enlaces"
              />
            </Row>

            <Row
              icon={<MousePointer2 className="w-5 h-5" />}
              label="Cursor grande"
              description="Aumenta el tamaño del cursor"
            >
              <Switch
                checked={largeCursor}
                onChange={toggleLargeCursor}
                label="Cursor grande"
              />
            </Row>

            <button
              type="button"
              onClick={reset}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-600 text-sm font-medium hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9146FF]"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              Restablecer valores
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function Row({
  icon,
  label,
  description,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#9146FF]/10 dark:bg-[#9146FF]/25 text-[#9146FF] dark:text-[#c9aaff] flex-shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold m-0">{label}</p>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 m-0">{description}</p>
          )}
        </div>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9146FF] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 ${
        checked ? 'bg-gradient-to-r from-[#9146FF] to-[#772CE8]' : 'bg-gray-300 dark:bg-neutral-600'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

function IconButton({
  onClick,
  ariaLabel,
  children,
}: {
  onClick: () => void;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 dark:border-neutral-600 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9146FF]"
    >
      {children}
    </button>
  );
}

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { User, Code2 } from "lucide-react";
import { triggerHaptic } from "@/lib/haptics";
import { useTheme } from "@/hooks/useTheme";
import { emitSystemStatus } from "@/lib/systemEvents";

export interface CommandEntry {
  cmd: string;
  output: React.ReactNode;
}

export const getCommandOutput = (cmd: string): React.ReactNode => {
  const normalized = cmd.trim().toLowerCase();

  // Prefix commands
  if (normalized.startsWith("echo ")) {
    return <div className="text-[var(--text)] mt-1">{cmd.substring(5)}</div>;
  }
  if (normalized.startsWith("open ")) {
    const target = normalized.substring(5);
    if (target === "profile") return <div className="text-[var(--success)] mt-1">[✓] Access granted. Revealing identity protocol...</div>;
    return <div className="text-[var(--success)] mt-1">[✓] Opening {target}...</div>;
  }
  if (normalized === "sudo hire chinmay") {
    return (
      <div className="mt-1">
        <div className="text-[var(--muted)]">[sudo] password for recruiter: ********</div>
        <div className="text-[var(--success)] mt-1 animate-pulse">Access granted.</div>
        <div className="text-[var(--teal)] mt-1">→ Redirecting to contact...</div>
      </div>
    );
  }
  if (normalized === "sudo reveal identity") {
    return (
      <div className="mt-1">
        <div className="text-[var(--muted)]">[sudo] password for admin: ********</div>
        <div className="text-[var(--success)] mt-1">Access granted. Decrypting visual buffer...</div>
        <div className="text-[var(--teal)] mt-1 animate-pulse">[!] Identity Revealed</div>
      </div>
    );
  }
  if (normalized === "sudo drop confetti") {
    return <div className="text-[var(--success)] mt-1">Deploying confetti payload...</div>;
  }
  if (normalized === "matrix") {
    return <div className="text-[var(--success)] mt-1">Initializing Matrix protocol... Follow the white rabbit.</div>;
  }

  // Strict matches
  switch (normalized) {
    case "help":
      return (
        <div className="text-[var(--muted)] leading-relaxed mt-1 flex flex-col gap-1">
          <div className="text-[var(--text)] font-semibold mb-1">Available commands:</div>
          <div className="grid grid-cols-[85px_1fr] sm:grid-cols-[85px_1fr_85px_1fr] gap-x-2 gap-y-1 mt-0.5 opacity-90">
            <span className="text-[var(--teal)]">whoami</span><span>→ identity</span>
            <span className="text-[var(--teal)]">projects</span><span>→ view work</span>
            <span className="text-[var(--teal)]">architecture</span><span>→ how I build</span>
            <span className="text-[var(--teal)]">about</span><span>→ back story</span>
            <span className="text-[var(--teal)]">skills</span><span>→ tech stack</span>
            <span className="text-[var(--teal)]">experience</span><span>→ work history</span>
            <span className="text-[var(--teal)]">resume</span><span>→ download CV</span>
            <span className="text-[var(--teal)]">open</span><span>→ open file/dir</span>
            <span className="text-[var(--teal)]">contact</span><span>→ connect</span>
            <span className="text-[var(--teal)]">status</span><span>→ system monitor</span>
            <span className="text-[var(--teal)]">uptime</span><span>→ instance uptime</span>
            <span className="text-[var(--teal)]">env</span><span>→ display env</span>
            <span className="text-[var(--teal)]">theme</span><span>→ ui mode</span>
            <span className="text-[var(--teal)]">clear</span><span>→ reset terminal</span>
            <span className="text-[var(--teal)]">sudo</span><span>→ elevated privileges</span>
          </div>
          <div className="mt-2 pt-2 border-t border-[var(--line)]">
            <span className="text-[var(--soft)] italic text-[10px]">Hidden executables: neofetch, ping, logs, coffee, hack system, matrix, date</span>
          </div>
        </div>
      );
    case "whoami":
      return (
        <div className="pl-4 sm:pl-6 flex flex-col gap-1 border-l border-[var(--line)] ml-1.5 my-1 sm:my-1.5 py-0.5 sm:py-1">
          <div><span className="text-[var(--accent)]">"name"</span><span className="text-[var(--text)]">:</span> <span className="text-[var(--teal)]">"Chinmay Kudalkar"</span><span className="text-[var(--text)]">,</span></div>
          <div><span className="text-[var(--accent)]">"role"</span><span className="text-[var(--text)]">:</span> <span className="text-[var(--teal)]">"Full-Stack Engineer"</span><span className="text-[var(--text)]">,</span></div>
          <div><span className="text-[var(--accent)]">"focus"</span><span className="text-[var(--text)]">:</span> <span className="text-[var(--teal)]">"Full-Stack & AI/ML"</span><span className="text-[var(--text)]">,</span></div>
          <div>
            <span className="text-[var(--accent)]">"stack"</span><span className="text-[var(--text)]">: [</span>
            <span className="text-[var(--teal)]">"TypeScript"</span><span className="text-[var(--text)]">, </span>
            <span className="text-[var(--teal)]">"Next.js"</span><span className="text-[var(--text)]">, </span>
            <span className="text-[var(--teal)]">"Node.js"</span><span className="text-[var(--text)]">, </span>
            <span className="text-[var(--teal)]">"PostgreSQL"</span>
            <span className="text-[var(--text)]">],</span>
          </div>
          <div><span className="text-[var(--accent)]">"status"</span><span className="text-[var(--text)]">:</span> <span className="text-[var(--teal)] animate-pulse">"Visible on request"</span></div>
        </div>
      );
    case "projects":
    case "ls":
    case "ls projects":
    case "ls projects/":
      return (
        <div className="mt-1">
          <div className="text-[var(--teal)] mb-1">lineup/</div>
          <div className="text-[var(--teal)] mb-1">deploywatch/</div>
          <div className="text-[var(--teal)] mb-1">blockvault/</div>
          <div className="text-[var(--teal)]">sketchtoimage/</div>
        </div>
      );
    case "architecture":
      return <div className="text-[var(--teal)] mt-1">Routing to architecture overview...</div>;
    case "about":
      return <div className="text-[var(--muted)] mt-1">I build robust, scalable systems that solve real problems. I love diving deep into backend architecture while keeping a sharp eye on frontend polish.</div>;
    case "skills":
      return (
        <div className="text-[var(--muted)] mt-1 flex flex-col gap-1">
          <div className="grid grid-cols-[80px_1fr] gap-x-2">
            <span className="text-[var(--accent)]">Frontend:</span><span className="text-[var(--text)]">React, Next.js, Tailwind</span>
            <span className="text-[var(--accent)]">Backend:</span><span className="text-[var(--text)]">Node.js, Express</span>
            <span className="text-[var(--accent)]">Systems:</span><span className="text-[var(--text)]">Redis, BullMQ, PostgreSQL</span>
            <span className="text-[var(--accent)]">DevOps:</span><span className="text-[var(--text)]">Docker, AWS, CI/CD</span>
          </div>
        </div>
      );
    case "experience":
      return (
        <div className="text-[var(--muted)] mt-1">
          <div className="text-[var(--accent)]">2025-26</div>
          <div className="text-[var(--text)]">Mintskill HR Solutions</div>
          <div className="text-[var(--teal)] opacity-80 mt-0.5">Led system design & SaaS delivery</div>
        </div>
      );
    case "status":
      return (
        <div className="text-[var(--muted)] mt-2 flex flex-col gap-3 font-mono">
          <div className="flex items-center gap-2 text-[var(--teal)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--teal)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--teal)]"></span>
            </span>
            <span className="font-bold tracking-tight text-[11px] uppercase">System Monitor v2.4.0</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-l border-[var(--line)] pl-4 ml-1">
            <div className="flex flex-col gap-1.5">
              <div className="text-[10px] uppercase text-[var(--soft)] tracking-widest mb-1">Infrastructure</div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-[var(--text)]">Core Engine</span>
                <span className="text-[var(--success)]">Active</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-[var(--text)]">API Gateway</span>
                <span className="text-[var(--success)]">Stable</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-[var(--text)]">Database Cluster</span>
                <span className="text-[var(--success)]">Synced</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="text-[10px] uppercase text-[var(--soft)] tracking-widest mb-1">Performance</div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-[var(--muted)]">
                  <span>CPU Load</span>
                  <span>14%</span>
                </div>
                <div className="h-1 w-full bg-[var(--surface-muted)] rounded-full overflow-hidden">
                  <div className="h-full w-[14%] bg-[var(--teal)]" />
                </div>
              </div>
              <div className="space-y-1 mt-1">
                <div className="flex justify-between text-[10px] text-[var(--muted)]">
                  <span>Memory</span>
                  <span>1.2GB / 8GB</span>
                </div>
                <div className="h-1 w-full bg-[var(--surface-muted)] rounded-full overflow-hidden">
                  <div className="h-full w-[24%] bg-[var(--accent-soft)]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    case "uptime":
      return <div className="text-[var(--success)] mt-1">System uptime: 99.99%</div>;
    case "env":
      return (
        <div className="text-[var(--teal)] mt-1 flex flex-col gap-0.5">
          <div>NODE_ENV=production</div>
          <div>PORT=3000</div>
          <div>REDIS_HOST=127.0.0.1</div>
          <div>NEXT_PUBLIC_API_URL=https://api.chinmay.io</div>
        </div>
      );
    case "ping":
      return <div className="text-[var(--muted)] mt-1">pong</div>;
    case "neofetch":
    case "screenfetch":
      return (
        <div className="flex flex-col sm:flex-row gap-4 mt-2 mb-1">
          <div className="hidden sm:block text-[var(--teal)] whitespace-pre font-mono leading-none text-[8px]">
{`   .-/++++++/-.
  /++++++++++++\\
 |++++++  ++++++|
 |++++++  ++++++|
  \\++++++++++++/
   '-/++++++/-'`}
          </div>
          <div className="flex flex-col gap-1 text-[var(--muted)]">
            <div className="text-[var(--teal)] font-bold">chinmayk<span className="text-[var(--text)]">@</span>sys</div>
            <div className="h-[1px] w-full bg-[var(--line-strong)] my-1" />
            <div><span className="text-[var(--accent)] font-bold">OS</span>: macOS 14.2</div>
            <div><span className="text-[var(--accent)] font-bold">Kernel</span>: Darwin 23.2.0</div>
            <div><span className="text-[var(--accent)] font-bold">Shell</span>: zsh 5.9</div>
            <div><span className="text-[var(--accent)] font-bold">WM</span>: Yabai</div>
            <div className="flex gap-1.5 mt-2">
              <div className="w-3 h-3 rounded-sm bg-[#ff5f56]" />
              <div className="w-3 h-3 rounded-sm bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-sm bg-[#27c93f]" />
              <div className="w-3 h-3 rounded-sm bg-[var(--teal)]" />
              <div className="w-3 h-3 rounded-sm bg-[var(--accent)]" />
            </div>
          </div>
        </div>
      );
    case "date":
      return <div className="text-[var(--text)] mt-1">{new Date().toString()}</div>;
    case "coffee":
      return <div className="text-[var(--accent)] mt-1">Brewing a fresh cup... ☕️</div>;
    case "hack system":
      return <div className="text-[#ff5f56] mt-1 animate-pulse">ACCESS DENIED. This incident will be reported.</div>;
    default:
      if (normalized.trim() === "") return "";
      return <div className="text-[#ff5f56] mt-1">command not found: {cmd}</div>;
  }
};

export function HiddenPhotoWidget({
  isCTAHovered,
  focusRef,
}: {
  isCTAHovered?: boolean;
  focusRef?: React.MutableRefObject<(() => void) | null>;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [canOpen, setCanOpen] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [history, setHistory] = useState<CommandEntry[]>([
    { 
      cmd: "sys.boot", 
      output: (
        <div className="text-[var(--muted)] opacity-80 mt-1 mb-2 text-[10px] sm:text-xs leading-relaxed font-mono">
          <div>[ OK ] Kernel initialized.</div>
          <div className="text-[var(--success)] mt-1 animate-pulse">Connection established.</div>
        </div>
      ) 
    },
    { cmd: "whoami", output: getCommandOutput("whoami") }
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [tempInput, setTempInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const hasInteractedRef = useRef(false);
  const { toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const ignoreNextToggleClickRef = useRef(false);
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);

  const syncScroll = useCallback((scrollTop: number, source: 'left' | 'right') => {
    const target = source === 'left' ? rightScrollRef.current : leftScrollRef.current;
    if (target && Math.abs(target.scrollTop - scrollTop) > 1) {
      target.scrollTop = scrollTop;
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const t = setTimeout(() => {
      setCanOpen(true);
      setIsInteractive(true);
    }, 0);
    return () => clearTimeout(t);
  }, [mounted]);

  useEffect(() => {
    if (!focusRef) return;
    focusRef.current = () => {
      setIsHovered(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    };
    return () => {
      if (focusRef) focusRef.current = null;
    };
  }, [focusRef]);

  const toggleProfile = (e?: React.SyntheticEvent) => {
    e?.stopPropagation();
    triggerHaptic("medium");
    setIsHovered((prev) => !prev);
  };

  const handleTogglePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === "touch" || e.pointerType === "pen") {
      ignoreNextToggleClickRef.current = true;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
      toggleProfile(e);
    }
  };

  const handleToggleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (ignoreNextToggleClickRef.current) {
      ignoreNextToggleClickRef.current = false;
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    toggleProfile(e);
  };

  const handleButtonKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleProfile(e);
    }
  };

  const leftDoorStyle: React.CSSProperties = {
    transform: isHovered ? "translateX(-100%)" : "translateX(0%)",
    transition: "transform .45s cubic-bezier(.22,1,.36,1)",
    clipPath: "polygon(0 0, 50.5% 0, 50.5% 100%, 0 100%)",
  };

  const rightDoorStyle: React.CSSProperties = {
    transform: isHovered ? "translateX(100%)" : "translateX(0%)",
    transition: "transform .45s cubic-bezier(.22,1,.36,1)",
    clipPath: "polygon(49.5% 0, 100% 0, 100% 100%, 49.5% 100%)",
  };

  const getSuggestion = (input: string) => {
    if (!input) return "";
    const commands = [
      "help", "whoami", "projects", "open", "clear", "contact", 
      "theme", "about", "skills", "experience", "resume", "architecture",
      "status", "uptime", "logs", "ping", "env", "echo",
      "neofetch", "date", "matrix", "sudo reveal identity", "sudo drop confetti"
    ];
    const normalized = input.toLowerCase();
    if (normalized.startsWith("open ") || normalized.startsWith("echo ")) return "";
    const match = commands.find(c => c.startsWith(normalized));
    return match ? match.substring(input.length) : "";
  };

  const suggestion = getSuggestion(inputValue);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    hasInteractedRef.current = true;
    
    if (e.key === "Tab" || e.key === "ArrowRight") {
      e.preventDefault();
      if (suggestion) setInputValue(inputValue + suggestion);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        if (historyIndex === -1) setTempInput(inputValue);
        const nextIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
        setHistoryIndex(nextIndex);
        setInputValue(commandHistory[commandHistory.length - 1 - nextIndex]);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > -1) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        if (nextIndex === -1) {
          setInputValue(tempInput);
        } else {
          setInputValue(commandHistory[commandHistory.length - 1 - nextIndex]);
        }
      }
      return;
    }

    if (e.key === "Enter") {
      if (inputValue.trim()) {
        setCommandHistory(prev => {
          if (prev[prev.length - 1] === inputValue) return prev;
          return [...prev, inputValue];
        });
      }
      setHistoryIndex(-1);
      setTempInput("");

      const cmd = inputValue.trim().toLowerCase();
      if (cmd === "clear") {
        setHistory([{ cmd: "whoami", output: getCommandOutput("whoami") }]);
      } else {
        const output = getCommandOutput(cmd);
        setHistory(prev => [...prev, { cmd: inputValue, output }]);
        
        if (cmd === "open profile" || cmd === "reveal --identity" || cmd === "sudo reveal identity") {
          setIsHovered(true);
        } else if (cmd === "close profile") {
          setIsHovered(false);
        } else if (cmd === "theme" || cmd === "theme toggle") {
          toggleTheme();
        } 
        if (cmd === "contact" || cmd === "sudo hire chinmay") {
          setTimeout(() => {
            window.location.href = "mailto:chinmayy.kudalkar@gmail.com";
          }, 1500);
        } else if (cmd === "sudo drop confetti") {
          import("canvas-confetti").then((module) => {
            const confetti = module.default;
            confetti({
              particleCount: 150,
              spread: 70,
              origin: { y: 0.6 },
              zIndex: 9999
            });
          });
        } else if (cmd === "matrix") {
          document.body.classList.toggle("matrix-mode");
        } else if (cmd === "resume") {
          setTimeout(() => {
            window.open("/resume.pdf", "_blank");
          }, 800);
        } else if (cmd === "projects" || cmd === "ls" || cmd.startsWith("open ")) {
          setTimeout(() => {
            document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
          }, 800);
        } else if (cmd === "architecture") {
          setTimeout(() => {
            document.getElementById("principles")?.scrollIntoView({ behavior: "smooth" });
          }, 800);
        } else if (cmd === "status") {
          emitSystemStatus();
          setTimeout(() => {
            document.getElementById("system-footer")?.scrollIntoView({ behavior: "smooth", block: "end" });
          }, 1200);
        }
      }
      setInputValue("");
    }
  };

  if (!mounted) {
    return (
      <div className="relative w-full aspect-[4/5] sm:aspect-[1/1.15] bg-[var(--bg)] rounded-xl border border-[var(--line)]" />
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative flex flex-col w-full max-w-full rounded-xl transition-all duration-500 bg-[var(--bg)] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.08)] ${isCTAHovered ? 'shadow-[0_30px_70px_rgba(0,0,0,0.12)]' : ''}`}
    >
      
      <div className="absolute top-0 left-0 w-full flex items-center justify-between px-4 py-2.5 sm:px-5 sm:py-3 z-[60]">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ff5f56] shadow-[0_0_10px_rgba(255,95,86,0.3)]" />
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ffbd2e] shadow-[0_0_10px_rgba(255,189,46,0.3)]" />
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#27c93f] shadow-[0_0_10px_rgba(39,201,63,0.3)]" />
        </div>

        {canOpen && (
          <button
            type="button"
            className={`touch-manipulation flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] sm:text-xs font-medium tracking-wide cursor-pointer transition-all duration-200 active:scale-95 border backdrop-blur-md ${
              isHovered
                ? "bg-[var(--accent)]/15 border-[var(--accent)]/40 text-[var(--accent)] shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                : "bg-[var(--surface-soft)] border-[var(--line)] text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--line-strong)] hover:bg-[var(--surface-accent)] shadow-sm"
            }`}
            onPointerDown={handleTogglePointerDown}
            onClick={handleToggleClick}
            onKeyDown={handleButtonKeyDown}
            aria-label={isHovered ? "Switch to terminal view" : "View developer profile photo"}
          >
            {isHovered ? (
              <>
                <Code2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Terminal</span>
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>View Profile</span>
              </>
            )}
          </button>
        )}
      </div>

      <div
        className="relative w-full max-w-full overflow-hidden aspect-[4/5] sm:aspect-[1/1.15] bg-[var(--bg)] cursor-text"
        onClick={(e) => {
          e.stopPropagation();
          hasInteractedRef.current = true;
          if (canOpen) {
            triggerHaptic("light"); 
            inputRef.current?.focus();
          }
        }}
        style={{ transform: "translateZ(0)", pointerEvents: "auto" }}
      >
        <input
          id="terminal-input"
          ref={inputRef}
          type="text"
          value={inputValue}
          aria-hidden="true"
          readOnly={!isInteractive}
          onChange={(e) => {
            if (!isInteractive) return;
            hasInteractedRef.current = true;
            setInputValue(e.target.value);
          }}
          onKeyDown={(e) => {
            if (!isInteractive) return;
            handleKeyDown(e);
          }}
          className="absolute inset-0 w-full h-full opacity-0 pointer-events-none z-[-1]"
          spellCheck={false}
          autoComplete="off"
        />

        <div className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-300 ease-out ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <Image
            src="/chinmay-photo.png"
            alt=""
            fill
            sizes="(max-width: 768px) 250px, 450px"
            priority
            className="object-cover object-top opacity-90 scale-105 transition-transform duration-700 ease-out group-hover:scale-100"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />
        </div>

        <div 
          className="absolute inset-0 z-20 overflow-y-auto scrollbar-hide"
          onScroll={(e) => {
            syncScroll(e.currentTarget.scrollTop, "left");
            syncScroll(e.currentTarget.scrollTop, "right");
          }}
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.focus();
            triggerHaptic("light");
          }}
        >
          <div className="invisible pointer-events-none">
            <FakeUIContent 
              history={history} 
              inputValue={inputValue} 
              suggestion={suggestion}
              scrollRef={null}
              onScroll={() => {}}
              isCTAHovered={isCTAHovered}
            />
          </div>
        </div>

        <div
          style={leftDoorStyle}
          className="absolute inset-0 bg-[var(--bg)] z-10 pointer-events-none"
        >
          <FakeUIContent
            scrollRef={leftScrollRef}
            onScroll={() => {}}
            history={history}
            inputValue={inputValue}
            suggestion={suggestion}
            isCTAHovered={isCTAHovered}
          />
        </div>

        <div
          style={rightDoorStyle}
          className="absolute inset-0 bg-[var(--bg)] z-10 pointer-events-none"
        >
          <FakeUIContent 
            scrollRef={rightScrollRef}
            onScroll={() => {}}
            history={history} 
            inputValue={inputValue} 
            suggestion={suggestion}
            isCTAHovered={isCTAHovered}
          />
        </div>

        {canOpen && (
          <div className="absolute bottom-3 right-4 z-[60] pointer-events-none text-[9px] sm:text-[10px] font-mono text-[var(--muted)] opacity-40 tracking-widest uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--teal)] animate-pulse" />
            {"> interactive"}
          </div>
        )}
      </div>
    </div>
  );
}

function TerminalEntry({ entry, index }: { entry: CommandEntry; index: number }) {
  const entryRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!entryRef.current) return;
    gsap.fromTo(
      entryRef.current,
      { opacity: 0, y: 12, filter: "blur(4px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.45,
        ease: "power3.out",
        delay: index === 0 ? 0 : 0,
      }
    );
  }, { scope: entryRef });

  const renderCmd = (cmd: string) => {
    const parts = cmd.split(" ");
    return (
      <>
        <span className="text-[var(--accent-soft)]">{parts[0]}</span>
        {cmd.substring(parts[0].length)}
      </>
    );
  };

  return (
    <div ref={entryRef} className="mb-4 sm:mb-5" style={{ opacity: 0 }}>
      <div className="flex items-center flex-nowrap font-mono">
        <span className="text-[var(--teal)] font-medium shrink-0">chinmayk@sys</span><span className="text-[var(--soft)]">:</span><span className="text-[var(--accent)]">~</span><span className="text-[var(--soft)] mr-1">$</span>
        <span className="text-[var(--text)] truncate">{renderCmd(entry.cmd)}</span>
      </div>
      {entry.output && (
        <div className="mt-1.5 sm:mt-2">{entry.output}</div>
      )}
    </div>
  );
}

function FakeUIContent({
  history = [],
  inputValue = "",
  suggestion = "",
  scrollRef,
  onScroll,
  isCTAHovered,
}: {
  history?: CommandEntry[];
  inputValue?: string;
  suggestion?: string;
  scrollRef: React.RefObject<HTMLDivElement | null> | null;
  onScroll: (scrollTop: number) => void;
  isCTAHovered?: boolean;
}) {
  const historyLen = history.length;
  const [showGhost, setShowGhost] = useState(false);

  useEffect(() => {
    if (scrollRef && scrollRef.current && historyLen > 1) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [historyLen, inputValue, scrollRef]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (!inputValue) {
      timeout = setTimeout(() => setShowGhost(true), 3500);
    } else {
      timeout = setTimeout(() => setShowGhost(false), 0);
    }
    return () => clearTimeout(timeout);
  }, [inputValue]);

  return (
    <div className="absolute inset-0 w-full h-full px-4 pb-4 pt-20 sm:px-6 sm:pb-5 sm:pt-24 flex flex-col text-left font-mono bg-transparent rounded-xl overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px]" />

      <div
        ref={scrollRef}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onScroll={(e) => onScroll(e.currentTarget.scrollTop)}
        className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain scrollbar-hide flex flex-col text-[11px] sm:text-sm text-[var(--muted)] leading-[1.4] sm:leading-relaxed relative z-10 whitespace-pre-wrap break-all"
      >
        <div className="flex flex-col">
          {history.map((entry, idx) => (
            <TerminalEntry key={idx} entry={entry} index={idx} />
          ))}
          <div className="flex items-center mt-1 relative pr-16 sm:pr-0 flex-nowrap font-mono">
            <span className="text-[var(--teal)] font-medium shrink-0">chinmayk@sys</span><span className="text-[var(--soft)]">:</span><span className="text-[var(--accent)]">~</span><span className="text-[var(--soft)] mr-0.5">$</span>
            <span className="text-[var(--text)] relative min-h-[20px] min-w-[2px] inline-flex items-center">
              {inputValue}
              {showGhost && !inputValue && (
                 <span className="absolute left-4 sm:left-5 text-[var(--muted)] whitespace-nowrap pointer-events-none opacity-40 animate-pulse">
                   Type &quot;help&quot; to explore
                 </span>
              )}
              {suggestion && (
                <span className="absolute left-full text-[var(--muted)] opacity-40 whitespace-pre">
                  {suggestion}
                </span>
              )}
              <span className={`w-1.5 h-3.5 sm:w-2 sm:h-[18px] ml-[2px] bg-gradient-to-b from-[var(--text)] to-[var(--soft)] rounded-[1px] ${isCTAHovered ? 'animate-none opacity-100 shadow-[0_0_8px_var(--text)]' : 'animate-terminal-cursor terminal-cursor-glow'}`} />
            </span>
          </div>
          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}


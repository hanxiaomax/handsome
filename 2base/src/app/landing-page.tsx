import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { GlobalSearch } from "@/components/navigation/global-search";
import { CustomBackground } from "@/components/common/custom-background";
import { ChevronDown } from "lucide-react";

export function LandingPage() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrollTime = useRef<number>(0);
  const scrollThreshold = 100; // 滚动阈值

  // 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      const currentTime = Date.now();
      const currentScrollY = window.scrollY;

      setScrollY(currentScrollY);

      // 防抖：如果滚动过快，延迟处理
      if (currentTime - lastScrollTime.current < 100) {
        return;
      }

      lastScrollTime.current = currentTime;

      // 如果向下滚动超过阈值且没有在执行动画
      if (currentScrollY > scrollThreshold && !isAnimating) {
        setIsAnimating(true);

        // 添加一个短暂的延迟，让用户看到滚动效果
        setTimeout(() => {
          navigate("/tools");
        }, 300);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [navigate, isAnimating]);

  // 处理键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        if (!isAnimating) {
          setIsAnimating(true);
          setTimeout(() => {
            navigate("/tools");
          }, 300);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [navigate, isAnimating]);

  // 处理滚轮事件
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 0 && !isAnimating) {
        // 向下滚动
        setIsAnimating(true);
        setTimeout(() => {
          navigate("/tools");
        }, 300);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [navigate, isAnimating]);

  return (
    <div
      ref={containerRef}
      className={`min-h-screen bg-gradient-to-br from-background via-background to-muted/10 relative overflow-hidden transition-all duration-300 ${
        isAnimating ? "animate-pulse" : ""
      }`}
    >
      {/* Custom Artistic Background */}
      <CustomBackground complexity="simple" animated={true} />

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Hero Content */}
          <div className="space-y-12">
            {/* Main Title */}
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight">
                Vibe once,{" "}
                <span className="text-primary bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  run anytime
                </span>
              </h1>
            </div>

            {/* Global Search - 全局搜索区域 */}
            <div
              id="global-search-section"
              className="w-full max-w-none mx-auto"
            >
              <div className="w-[70%] mx-auto">
                <GlobalSearch
                  width="100%"
                  size="lg"
                  placeholder="Search through all tools and documentation..."
                  showShortcut={false}
                  className="shadow-xl hover:border-primary/30 transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Scroll Indicator */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex flex-col items-center space-y-2 animate-bounce">
          <div className="text-sm text-muted-foreground">Scroll to explore</div>
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <ChevronDown className="w-4 h-4 text-primary" />
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      {scrollY > 0 && (
        <div className="fixed bottom-4 right-4 z-20">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <div className="text-xs font-medium text-primary">
              {Math.min(100, Math.round((scrollY / scrollThreshold) * 100))}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

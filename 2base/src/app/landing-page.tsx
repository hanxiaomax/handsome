import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/navigation/theme-toggle";
import { GlobalSearch } from "@/components/navigation/global-search";
import { tools } from "@/data/tools";
import {
  Zap,
  ChevronDown,
  ArrowRight,
  Code,
  Shield,
  FileText,
  Settings,
  Image,
} from "lucide-react";

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

  const handleEnterTools = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      navigate("/tools");
    }
  };

  const handleViewFavorites = () => {
    navigate("/favorites");
  };

  // 获取工具类别统计
  const categories = [
    { id: "development", name: "Development", icon: Code },
    { id: "text", name: "Text Tools", icon: FileText },
    { id: "file", name: "File Tools", icon: Settings },
    { id: "encode", name: "Encoding", icon: Shield },
    { id: "image", name: "Images", icon: Image },
    { id: "crypto", name: "Crypto", icon: Shield },
  ];

  return (
    <div
      ref={containerRef}
      className={`min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden transition-all duration-300 ${
        isAnimating ? "animate-pulse" : ""
      }`}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Vibe Tools</span>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={handleEnterTools}>
                Enter Tools
              </Button>
              <Button variant="ghost" onClick={handleViewFavorites}>
                Favorites
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Hero Content */}
          <div className="space-y-8">
            {/* Main Title */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight">
                Vibe once,{" "}
                <span className="text-primary bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  runs anytime
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                All-in-one toolkit for developers and creators.
                <br />
                <span className="text-primary font-medium">
                  No installation required. Start instantly.
                </span>
              </p>
            </div>

            {/* Global Search - 全局搜索区域 */}
            <div id="global-search-section" className="max-w-4xl mx-auto">
              <div className="space-y-3">
                {/* 自定义样式的全局搜索 */}
                <div className="transform scale-110">
                  <GlobalSearch className="h-12 text-base shadow-lg border-2 hover:border-primary/20 transition-all duration-200" />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center space-x-8 sm:space-x-12">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-primary">
                  {tools.length}+
                </div>
                <div className="text-sm sm:text-base text-muted-foreground">
                  Tools
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-primary">
                  100%
                </div>
                <div className="text-sm sm:text-base text-muted-foreground">
                  Free
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-primary">
                  0
                </div>
                <div className="text-sm sm:text-base text-muted-foreground">
                  Setup
                </div>
              </div>
            </div>

            {/* Categories Preview */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 max-w-2xl mx-auto">
              {categories.map((category) => {
                const IconComponent = category.icon;
                const categoryTools = tools.filter(
                  (tool) => tool.category === category.id
                );

                return (
                  <div
                    key={category.id}
                    className="flex flex-col items-center space-y-2 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer"
                    onClick={handleEnterTools}
                  >
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-xs font-medium text-center">
                      {categoryTools.length}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA Button */}
            <div className="space-y-4">
              <Button
                size="lg"
                onClick={handleEnterTools}
                className="h-14 px-8 text-lg font-semibold group"
                disabled={isAnimating}
              >
                {isAnimating ? (
                  "Entering Tools..."
                ) : (
                  <>
                    Start Exploring
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
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

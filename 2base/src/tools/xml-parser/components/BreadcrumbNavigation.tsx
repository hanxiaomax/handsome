import { Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbNavigationProps {
  breadcrumb: string[];
  onBreadcrumbClick: (path: string[]) => void;
}

export function BreadcrumbNavigation({
  breadcrumb,
  onBreadcrumbClick,
}: BreadcrumbNavigationProps) {
  if (breadcrumb.length === 0) {
    return null;
  }

  return (
    <div className="border-b bg-accent/20 px-4 py-3 h-14 flex-shrink-0">
      {/* Breadcrumb Status Bar - Element path navigation */}
      <div className="flex items-center gap-3 h-full">
        <span className="text-sm text-muted-foreground font-medium shrink-0">
          Path:
        </span>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                onClick={() => onBreadcrumbClick([])}
                className="flex items-center gap-1 text-sm hover:text-primary cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Root</span>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumb.map((crumb, index) => (
              <div key={index} className="flex items-center">
                <BreadcrumbSeparator className="text-muted-foreground/60 mx-2" />
                <BreadcrumbItem>
                  {index === breadcrumb.length - 1 ? (
                    <BreadcrumbPage className="text-sm font-medium text-primary">
                      {crumb}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      className="text-sm hover:text-primary cursor-pointer"
                      onClick={() =>
                        onBreadcrumbClick(breadcrumb.slice(0, index + 1))
                      }
                    >
                      {crumb}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
}

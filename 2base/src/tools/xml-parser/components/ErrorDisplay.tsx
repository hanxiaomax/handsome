/**
 * Error Display Component
 *
 * Displays detailed parsing errors and warnings in the right panel
 */

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, XCircle, Info, AlertCircle } from "lucide-react";
import type { ParseError, ParseWarning } from "../types";

interface ErrorDisplayProps {
  errors: ParseError[];
  warnings: ParseWarning[];
  className?: string;
}

export function ErrorDisplay({
  errors,
  warnings,
  className,
}: ErrorDisplayProps) {
  const totalIssues = errors.length + warnings.length;

  if (totalIssues === 0) {
    return (
      <div className="flex items-center justify-center h-full text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
            <Info className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No Issues Found
            </h3>
            <p className="text-muted-foreground">
              XML content validation completed successfully
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Error Summary Header */}
      <div className="p-4 border-b bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h3 className="font-medium text-foreground">Validation Issues</h3>
          </div>
          <div className="flex items-center gap-2">
            {errors.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {errors.length} Error{errors.length !== 1 ? "s" : ""}
              </Badge>
            )}
            {warnings.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {warnings.length} Warning{warnings.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Error Details */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Display Errors */}
          {errors.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-destructive" />
                <h4 className="font-medium text-sm text-foreground">
                  Errors ({errors.length})
                </h4>
              </div>
              {errors.map((error, index) => (
                <Alert
                  key={error.id || index}
                  variant="destructive"
                  className="text-sm"
                >
                  <AlertCircle className="w-4 h-4" />
                  <AlertTitle className="text-sm font-medium">
                    {getErrorTypeLabel(error.type)}
                    {error.line && ` (Line ${error.line})`}
                    {error.column && `:${error.column}`}
                  </AlertTitle>
                  <AlertDescription className="text-xs mt-1">
                    {error.message}
                    {error.path && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        Path: {error.path}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* Separator between errors and warnings */}
          {errors.length > 0 && warnings.length > 0 && (
            <Separator className="my-4" />
          )}

          {/* Display Warnings */}
          {warnings.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <h4 className="font-medium text-sm text-foreground">
                  Warnings ({warnings.length})
                </h4>
              </div>
              {warnings.map((warning, index) => (
                <Alert
                  key={warning.id || index}
                  className="text-sm border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950"
                >
                  <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  <AlertTitle className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    {getWarningTypeLabel(warning.type)}
                    {warning.line && ` (Line ${warning.line})`}
                  </AlertTitle>
                  <AlertDescription className="text-xs mt-1 text-yellow-700 dark:text-yellow-300">
                    {warning.message}
                    {warning.path && (
                      <div className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
                        Path: {warning.path}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* Validation Tips */}
          {totalIssues > 0 && (
            <>
              <Separator className="my-4" />
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-foreground">
                  Validation Tips
                </h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  {errors.some((e) => e.type === "syntax") && (
                    <p>
                      • Check for unmatched tags, missing quotes, or invalid
                      characters
                    </p>
                  )}
                  {errors.some((e) => e.type === "schema") && (
                    <p>• Ensure XML follows the required schema structure</p>
                  )}
                  {warnings.some((w) => w.type === "performance") && (
                    <p>
                      • Large files or deep nesting may affect parsing
                      performance
                    </p>
                  )}
                  {warnings.some((w) => w.type === "missing") && (
                    <p>
                      • Consider adding XML declaration for better compatibility
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function getErrorTypeLabel(type: ParseError["type"]): string {
  switch (type) {
    case "syntax":
      return "Syntax Error";
    case "schema":
      return "Schema Error";
    case "reference":
      return "Reference Error";
    case "memory":
      return "Memory Error";
    default:
      return "Error";
  }
}

function getWarningTypeLabel(type: ParseWarning["type"]): string {
  switch (type) {
    case "deprecated":
      return "Deprecated";
    case "missing":
      return "Missing Element";
    case "performance":
      return "Performance Warning";
    case "memory":
      return "Memory Warning";
    default:
      return "Warning";
  }
}

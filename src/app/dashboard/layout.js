import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button"
import AppSidebar from "@/components/AppSidebar";

export default function Layout({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-base font-medium">Documents</h1>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              asChild
              size="sm"
              className="hidden sm:flex"
            >
              <a
                href="https://github.com/shadcn-ui/ui/tree/main/apps/v4/app/(examples)/dashboard"
                rel="noopener noreferrer"
                target="_blank"
                className="dark:text-foreground"
              >
                GitHub
              </a>
            </Button>
          </div>
        </div>
        <div className="px-4">{children}</div>
      </main>
    </SidebarProvider>
  );
}

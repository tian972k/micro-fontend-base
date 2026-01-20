import {
  LogOut,
  ChevronsUpDown,
  User,
  Bell,
  BadgeCheck,
  Settings,
  Sun,
  Moon,
  Monitor,
  Languages,
  Check,
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@repo/ui";
import { useSubmit } from "@remix-run/react";
import {
  useUserStore,
  useThemeStore,
  type Theme,
  LOCALES,
  type Locale,
} from "@repo/core/react";
import { useTranslation } from "react-i18next";

export function UserMenu() {
  const user = useUserStore((state) => state.user);
  const { theme, setTheme } = useThemeStore();
  const submit = useSubmit();
  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    submit(null, { method: "post", action: "/logout" });
  };

  const handleLanguageChange = (locale: Locale) => {
    i18n.changeLanguage(locale);
  };

  const themeOptions: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: "light", label: t("theme.light"), icon: Sun },
    { value: "dark", label: t("theme.dark"), icon: Moon },
    { value: "system", label: t("theme.system"), icon: Monitor },
  ];

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="w-full justify-between data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 ring-2 ring-primary/10">
                  <AvatarImage src={user?.avatarUrl} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {user?.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-left">
                  <span
                    className="text-sm font-semibold truncate"
                    suppressHydrationWarning
                  >
                    {user?.name || t("common.guest")}
                  </span>
                  <span
                    className="text-xs text-muted-foreground truncate"
                    suppressHydrationWarning
                  >
                    {user?.email || t("common.no_email")}
                  </span>
                </div>
              </div>
              <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-64 rounded-xl shadow-lg border-border/50"
            align="start"
            side="top"
            sideOffset={8}
          >
            {/* User Info Header */}
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-3 px-3 py-3 bg-muted/30 rounded-t-xl">
                <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                  <AvatarImage src={user?.avatarUrl} />
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                    {user?.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-sm font-semibold"
                      suppressHydrationWarning
                    >
                      {user?.name || t("common.guest")}
                    </span>
                    <BadgeCheck className="h-4 w-4 text-primary" />
                  </div>
                  <span
                    className="text-xs text-muted-foreground"
                    suppressHydrationWarning
                  >
                    {user?.email || t("common.no_email")}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {/* Menu Items */}
            <DropdownMenuGroup>
              <DropdownMenuItem className="gap-3 px-3 py-2.5 cursor-pointer">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{t("user_menu.profile")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-3 px-3 py-2.5 cursor-pointer">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span>{t("user_menu.settings")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-3 px-3 py-2.5 cursor-pointer">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span>{t("user_menu.notifications")}</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Theme Submenu */}
            <DropdownMenuGroup>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-3 px-3 py-2.5 cursor-pointer">
                  <Sun className="h-4 w-4 text-muted-foreground" />
                  <span>{t("user_menu.theme")}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    {themeOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => setTheme(option.value)}
                        className="gap-3 cursor-pointer"
                      >
                        <option.icon className="h-4 w-4" />
                        <span>{option.label}</span>
                        {theme === option.value && (
                          <Check className="h-4 w-4 ml-auto text-primary" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              {/* Language Submenu */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-3 px-3 py-2.5 cursor-pointer">
                  <Languages className="h-4 w-4 text-muted-foreground" />
                  <span>{t("user_menu.language")}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    {(
                      Object.entries(LOCALES) as [
                        Locale,
                        { label: string; flag: string },
                      ][]
                    ).map(([code, { label, flag }]) => (
                      <DropdownMenuItem
                        key={code}
                        onClick={() => handleLanguageChange(code)}
                        className="gap-3 cursor-pointer"
                      >
                        <span className="text-base">{flag}</span>
                        <span>{label}</span>
                        {i18n.language === code && (
                          <Check className="h-4 w-4 ml-auto text-primary" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Logout */}
            <DropdownMenuItem
              onClick={handleLogout}
              className="gap-3 px-3 py-2.5 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              <span>{t("user_menu.logout")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

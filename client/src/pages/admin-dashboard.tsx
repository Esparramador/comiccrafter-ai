import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, Users, Crown, CreditCard, Settings, ShoppingBag, Brain, Send, Plus, Trash2, Edit, CheckCircle2, Ban, Search, Loader2, XCircle, ChevronDown, ChevronUp, Save, X, Upload, Download, ArrowUpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppUser, ServiceLimit, SubscriptionPlan } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const sidebarItems = [
    { id: "dashboard", icon: LayoutDashboard, label: t("admin.dashboard") },
    { id: "users", icon: Users, label: t("admin.users") },
    { id: "plans", icon: Crown, label: t("admin.plans") },
    { id: "payments", icon: CreditCard, label: t("admin.payments") },
    { id: "shopify", icon: ShoppingBag, label: t("admin.shopify") },
    { id: "economist", icon: Brain, label: t("admin.economist") },
    { id: "settings", icon: Settings, label: t("admin.settings") },
  ];
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [economistQuestion, setEconomistQuestion] = useState("");
  const [economistResponse, setEconomistResponse] = useState("");
  const [isEconomistLoading, setIsEconomistLoading] = useState(false);
  const [isDeployingTheme, setIsDeployingTheme] = useState(false);
  const [deployResult, setDeployResult] = useState<{ success: boolean; filesUploaded?: number; totalFiles?: number; error?: string } | null>(null);
  const [isDownloadingTheme, setIsDownloadingTheme] = useState(false);

  const [planForm, setPlanForm] = useState({
    name: "", displayName: "", description: "",
    priceMonthly: "0.00", priceYearly: "0.00",
    currency: "EUR", maxImages: 50, maxVideos: 10, max3dModels: 5, maxScripts: 50,
    maxVoices: 20, isActive: true, sortOrder: 0, badgeColor: "#8B5CF6",
    features: [] as string[],
  });

  const [moduleConfig, setModuleConfig] = useState({
    aiComics: true, aiVideos: false, animatedShorts: false, models3d: false, voiceGen: true,
    maxPagesPerComic: [50], comicsPerMonth: [10], stylePresets: "Standard",
    maxDuration: [300], videoQuality: "1080p", chaptersPerProject: [5],
  });

  const [newFeature, setNewFeature] = useState("");

  const { data: stats } = useQuery<{
    totalUsers: number; totalGenerations: number; totalImages: number;
    totalScripts: number; totalCharacters: number;
    planBreakdown: { plan: string; count: number }[];
    activeUsers: number; bannedUsers: number;
  }>({ queryKey: ["/api/admin/stats"] });

  const { data: users = [] } = useQuery<AppUser[]>({
    queryKey: ["/api/admin/users", searchTerm],
    queryFn: () => fetch(`/api/admin/users${searchTerm ? `?search=${searchTerm}` : ""}`).then(r => r.json()),
  });

  const { data: serviceLimits = [] } = useQuery<ServiceLimit[]>({ queryKey: ["/api/admin/service-limits"] });
  const { data: plans = [] } = useQuery<SubscriptionPlan[]>({ queryKey: ["/api/admin/plans"] });

  const { data: shopifyOrders = [] } = useQuery<any[]>({
    queryKey: ["/api/shopify/orders"],
    queryFn: () => fetch("/api/shopify/orders").then(r => r.ok ? r.json() : []).catch(() => []),
  });

  const { data: shopifyProducts = [] } = useQuery<any[]>({
    queryKey: ["/api/shopify/products"],
    queryFn: () => fetch("/api/shopify/products").then(r => r.ok ? r.json() : []).catch(() => []),
  });

  const { data: shopifyCustomers = [] } = useQuery<any[]>({
    queryKey: ["/api/shopify/customers"],
    queryFn: () => fetch("/api/shopify/customers").then(r => r.ok ? r.json() : []).catch(() => []),
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<AppUser> & { id: number }) => {
      const res = await apiRequest("PUT", `/api/admin/users/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: t("admin.userUpdated") });
    },
  });

  const createPlanMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/plans", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/plans"] });
      setShowPlanDialog(false);
      resetPlanForm();
      toast({ title: t("admin.planCreated") });
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const res = await apiRequest("PUT", `/api/admin/plans/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/plans"] });
      setShowPlanDialog(false);
      setEditingPlan(null);
      resetPlanForm();
      toast({ title: t("admin.planUpdated") });
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (id: number) => { await apiRequest("DELETE", `/api/admin/plans/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/plans"] });
      toast({ title: t("admin.planDeleted") });
    },
  });

  const resetPlanForm = () => {
    setPlanForm({ name: "", displayName: "", description: "", priceMonthly: "0.00", priceYearly: "0.00", currency: "EUR", maxImages: 50, maxVideos: 10, max3dModels: 5, maxScripts: 50, maxVoices: 20, isActive: true, sortOrder: 0, badgeColor: "#8B5CF6", features: [] });
    setNewFeature("");
  };

  const openEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name, displayName: plan.displayName, description: plan.description,
      priceMonthly: String(plan.priceMonthly), priceYearly: String(plan.priceYearly), currency: plan.currency,
      maxImages: plan.maxImages, maxVideos: plan.maxVideos, max3dModels: plan.max3dModels,
      maxScripts: plan.maxScripts, maxVoices: plan.maxVoices, isActive: plan.isActive,
      sortOrder: plan.sortOrder, badgeColor: plan.badgeColor,
      features: Array.isArray(plan.features) ? plan.features as string[] : [],
    });
    setShowPlanDialog(true);
  };

  const handleSavePlan = () => {
    const data = {
      ...planForm,
      priceMonthly: parseFloat(planForm.priceMonthly) || 0,
      priceYearly: parseFloat(planForm.priceYearly) || 0,
    };
    if (editingPlan) {
      updatePlanMutation.mutate({ id: editingPlan.id, ...data });
    } else {
      createPlanMutation.mutate(data);
    }
  };

  const askEconomist = async () => {
    if (!economistQuestion.trim()) return;
    setIsEconomistLoading(true);
    try {
      const res = await apiRequest("POST", "/api/ai/economist", {
        currentPlans: plans,
        question: economistQuestion,
      });
      const data = await res.json();
      setEconomistResponse(data.analysis || "Sin respuesta");
    } catch (e: any) {
      setEconomistResponse("Error consultando al economista IA: " + e.message);
    }
    setIsEconomistLoading(false);
  };

  const totalRevenue = shopifyOrders.reduce((sum: number, o: any) => sum + parseFloat(o.total_price || "0"), 0);
  const paidUsers = users.filter(u => u.plan !== "free");

  const estimatedCost = (() => {
    let cost = 0;
    if (moduleConfig.aiComics) cost += moduleConfig.comicsPerMonth[0] * 2;
    if (moduleConfig.aiVideos) cost += moduleConfig.chaptersPerProject[0] * 5;
    if (moduleConfig.models3d) cost += 10;
    if (moduleConfig.voiceGen) cost += 5;
    if (moduleConfig.animatedShorts) cost += 8;
    return cost.toFixed(2);
  })();

  return (
    <div className="flex h-full bg-[#0B0D17] text-white animate-in fade-in duration-500" data-testid="admin-dashboard">
      <aside className="w-[220px] bg-[#111322]/90 border-r border-white/5 flex flex-col p-4 shrink-0">
        <div className="flex items-center gap-3 mb-8 px-2">
          <img src="/logo-app.png" alt="Comic Crafter" className="w-8 h-8 rounded" />
          <div>
            <h1 className="text-sm font-bold text-white">Comic Crafter</h1>
            <p className="text-[10px] text-white/40">AI Admin Dashboard</p>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeSection === item.id
                  ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
              data-testid={`nav-${item.id}`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-white/5 px-2">
          <p className="text-[10px] text-white/30">sadiagiljoan@gmail.com</p>
          <p className="text-[10px] text-green-400 flex items-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Online
          </p>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {activeSection === "dashboard" && (
          <>
            <h2 className="text-2xl font-bold" data-testid="heading-dashboard">{t("admin.dashboard")}</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: t("admin.totalUsers"), value: stats?.totalUsers ?? 0, color: "blue" },
                { label: t("admin.activeSubscriptions"), value: paidUsers.length, color: "purple" },
                { label: t("admin.filesGenerated"), value: stats?.totalGenerations ?? 0, color: "emerald" },
                { label: t("admin.revenue"), value: `€${totalRevenue.toFixed(2)}`, color: "amber" },
              ].map((s, i) => (
                <Card key={i} className="bg-[#111322] border-white/5 p-5 rounded-xl">
                  <p className="text-xs text-white/40 mb-1">{s.label}</p>
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-[#111322] border-white/5 p-5 rounded-xl">
                <h3 className="text-sm font-bold text-white mb-4">{t("admin.userDistribution")}</h3>
                <div className="space-y-3">
                  {stats?.planBreakdown?.map((pb, i) => {
                    const total = stats.totalUsers || 1;
                    const pct = Math.round((pb.count / total) * 100);
                    const colors: Record<string, string> = { free: "bg-gray-500", pro: "bg-purple-500", vip: "bg-amber-500" };
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-white/60 uppercase font-medium">{pb.plan}</span>
                          <span className="text-white/40">{pb.count} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full ${colors[pb.plan] || "bg-purple-500"} rounded-full`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                  {(!stats?.planBreakdown || stats.planBreakdown.length === 0) && (
                    <p className="text-xs text-white/30">{t("admin.noUserData")}</p>
                  )}
                </div>
              </Card>

              <Card className="bg-[#111322] border-white/5 p-5 rounded-xl">
                <h3 className="text-sm font-bold text-white mb-4">{t("admin.recentTransactions")}</h3>
                <div className="space-y-2">
                  {shopifyOrders.slice(0, 5).map((order: any, i: number) => (
                    <div key={i} className="flex items-center justify-between bg-black/30 p-3 rounded-lg border border-white/5">
                      <div>
                        <p className="text-xs text-white/80">{order.email || order.name}</p>
                        <p className="text-[10px] text-white/30">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white">${order.total_price}</p>
                        <Badge className={`text-[10px] ${order.financial_status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {order.financial_status || 'pending'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {shopifyOrders.length === 0 && (
                    <p className="text-xs text-white/30 text-center py-4">{t("admin.noTransactions")}</p>
                  )}
                </div>
              </Card>
            </div>
          </>
        )}

        {activeSection === "users" && (
          <>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">{t("admin.users")} ({users.length})</h2>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/30" />
                <Input
                  placeholder={t("admin.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-72 bg-[#111322] border-white/10 text-white pl-9 rounded-lg text-sm"
                  data-testid="input-search-users"
                />
              </div>
            </div>
            <Card className="bg-[#111322] border-white/5 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-black/30 text-white/40 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">{t("admin.tableEmail")}</th>
                    <th className="px-4 py-3 text-left">{t("admin.tablePlan")}</th>
                    <th className="px-4 py-3 text-left">{t("admin.tableGenerations")}</th>
                    <th className="px-4 py-3 text-left">{t("admin.tableStatus")}</th>
                    <th className="px-4 py-3 text-right">{t("admin.tableActions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-white/[0.02]" data-testid={`row-user-${u.id}`}>
                      <td className="px-4 py-3 text-white/80 text-xs">{u.email}</td>
                      <td className="px-4 py-3">
                        <Select value={u.plan} onValueChange={(val) => updateUserMutation.mutate({ id: u.id, plan: val })}>
                          <SelectTrigger className="h-7 w-24 bg-black/50 border-white/10 text-xs rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#111322] border-white/10 text-white">
                            {["free", "pro", "vip"].map(p => (
                              <SelectItem key={p} value={p} className="text-xs uppercase">{p}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3 text-white/60 text-xs">{u.totalGenerations}</td>
                      <td className="px-4 py-3">
                        <Badge className={`text-[10px] ${u.status === 'banned' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                          {u.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm" variant="outline"
                          onClick={() => updateUserMutation.mutate({ id: u.id, status: u.status === 'active' ? 'banned' : 'active' })}
                          className={`h-7 px-3 text-xs rounded-lg ${u.status === 'active' ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-green-500/30 text-green-400 hover:bg-green-500/10'}`}
                          data-testid={`button-toggle-user-${u.id}`}
                        >
                          {u.status === 'active' ? <Ban className="w-3 h-3 mr-1" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {u.status === 'active' ? t("admin.ban") : t("admin.activate")}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </>
        )}

        {activeSection === "plans" && (
          <>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">{t("admin.subscriptionPlans")}</h2>
              <Button
                onClick={() => { resetPlanForm(); setEditingPlan(null); setShowPlanDialog(true); }}
                className="bg-purple-600 hover:bg-purple-500 text-white rounded-lg gap-2"
                data-testid="button-create-plan"
              >
                <Plus className="w-4 h-4" /> {t("admin.createNewPlan")}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map(plan => {
                const planFeatures = Array.isArray(plan.features) ? plan.features as string[] : [];
                return (
                  <Card key={plan.id} className="bg-[#111322] border-white/5 rounded-xl overflow-hidden" data-testid={`card-plan-${plan.id}`}>
                    <div className="p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold text-white">{plan.displayName}</h3>
                        <Badge className={`text-[10px] ${plan.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {plan.isActive ? t("admin.statusActive") : t("admin.statusInactive")}
                        </Badge>
                      </div>

                      <div className="bg-black/30 rounded-lg p-3 border border-white/5">
                        <span className="text-xs text-white/40">{t("admin.tablePrice")}: </span>
                        <span className="text-lg font-bold text-white">
                          {plan.priceMonthly === 0 ? "$0.00" : `$${plan.priceMonthly}`}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs text-white/40 font-medium">{t("admin.features")}</p>
                        {planFeatures.map((f, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-white/70">
                            <CheckCircle2 className="w-3 h-3 text-green-400 shrink-0" /> {f}
                          </div>
                        ))}
                        {planFeatures.length === 0 && (
                          <p className="text-xs text-white/20">{t("admin.noFeatures")}</p>
                        )}
                      </div>

                      <Button
                        onClick={() => openEditPlan(plan)}
                        className="w-full bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/20 rounded-lg gap-2"
                        data-testid={`button-edit-plan-${plan.id}`}
                      >
                        <Edit className="w-4 h-4" /> {t("admin.editPlan")}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {activeSection === "payments" && (
          <>
            <h2 className="text-2xl font-bold">{t("admin.paymentsAndOrders")}</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card className="bg-[#111322] border-white/5 p-5 rounded-xl">
                <p className="text-xs text-white/40">{t("admin.totalRevenue")}</p>
                <p className="text-2xl font-bold text-white">€{totalRevenue.toFixed(2)}</p>
              </Card>
              <Card className="bg-[#111322] border-white/5 p-5 rounded-xl">
                <p className="text-xs text-white/40">{t("admin.totalOrders")}</p>
                <p className="text-2xl font-bold text-white">{shopifyOrders.length}</p>
              </Card>
              <Card className="bg-[#111322] border-white/5 p-5 rounded-xl">
                <p className="text-xs text-white/40">{t("admin.avgTicket")}</p>
                <p className="text-2xl font-bold text-white">€{shopifyOrders.length ? (totalRevenue / shopifyOrders.length).toFixed(2) : "0.00"}</p>
              </Card>
            </div>
            <Card className="bg-[#111322] border-white/5 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-black/30 text-white/40 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">{t("admin.tableUser")}</th>
                    <th className="px-4 py-3 text-left">{t("admin.tablePlan")}</th>
                    <th className="px-4 py-3 text-left">{t("admin.tableAmount")}</th>
                    <th className="px-4 py-3 text-left">{t("admin.tableStatus")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {shopifyOrders.map((order: any, i: number) => (
                    <tr key={i} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-white/80 text-xs">{order.email || order.name}</td>
                      <td className="px-4 py-3 text-white/60 text-xs">{order.note || "—"}</td>
                      <td className="px-4 py-3 text-white font-medium text-xs">${order.total_price}</td>
                      <td className="px-4 py-3">
                        <Badge className={`text-[10px] ${order.financial_status === 'paid' ? 'bg-green-500/20 text-green-400' : order.financial_status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                          {order.financial_status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {shopifyOrders.length === 0 && (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-white/30 text-xs">{t("admin.noOrders")}</td></tr>
                  )}
                </tbody>
              </table>
            </Card>
          </>
        )}

        {activeSection === "shopify" && (
          <>
            <h2 className="text-2xl font-bold">Shopify Store</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card className="bg-[#111322] border-white/5 p-5 rounded-xl">
                <p className="text-xs text-white/40">Products</p>
                <p className="text-2xl font-bold text-white">{shopifyProducts.length}</p>
              </Card>
              <Card className="bg-[#111322] border-white/5 p-5 rounded-xl">
                <p className="text-xs text-white/40">Orders</p>
                <p className="text-2xl font-bold text-white">{shopifyOrders.length}</p>
              </Card>
              <Card className="bg-[#111322] border-white/5 p-5 rounded-xl">
                <p className="text-xs text-white/40">Customers</p>
                <p className="text-2xl font-bold text-white">{shopifyCustomers.length}</p>
              </Card>
            </div>

            <Card className="bg-[#111322] border-white/5 rounded-xl p-5 mb-6">
              <h3 className="text-sm font-bold text-white mb-3">Deploy Theme to Shopify</h3>
              <p className="text-xs text-white/40 mb-4">Upload the Comic Crafter theme directly to your Shopify store (comic-crafter.myshopify.com). Theme is optimized and under 50MB.</p>
              <div className="flex gap-3">
                <Button
                  onClick={async () => {
                    setIsDeployingTheme(true);
                    setDeployResult(null);
                    try {
                      const token = localStorage.getItem("cc_token");
                      const res = await fetch("/api/admin/deploy-shopify-theme", {
                        method: "POST",
                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                      });
                      const data = await res.json();
                      if (res.ok) {
                        setDeployResult({ success: true, filesUploaded: data.filesUploaded, totalFiles: data.totalFiles });
                        toast({ title: `Theme deployed: ${data.filesUploaded}/${data.totalFiles} files uploaded` });
                      } else {
                        setDeployResult({ success: false, error: data.error });
                        toast({ title: "Deploy failed", description: data.error, variant: "destructive" });
                      }
                    } catch (e: any) {
                      setDeployResult({ success: false, error: e.message });
                    }
                    setIsDeployingTheme(false);
                  }}
                  disabled={isDeployingTheme}
                  className="bg-green-600 hover:bg-green-500 text-white rounded-lg gap-2"
                  data-testid="button-deploy-theme"
                >
                  {isDeployingTheme ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {isDeployingTheme ? "Deploying..." : "Deploy to Shopify"}
                </Button>
                <Button
                  onClick={async () => {
                    setIsDownloadingTheme(true);
                    try {
                      const token = localStorage.getItem("cc_token");
                      const res = await fetch("/api/admin/download-shopify-theme", {
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      if (!res.ok) throw new Error("Download failed");
                      const blob = await res.blob();
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "comic-crafter-theme.zip";
                      a.click();
                      URL.revokeObjectURL(url);
                      toast({ title: "Theme ZIP downloaded" });
                    } catch (e: any) {
                      toast({ title: "Download failed", description: e.message, variant: "destructive" });
                    }
                    setIsDownloadingTheme(false);
                  }}
                  disabled={isDownloadingTheme}
                  variant="outline"
                  className="border-white/10 text-white/60 hover:text-white rounded-lg gap-2"
                  data-testid="button-download-theme"
                >
                  {isDownloadingTheme ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Download ZIP
                </Button>
              </div>
              {deployResult && (
                <div className={`mt-3 p-3 rounded-lg text-xs ${deployResult.success ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {deployResult.success
                    ? `${deployResult.filesUploaded}/${deployResult.totalFiles} files uploaded successfully to Shopify.`
                    : `Error: ${deployResult.error}`}
                </div>
              )}
            </Card>

            <Card className="bg-[#111322] border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-bold text-white mb-4">Products</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {shopifyProducts.map((p: any) => (
                  <div key={p.id} className="bg-black/30 rounded-lg p-4 border border-white/5">
                    {p.image?.src && <img src={p.image.src} alt={p.title} className="w-full h-32 object-cover rounded-lg mb-3" />}
                    <h4 className="text-sm font-medium text-white">{p.title}</h4>
                    <p className="text-xs text-white/40 mt-1">{p.variants?.[0]?.price ? `$${p.variants[0].price}` : "—"}</p>
                    <Badge className={`text-[10px] mt-2 ${p.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {p.status}
                    </Badge>
                  </div>
                ))}
                {shopifyProducts.length === 0 && (
                  <p className="text-xs text-white/30 col-span-3 text-center py-8">No products in Shopify store</p>
                )}
              </div>
            </Card>
          </>
        )}

        {activeSection === "economist" && (
          <>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Brain className="w-7 h-7 text-purple-400" /> IA Economist Agent
            </h2>
            <p className="text-sm text-white/40">AI-powered market analysis and pricing strategy advisor</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "Analiza mis planes actuales y recomienda precios óptimos basados en el mercado real",
                "¿Cómo debo estructurar mis planes para maximizar la conversión free a pro?",
                "Compara los precios de Comic Crafter con la competencia (Midjourney, RunwayML, ElevenLabs)",
                "¿Qué estrategia de monetización me recomiendas para una app de creación de cómics con IA?",
                "¿Cómo integro Shopify para vender suscripciones y productos digitales?",
                "Calcula el punto de equilibrio si tengo 1000 usuarios, 30% en plan Pro a 14.99€/mes",
              ].map((q, i) => (
                <Button
                  key={i}
                  variant="outline"
                  onClick={() => setEconomistQuestion(q)}
                  className="h-auto py-3 px-4 text-left text-xs border-white/10 text-white/60 hover:text-white hover:bg-purple-500/10 hover:border-purple-500/30 rounded-lg justify-start whitespace-normal"
                  data-testid={`button-economist-preset-${i}`}
                >
                  {q}
                </Button>
              ))}
            </div>

            <div className="flex gap-3">
              <Textarea
                value={economistQuestion}
                onChange={(e) => setEconomistQuestion(e.target.value)}
                placeholder="Ask the AI economist about pricing, plans, competition, Shopify strategy..."
                className="bg-[#111322] border-white/10 text-white placeholder:text-white/20 rounded-lg text-sm min-h-[80px] resize-none flex-1"
                data-testid="input-economist-question"
              />
              <Button
                onClick={askEconomist}
                disabled={isEconomistLoading || !economistQuestion.trim()}
                className="bg-purple-600 hover:bg-purple-500 text-white rounded-lg px-6 self-end h-12"
                data-testid="button-ask-economist"
              >
                {isEconomistLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </div>

            {economistResponse && (
              <Card className="bg-[#111322] border-purple-500/20 rounded-xl p-6">
                <h4 className="text-sm font-bold text-purple-300 mb-3">AI Analysis</h4>
                <div className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed" data-testid="text-economist-response">
                  {economistResponse}
                </div>
              </Card>
            )}
          </>
        )}

        {activeSection === "settings" && (
          <>
            <h2 className="text-2xl font-bold">Settings</h2>
            <Card className="bg-[#111322] border-white/5 rounded-xl p-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white mb-4">Service Limits per Plan</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {["free", "pro", "vip"].map(plan => (
                    <div key={plan} className="space-y-3">
                      <h4 className="text-xs font-bold text-purple-400 uppercase border-b border-white/5 pb-2">{plan} Plan</h4>
                      {["images", "videos", "3d_models", "scripts", "voices"].map(service => {
                        const limit = serviceLimits.find(l => l.planName === plan && l.serviceName === service);
                        if (!limit) return null;
                        return (
                          <div key={service} className="flex items-center justify-between bg-black/30 p-3 rounded-lg border border-white/5">
                            <div>
                              <span className="text-xs text-white/60">{service}</span>
                              <Input
                                type="number"
                                defaultValue={limit.maxQuantity}
                                onBlur={(e) => {
                                  const val = parseInt(e.target.value);
                                  if (val !== limit.maxQuantity) {
                                    const updateLimitFn = async () => {
                                      await apiRequest("PUT", `/api/admin/service-limits/${limit.id}`, { maxQuantity: val });
                                      queryClient.invalidateQueries({ queryKey: ["/api/admin/service-limits"] });
                                    };
                                    updateLimitFn();
                                  }
                                }}
                                className="w-20 h-7 bg-black/50 border-white/10 text-white text-xs rounded-lg mt-1"
                              />
                            </div>
                            <Switch
                              checked={limit.enabled}
                              onCheckedChange={async (val) => {
                                await apiRequest("PUT", `/api/admin/service-limits/${limit.id}`, { enabled: val });
                                queryClient.invalidateQueries({ queryKey: ["/api/admin/service-limits"] });
                              }}
                              className="data-[state=checked]:bg-purple-600"
                            />
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </>
        )}
      </main>

      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent className="bg-[#0B0D17] border-white/10 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-lg flex items-center gap-2">
              <Crown className="w-5 h-5 text-purple-400" />
              {editingPlan ? "Edit Plan" : "Create New Plan"} — Plan Creator
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Name (slug)</label>
                  <Input value={planForm.name} onChange={e => setPlanForm({ ...planForm, name: e.target.value })}
                    className="bg-[#111322] border-white/10 text-white rounded-lg text-sm" placeholder="pro" data-testid="input-plan-name" />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Display Name</label>
                  <Input value={planForm.displayName} onChange={e => setPlanForm({ ...planForm, displayName: e.target.value })}
                    className="bg-[#111322] border-white/10 text-white rounded-lg text-sm" placeholder="Pro Plan" data-testid="input-plan-display" />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/40 mb-1 block">Description</label>
                <Textarea value={planForm.description} onChange={e => setPlanForm({ ...planForm, description: e.target.value })}
                  className="bg-[#111322] border-white/10 text-white rounded-lg text-sm min-h-[50px]" data-testid="input-plan-desc" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Price/month</label>
                  <Input type="text" inputMode="decimal" value={planForm.priceMonthly}
                    onChange={e => setPlanForm({ ...planForm, priceMonthly: e.target.value })}
                    className="bg-[#111322] border-white/10 text-white rounded-lg text-sm" data-testid="input-plan-monthly" />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Price/year</label>
                  <Input type="text" inputMode="decimal" value={planForm.priceYearly}
                    onChange={e => setPlanForm({ ...planForm, priceYearly: e.target.value })}
                    className="bg-[#111322] border-white/10 text-white rounded-lg text-sm" data-testid="input-plan-yearly" />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Currency</label>
                  <Select value={planForm.currency} onValueChange={val => setPlanForm({ ...planForm, currency: val })}>
                    <SelectTrigger className="bg-[#111322] border-white/10 text-white rounded-lg text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111322] border-white/10 text-white">
                      {["EUR", "USD", "GBP"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-bold text-white">Module Configuration</h4>

                <div className="bg-[#111322] rounded-lg border border-white/5 overflow-hidden">
                  <div className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3">
                      <Switch checked={moduleConfig.aiComics} onCheckedChange={v => setModuleConfig({ ...moduleConfig, aiComics: v })} className="data-[state=checked]:bg-cyan-500" />
                      <span className="text-sm text-white">AI Comics {moduleConfig.aiComics ? <span className="text-cyan-400">(Enabled)</span> : <span className="text-white/30">(Disabled)</span>}</span>
                    </div>
                  </div>
                  {moduleConfig.aiComics && (
                    <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/50">Max Pages per Comic:</span>
                        <div className="flex items-center gap-3 w-48">
                          <Slider value={moduleConfig.maxPagesPerComic} onValueChange={v => setModuleConfig({ ...moduleConfig, maxPagesPerComic: v })} max={100} className="flex-1" />
                          <span className="text-xs text-white font-mono w-8 text-right">{moduleConfig.maxPagesPerComic[0]}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/50">Comics per Month:</span>
                        <div className="flex items-center gap-3 w-48">
                          <Slider value={moduleConfig.comicsPerMonth} onValueChange={v => setModuleConfig({ ...moduleConfig, comicsPerMonth: v })} max={50} className="flex-1" />
                          <span className="text-xs text-white font-mono w-8 text-right">{moduleConfig.comicsPerMonth[0]}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/50">Style Presets:</span>
                        <Select value={moduleConfig.stylePresets} onValueChange={v => setModuleConfig({ ...moduleConfig, stylePresets: v })}>
                          <SelectTrigger className="w-48 h-8 bg-black/50 border-white/10 text-xs rounded-lg"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-[#111322] border-white/10 text-white">
                            {["Standard", "Manga", "American Comics", "Chibi", "Realistic"].map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-[#111322] rounded-lg border border-white/5 overflow-hidden">
                  <div className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3">
                      <Switch checked={moduleConfig.aiVideos} onCheckedChange={v => setModuleConfig({ ...moduleConfig, aiVideos: v })} className="data-[state=checked]:bg-cyan-500" />
                      <span className="text-sm text-white">AI Videos {moduleConfig.aiVideos ? <span className="text-cyan-400">(Enabled)</span> : <span className="text-white/30">(Disabled)</span>}</span>
                    </div>
                  </div>
                  {moduleConfig.aiVideos && (
                    <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/50">Max Duration (seconds):</span>
                        <div className="flex items-center gap-3 w-48">
                          <Slider value={moduleConfig.maxDuration} onValueChange={v => setModuleConfig({ ...moduleConfig, maxDuration: v })} max={600} className="flex-1" />
                          <span className="text-xs text-white font-mono w-8 text-right">{moduleConfig.maxDuration[0]}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/50">Video Quality:</span>
                        <Select value={moduleConfig.videoQuality} onValueChange={v => setModuleConfig({ ...moduleConfig, videoQuality: v })}>
                          <SelectTrigger className="w-48 h-8 bg-black/50 border-white/10 text-xs rounded-lg"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-[#111322] border-white/10 text-white">
                            {["720p", "1080p", "4K"].map(q => <SelectItem key={q} value={q} className="text-xs">{q}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/50">Chapters per Project:</span>
                        <div className="flex items-center gap-3 w-48">
                          <Slider value={moduleConfig.chaptersPerProject} onValueChange={v => setModuleConfig({ ...moduleConfig, chaptersPerProject: v })} max={20} className="flex-1" />
                          <span className="text-xs text-white font-mono w-8 text-right">{moduleConfig.chaptersPerProject[0]}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {[
                  { key: "animatedShorts", label: "Animated Shorts" },
                  { key: "models3d", label: "3D Models" },
                  { key: "voiceGen", label: "Voice Gen" },
                ].map(mod => (
                  <div key={mod.key} className="bg-[#111322] rounded-lg border border-white/5 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={(moduleConfig as any)[mod.key]}
                        onCheckedChange={v => setModuleConfig({ ...moduleConfig, [mod.key]: v })}
                        className="data-[state=checked]:bg-cyan-500"
                      />
                      <span className="text-sm text-white">{mod.label} {(moduleConfig as any)[mod.key] ? <span className="text-cyan-400">(Enabled)</span> : <span className="text-white/30">(Disabled)</span>}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="text-xs text-white/40 mb-1 block">Features</label>
                <div className="flex gap-2 mb-2">
                  <Input value={newFeature} onChange={e => setNewFeature(e.target.value)}
                    placeholder="Add feature..." onKeyDown={e => {
                      if (e.key === 'Enter' && newFeature.trim()) {
                        setPlanForm({ ...planForm, features: [...planForm.features, newFeature.trim()] });
                        setNewFeature("");
                      }
                    }}
                    className="bg-[#111322] border-white/10 text-white rounded-lg text-sm flex-1" />
                  <Button size="sm" onClick={() => {
                    if (newFeature.trim()) {
                      setPlanForm({ ...planForm, features: [...planForm.features, newFeature.trim()] });
                      setNewFeature("");
                    }
                  }} className="bg-purple-600 hover:bg-purple-500 rounded-lg px-3">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-1">
                  {planForm.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-lg text-xs text-white/70">
                      <CheckCircle2 className="w-3 h-3 text-green-400 shrink-0" />
                      <span className="flex-1">{f}</span>
                      <button onClick={() => setPlanForm({ ...planForm, features: planForm.features.filter((_, fi) => fi !== i) })} className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-xl p-5 sticky top-4 space-y-4">
                <h4 className="text-lg font-bold text-cyan-300">Live Plan Summary</h4>

                <div>
                  <p className="text-xs text-white/40">Current Plan:</p>
                  <p className="text-sm font-bold text-white">{planForm.displayName || "Untitled Plan"}</p>
                </div>

                <div className="space-y-2 text-xs text-white/60">
                  <p>• AI Comics: {moduleConfig.aiComics ? `${moduleConfig.comicsPerMonth[0]}/month, ${moduleConfig.maxPagesPerComic[0]} pgs max.` : "Disabled"}</p>
                  <p>• AI Videos: {moduleConfig.aiVideos ? `${moduleConfig.videoQuality} quality, ${moduleConfig.chaptersPerProject[0]} chapters, ${moduleConfig.maxDuration[0]}s max.` : "Disabled"}</p>
                  <p>• Animated Shorts: {moduleConfig.animatedShorts ? "Enabled" : "Disabled"}</p>
                  <p>• 3D Models: {moduleConfig.models3d ? "Enabled" : "Disabled"}</p>
                  <p>• Voice Gen: {moduleConfig.voiceGen ? "Enabled" : "Disabled"}</p>
                </div>

                <div className="pt-3 border-t border-white/10">
                  <p className="text-sm text-white/40">Total Estimated Cost:</p>
                  <p className="text-2xl font-black text-white">${estimatedCost}/month</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSavePlan} disabled={!planForm.name || !planForm.displayName}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg gap-2"
                    data-testid="button-save-plan"
                  >
                    <Save className="w-4 h-4" /> Save Plan
                  </Button>
                  <Button variant="outline" onClick={() => setShowPlanDialog(false)}
                    className="border-white/10 text-white/60 hover:text-white rounded-lg">
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
